import { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket';
import { Link } from 'react-router';


function App() {
  const [connected, setConnected] = useState(socket.connected);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [decryptionPassword, setDecryptionPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [count, setCount] = useState(0);  

// count


  useEffect(() => {
    async function getCount() {
      const response = await fetch('/api/count');
      const data = await response.json();
      setCount(data.value);
    }
    getCount();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      setConnected(true);
    });

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
  
async function updateCount() {
  const response = await fetch('/api/count', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count })
  });
  const data = await response.json();
  setCount(data.value);
}
  const handleCountButton = () => {
    setCount(count + 1);
    updateCount();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && password.trim()) {
      socket.emit('message', password);
      setInput('');
      setPassword('');
    }
  };

  const handleDecryption = (e: React.FormEvent) => {
    e.preventDefault();
    if (decryptionPassword.trim()) {
      if (password.trim()){
        setSelectedMessage(password);
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // Hide toast after 3 seconds
      }
      setDecryptionPassword('');
    }
  };

  const togglePopup = (message?: string) => {
    if (message) {
      setSelectedMessage(message);
    }
    setShowPopup(!showPopup);
  };

  return (
    <div className="App">
      <div>
        <Link to="/results">Results</Link> 
        <button onClick={() => handleCountButton()}>{count}</button>
      </div>
      <h1>Spy Chat</h1>
      <div className="messages">
        {messages.map((message, index) => (
          <div 
            onClick={() => togglePopup(message)}
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
        <input
         type="text"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         placeholder="Type a password"
         />
        <button type="submit">Send</button>
      </form>
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Decrypt Message</h2>
            <p>{selectedMessage}</p>
            <form onSubmit={handleDecryption}>
              <input              
                className="popup-inner-input"
                type="text"
                value={decryptionPassword}
                onChange={(e) => setDecryptionPassword(e.target.value)}
                placeholder="Type a password to decrypt"
              />
              <button type="submit">Decrypt</button>
            </form>
            <button onClick={() => togglePopup()}>Close</button>
          {showToast && (
            <div className="toast">
              Invalid password. Please try again.
            </div>
          )}
          </div>
        </div>
        )}
    </div>
  );
}

export default App;