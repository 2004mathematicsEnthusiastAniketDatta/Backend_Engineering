import WebSocket from "ws";



// Start the WebSocket server
const server = new WebSocket.Server({ port: 3000 });
server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
    socket.send(`Echo: ${message}`);
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});
console.log("WebSocket server is listening on port 3000");

// Create client after a short delay to ensure server is ready
setTimeout(() => {
  const socket = new WebSocket("ws://localhost:3000");
  
  socket.onmessage = (event) => {
    console.log(`Message from server: ${event.data}`);
  };
  
  socket.onopen = () => {
    socket.send("Hello from the client!");
  };
  
  socket.onclose = () => {
    console.log("Connection closed");
  };
  
  socket.onerror = (error) => {   
    console.error(`WebSocket error: ${error.message}`);
  };
}, 1000);


