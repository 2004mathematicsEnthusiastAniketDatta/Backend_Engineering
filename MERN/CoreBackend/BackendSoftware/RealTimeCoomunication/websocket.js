import express from 'express';
import https from 'https';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import path from 'path';

// Create Express app
const app = express();
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Secure WebSocket Server');
});

// For development, you can generate self-signed certificates using:
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem

// SSL options - replace with your actual certificate paths
const sslOptions = {
  key: fs.readFileSync(path.resolve('path/to/key.pem')),
  cert: fs.readFileSync(path.resolve('path/to/cert.pem'))
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

// Create WebSocket server attached to HTTPS server
const wss = new WebSocketServer({ 
  server,
  // Add validation for connection origins
  verifyClient: (info) => {
    const origin = info.origin || info.req.headers.origin;
    // Validate against allowed origins
    const allowedOrigins = ['https://localhost:3000'];
    return allowedOrigins.includes(origin);
  }
});

// WebSocket server events
wss.on('connection', (ws, req) => {
  console.log('Client connected');
  
  // You could implement authentication here
  // const token = new URL(`https://example.com${req.url}`).searchParams.get('token');
  // if (!validateToken(token)) { ws.close(); return; }
  
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Secure WebSocket server running on port ${PORT}`);
});
