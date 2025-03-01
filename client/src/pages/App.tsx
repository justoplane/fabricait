import { useEffect, useState } from 'react';
import { Link } from 'react-router';
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
  const [image, setImage] = useState<File | null>(null);

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

  const emitParamChanges = () => {
    // Emit the updated parameters to the server
    console.log("WOrking?")
    socket.emit('params', parameters);
  };

  const calcMax = (value: number) => {
    // Calculate the max value for the range input
    const max = value * 2
    return max;
  };

  const calcStep = (value: number) => {
    // Calculate the step value for the range input
    const step = (value*2) / 100;
    return step;
  };

  const STLModel = ({ url }: { url: string }) => {
    // Use useLoader to load the STL file
    const geometry = useLoader(STLLoader, url) as THREE.BufferGeometry;
  
    return (
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  };

  // Image uploads
  
  interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList };
  }

  const handleImageChange = (event: ImageChangeEvent) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Image uploaded successfully! URL: " + data.imageUrl);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Ground Plane Component
  const GroundPlane = () => {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    );
  };

  return (
    <div className="App">
      <header>
        <Link to="/"><img src="fabricait.png" alt="Frabricate logo"/></Link>
        <ul>
          <li><Link to="/results">How It Works</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/donate">Donate</Link></li>
        </ul>
        </header>
      <section id="main">
      <div className="sidebar">
        <button onClick={emitParamChanges}>Update Parameters</button>
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
          <Canvas 
            camera={{ position: [0, 50, 200] }} 
            shadows // Enable shadow support
          >
            {/* Lighting for shading */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 20, 10]} 
              intensity={1.5} 
              castShadow 
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[10, 10, 10]} />

            {/* Render STL Model */}
            <Suspense fallback={null}>
              <STLModel url={stlUrl} />
            </Suspense>

            {/* Add Ground Plane */}
            <GroundPlane />

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
        <div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
      </div>
      </section>
      
    </div>
  );
}

export default App;
