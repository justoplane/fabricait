import express from 'express';
import { config } from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import path from 'path';
import { PromptManager } from "./PromptManager";
import { getPreprompt } from "./PrepromptGenerator";
import { extractAndWriteSCAD, extractCustomParameters, writeCustomParameters } from "./parse";
import { promises as fs } from 'fs';

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
const handlePrompt = async (prompt: string, PM: PromptManager) => {
  try {
    // Make an API call to the AI model.
    const out = await PM.userAction(prompt);
    // Extract scad file from AI resonse and write to input.scad
    await extractAndWriteSCAD(out, './assets/input.scad');
    // Generate stl file and params
    genSTL(out);
  } catch (error) {
    console.error('Error processing prompt:', error);
    io.emit('error', 'Failed to process prompt');
  }
};

const updateParams = async (params: any) => {
  try {
    // update params in scad file
    const data = await fs.readFile('./assets/input.scad', 'utf-8');
    await writeCustomParameters(data, params, './assets/input.scad');

    // Convert new scad data to stl
    await scadToStl();

    // Emit the STL file update
    io.emit('stl', params);
    console.log('stl/params emitted');
  } catch (error) {
    console.error('Error processing prompt:', error);
    io.emit('error', 'Failed to process prompt');
  }
};

const genSTL = async (out: string) => {
      // Write the output to a file

      // Extract custom parameters from the prompt
      const params = await extractCustomParameters(out);
      console.log('Custom parameters:', params);
  
      // Convert received scad to stl
      await scadToStl();
      
      // Emit the STL file update
      io.emit('stl', params);
      console.log('stl/params emitted');
};

const testparsing = async () => {
  try {
    const data = await fs.readFile('./assets/input.scad', 'utf-8');
    const params = await extractCustomParameters(data);
    console.log(params);
    io.emit('stl', params);
    console.log('stl/params emitted');
  } catch (error) {
      console.error('Error reading file:', error);
      throw error;
  }
};

// Convert scad to stl
const scadToStl = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(`openscad -o ./assets/output.stl ./assets/input.scad`, (error, stdout, stderr) => {
      if (error) {
        console.error(`OpenSCAD execution error: ${error.message}`);
        io.emit('error', 'OpenSCAD failed to generate STL');
        reject(error);
        return;
      }
      if (stdout) {
        console.log(`stdout: ${stdout}`);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      resolve(); // Resolve after execution completes
    });
  });
};

io.on('connection', (socket) => {
  console.log('a user connected');
  const PM = new PromptManager(getPreprompt());

  // Listen for text prompts from the client.
  socket.on('message', async (prompt) => {
    console.log('prompt received:', prompt);
    //handlePrompt(prompt, PM);
    testparsing();
  });

  socket.on('message', (message) => {
    console.log('message received:', message);
    io.emit('message', message);
  });

  socket.on('params', (params) => {
    // Put received parameters back into scad file
    updateParams(params);
    console.log('params received:', params);
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
