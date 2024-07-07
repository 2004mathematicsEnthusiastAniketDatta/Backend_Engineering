import * as net from 'net';
//Define the host and port
const host = 'localhost';
const port = 9999;
//create a TCP server
const server = net.createServer((socket) => {
    console.log('Got a connection from',socket.remoteAddress,socket.remotePort);
    //Send a thank you message to the client
    socket.write('Thank you for connecting to the server!\n');
    //closing the connection
    socket.end();
    //Handle errors
    socket.on('error',(err) => {
        console.error('Socket error:',err);
    });
});

//Start listening on the specified port and host
server.listen(port, host, () => {
    console.log(`Server listening at ${host}:${port}`);
});

//Handle server errors
server.on('error', (err) => {
    console.error('Server error:',err);
});



