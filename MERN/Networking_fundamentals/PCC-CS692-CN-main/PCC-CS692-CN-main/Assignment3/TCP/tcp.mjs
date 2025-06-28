import net from 'net';


const server = net.createServer((socket) => {
    console.log('Client connected:', socket.remoteAddress, socket.remotePort);

    socket.on('data', (data) => {
        console.log('Received data:', data.toString());
        socket.write('Echo: ' + data);
    });

    socket.on('end', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});
server.on('error', (err) => {
    console.error('Server error:', err);
});
server.listen(8080, () => {
    console.log('Server listening on port 8080');
});
// To run the server, use the command: node tcp.mjs

