import { useEffect, useState } from 'react';
import './App.css';
import { socket } from '../socket';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber"; // Import useLoader from @react-three/fiber directly
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"; // Make sure STLLoader is correctly imported
import { Suspense } from "react";
import * as THREE from 'three';

interface CustomParameter {
  param_name: string;
  value: number;
  description: string;
}

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [parameters, setParameters] = useState<CustomParameter[]>([]);  // Updated to store CustomParameter objects
  const [input, setInput] = useState('');
  const [stlUrl, setStlUrl] = useState('/assets');

  /* Code to handle communication with the server */
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log("Connected.");
    });

    // Receive message back from server and update message log
    socket.on('message', (message: string) => {
      console.log('message received at client:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Update stl render
    socket.on('stl', (params: CustomParameter[]) => {
      console.log('stl/params received at client');
      setParameters(params);
      setStlUrl(`/assets?timestamp=${Date.now()}`);
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('message');
    };
  }, []);  

  /* Submit the form and send variable to server */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
  };

  const handleSliderChange = (index: number, newValue: number) => {
    // Update the parameter value locally (if needed, you could also emit this change to the server)
    setParameters((prevParameters) => {
      const updatedParameters = [...prevParameters];
      updatedParameters[index].value = newValue;
      return updatedParameters;
    });
  };

  const STLModel = ({ url }: { url: string }) => {
    // Use useLoader to load the STL file
    const geometry = useLoader(STLLoader, url) as THREE.BufferGeometry;
  
    return (
      <mesh geometry={geometry}>
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  };

  return (
    <div className="App">
      <div className="sidebar">
        <div className="map">
          {parameters.map((parameter, index) => (
            <div key={index} className="parameter-item">
              <div className="parameter-name">
                {parameter.param_name}
              </div>
              <input
                type="range"
                min="0"
                max="100" // Set max to your required value or dynamically calculate it
                step="1"
                value={parameter.value}
                onChange={(e) => handleSliderChange(index, parseInt(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{parameter.value}</span>
              <div className="description">
                {parameter.description}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="canvas-container">
          <Canvas camera={{ position: [0, 0, 200] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Suspense fallback={null}>
              <STLModel url={stlUrl} />
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index}>
              {message}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
          />
          <button type="submit">Send</button>
        </form>
        <div>
          <a href="/download">Download</a> 
        </div>
      </div>
    </div>
  );
}

export default App;
