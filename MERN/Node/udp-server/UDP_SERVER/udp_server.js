"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
// Create a UDP server socket
var server = dgram_1.default.createSocket('udp4');
// Event listener for when the server is ready
server.on('listening', function () {
    var address = server.address();
    console.log("Server listening on ".concat(address.address, ":").concat(address.port));
});
// Event listener for when the server receives a message
server.on('message', function (message, remoteInfo) {
    console.log("Received message from ".concat(remoteInfo.address, ":").concat(remoteInfo.port, " - ").concat(message));
    // Echo the message back to the sender
    server.send(message, remoteInfo.port, remoteInfo.address, function (err) {
        if (err) {
            console.error("Error sending response: ".concat(err.message));
        }
        else {
            console.log("Response sent to ".concat(remoteInfo.address, ":").concat(remoteInfo.port));
        }
    });
});
// Bind the server to a specific port and IP address
var PORT = 12345;
var HOST = '127.0.0.1';
server.bind(PORT, HOST);
