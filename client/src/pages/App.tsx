import { useEffect, useState } from 'react';
import './App.css';
import { socket } from '../socket';
import { Link } from 'react-router';


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

  return (
    <div className="App">
      <div>
        <Link to="/results">Results</Link> 
      </div>
      <h1>Fabricait</h1>
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