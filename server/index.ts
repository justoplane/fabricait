import express from 'express';
import { config } from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { data } from 'react-router';

const prisma = new PrismaClient();

// load environment variables
config();

const app = express();

// slightly modified version of the code we wrote in class.
// we wrap the express app in a node http server so that we can
// expose the server to socket.io later on.
const server = http.createServer(app);
const io = new Server(server);
const port = parseInt(process.env.PORT || '3000');


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

app.post('/api/count', async (req, res) => {
  const count = await prisma.count.findFirst({
    where: {
      id: 1
    }
  });
  if (count) {
    await prisma.count.update({
      where: {
        id: 1
      },
      data: {
        value: count.value + 1
      }
    });
    res.json({ value: count.value + 1 });
  } else {
    await prisma.count.create({
      data: {
        value: 1
      }
    });
    res.json({ value: 1 });
  }
});

app.get("/api/count", async (req, res) => {
  const count = await prisma.count.findFirst({
    where: {
      id: 1
    }
  });
  if (count) {
    res.json({ value: count.value });
  } else {
    res.json({ value: 0 });
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

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

app.get('*', (req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="${process.env.ASSET_URL}/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React-Express Starter App</title>
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

