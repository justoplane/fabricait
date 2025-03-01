import express from 'express';
import { config } from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { data } from 'react-router';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// load environment variables
config();

const app = express();

// we wrap the express app in a node http server so that we can
// expose the server to socket.io later on.
const server = http.createServer(app);
const io = new Server(server);
const port = parseInt(process.env.PORT || '3000');

// Callback function to handle receiving a prompt
const handlePrompt = async (prompt: string) => {
  // Make an API call to the AI model.


  // Convert received scad to stl
  scadToStl();
  
  // Read the content of dp.stl file
  const stlFilePath = path.join(__dirname, 'assets', 'dp.stl');
  fs.readFile(stlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the STL file:', err);
      return; 
    }
    // Emit the STL file content
    io.emit('stl', data);
  });
};

// Convert scad to stl
const scadToStl = async() => {
  exec(`openscad -o ./assets/output.stl ./assets/input.scad`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
});
}

io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for text prompts from the client.
  socket.on('message', (prompt) => {
    console.log('prompt received:', prompt);
    handlePrompt(prompt);
  });

  socket.on('message', (message) => {
    console.log('message received:', message);

    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// a simple middleware the redirects
// to the asset server if the request
// path contains a dot. We use the dot
// to differentiate between asset requests
// and normal requests because file names have
// dots in them.
app.use((req, res, next) => {
  if (req.path.includes(".")) {
    res.redirect(process.env.ASSET_URL + req.path);
    return;
  }
  next();
});

// Serve the Download to the user
app.get('/assets', (req, res) => {
  const filePath = path.resolve(__dirname, 'assets', 'output.stl'); // Path to the file you want to send
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('File sending failed');
    }
  });
});

// Serve the Download to the user
app.get('/download', (req, res) => {
  const filePath = './assets/input.scad'; // Path to the file you want to send
  res.download(filePath, 'generated_model.scad', (err) => {
    if (err) {
      console.error('Error downloading the file:', err);
      res.status(500).send('File download failed');
    }
  });
});

app.get('*', (req, res) => {
  console.log(req);
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fabricait</title>
        <script type="module">
          import RefreshRuntime from '${process.env.ASSET_URL}/@react-refresh'
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
        </script>
        <script type="module" src="${process.env.ASSET_URL}/@vite/client"></script>
        </head>
        <body>
        <div id="root"></div>
        <script type="module" src="${process.env.ASSET_URL}/src/main.tsx"></script>
      </body>
    </html>
    `);
});

