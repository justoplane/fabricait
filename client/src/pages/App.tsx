import { useEffect, useState } from 'react';
import './App.css';
import { socket } from '../socket';
import { Link } from 'react-router';
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber"; // Import useLoader from @react-three/fiber directly
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"; // Make sure STLLoader is correctly imported
import { Suspense } from "react";
import * as THREE from 'three';


function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');


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

    socket.on('stl', (data: string) => {
      // write data to stl file

      console.log('stl received at client:', data);
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('message');
    };
  }, []);

  /* Fetch the STL file and print its content */
  useEffect(() => {
    fetch('/assets')
      .then(response => response.text())
      .then(data => {
        console.log('STL file content:', data);
      })
      .catch(error => {
        console.error('Error fetching STL file:', error);
      });
  }, []);
  

  /* Submit the form and send variable to server */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
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
      <div>
        <Link to="/results">Results</Link>
      </div>
      <div>
        <a href="/download">Download</a> 
      </div>

      <div>
        <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
        <STLModel url="/assets" />
        </Suspense>
        <OrbitControls />
        </Canvas>
    </div>
     <div className="messages">
        {messages.map((message, index) => (
          <div 
            key={index}
            >
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
    </div>
  );
}

export default App;