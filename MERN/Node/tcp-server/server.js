"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
//Define the host and port
var host = 'localhost';
var port = 9999;
//create a TCP server
var server = net.createServer(function (socket) {
    console.log('Got a connection from', socket.remoteAddress, socket.remotePort);
    //Send a thank you message to the client
    socket.write('Thank you for connecting to the server!\n');
    //closing the connection
    socket.end();
    //Handle errors
    socket.on('error', function (err) {
        console.error('Socket error:', err);
    });
});
//Start listening on the specified port and host
server.listen(port, host, function () {
    console.log("Server listening at ".concat(host, ":").concat(port));
});
//Handle server errors
server.on('error', function (err) {
    console.error('Server error:', err);
});
