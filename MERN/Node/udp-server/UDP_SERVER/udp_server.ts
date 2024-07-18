import dgram from 'dgram';

// Create a UDP server socket
const server = dgram.createSocket('udp4');

// Event listener for when the server is ready
server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${address.address}:${address.port}`);
});

// Event listener for when the server receives a message
server.on('message', (message, remoteInfo) => {
    console.log(`Received message from ${remoteInfo.address}:${remoteInfo.port} - ${message}`);
    
    // Echo the message back to the sender
    server.send(message, remoteInfo.port, remoteInfo.address, (err) => {
        if (err) {
            console.error(`Error sending response: ${err.message}`);
        } else {
            console.log(`Response sent to ${remoteInfo.address}:${remoteInfo.port}`);
        }
    });
});

// Bind the server to a specific port and IP address
const PORT = 12345;
const HOST = '127.0.0.1';
server.bind(PORT, HOST);
