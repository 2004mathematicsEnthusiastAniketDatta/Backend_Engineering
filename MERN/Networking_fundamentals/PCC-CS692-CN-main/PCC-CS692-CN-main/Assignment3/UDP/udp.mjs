import dgram from 'dgram';
import { EventEmitter } from 'events';

/**
 * Industrial-grade UDP Server implementation
 */
class UDPServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.port = options.port || 3000;
        this.host = options.host || 'localhost';
        this.socket = null;
        this.isListening = false;
        this.clients = new Map();
        this.messageQueue = [];
        this.maxQueueSize = options.maxQueueSize || 1000;
        this.timeout = options.timeout || 30000;
    }

    /**
     * Start the UDP server
     */
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = dgram.createSocket('udp4');
                
                this.socket.on('error', (err) => {
                    console.error(`UDP Server error: ${err.message}`);
                    this.emit('error', err);
                    reject(err);
                });

                this.socket.on('message', (msg, rinfo) => {
                    this.handleMessage(msg, rinfo);
                });

                this.socket.on('listening', () => {
                    const address = this.socket.address();
                    console.log(`UDP Server listening on ${address.address}:${address.port}`);
                    this.isListening = true;
                    this.emit('listening', address);
                    resolve(address);
                });

                this.socket.bind(this.port, this.host);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message, rinfo) {
        try {
            const clientKey = `${rinfo.address}:${rinfo.port}`;
            
            // Update client info
            this.clients.set(clientKey, {
                address: rinfo.address,
                port: rinfo.port,
                lastSeen: Date.now()
            });

            // Parse message
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message.toString());
            } catch {
                parsedMessage = { data: message.toString() };
            }

            const messageData = {
                ...parsedMessage,
                from: rinfo,
                timestamp: Date.now()
            };

            // Queue management
            if (this.messageQueue.length >= this.maxQueueSize) {
                this.messageQueue.shift(); // Remove oldest message
            }
            this.messageQueue.push(messageData);

            this.emit('message', messageData);
            
            // Send acknowledgment
            this.sendAck(rinfo);
            
        } catch (error) {
            console.error('Error handling message:', error);
            this.emit('error', error);
        }
    }

    /**
     * Send acknowledgment
     */
    sendAck(rinfo) {
        const ack = JSON.stringify({ 
            type: 'ack', 
            timestamp: Date.now() 
        });
        this.socket.send(ack, rinfo.port, rinfo.address);
    }

    /**
     * Send message to specific client
     */
    sendMessage(message, address, port) {
        return new Promise((resolve, reject) => {
            if (!this.isListening) {
                return reject(new Error('Server not listening'));
            }

            const data = typeof message === 'string' ? message : JSON.stringify(message);
            
            this.socket.send(data, port, address, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Broadcast message to all clients
     */
    broadcast(message) {
        const promises = [];
        this.clients.forEach((client) => {
            promises.push(
                this.sendMessage(message, client.address, client.port)
                    .catch(err => console.error(`Failed to send to ${client.address}:${client.port}`, err))
            );
        });
        return Promise.allSettled(promises);
    }

    /**
     * Get server statistics
     */
    getStats() {
        return {
            isListening: this.isListening,
            clientCount: this.clients.size,
            messageQueueLength: this.messageQueue.length,
            uptime: this.isListening ? Date.now() - this.startTime : 0,
            clients: Array.from(this.clients.entries()).map(([key, client]) => ({
                id: key,
                ...client
            }))
        };
    }

    /**
     * Clean up inactive clients
     */
    cleanupClients() {
        const now = Date.now();
        for (const [key, client] of this.clients.entries()) {
            if (now - client.lastSeen > this.timeout) {
                this.clients.delete(key);
                this.emit('clientTimeout', client);
            }
        }
    }

    /**
     * Stop the server
     */
    stop() {
        return new Promise((resolve) => {
            if (this.socket) {
                this.socket.close(() => {
                    this.isListening = false;
                    console.log('UDP Server stopped');
                    this.emit('closed');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

/**
 * Industrial-grade UDP Client implementation
 */
class UDPClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.serverHost = options.serverHost || 'localhost';
        this.serverPort = options.serverPort || 3000;
        this.socket = null;
        this.isConnected = false;
        this.retryAttempts = options.retryAttempts || 3;
        this.retryDelay = options.retryDelay || 1000;
    }

    /**
     * Connect to UDP server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.socket = dgram.createSocket('udp4');
                
                this.socket.on('error', (err) => {
                    console.error(`UDP Client error: ${err.message}`);
                    this.emit('error', err);
                });

                this.socket.on('message', (msg, rinfo) => {
                    try {
                        const message = JSON.parse(msg.toString());
                        this.emit('message', message, rinfo);
                    } catch {
                        this.emit('message', { data: msg.toString() }, rinfo);
                    }
                });

                this.isConnected = true;
                this.emit('connected');
                resolve();
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Send message with retry logic
     */
    async sendMessage(message, retries = this.retryAttempts) {
        if (!this.isConnected) {
            throw new Error('Client not connected');
        }

        const data = typeof message === 'string' ? message : JSON.stringify(message);
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                await new Promise((resolve, reject) => {
                    this.socket.send(data, this.serverPort, this.serverHost, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });
                return; // Success, exit retry loop
            } catch (error) {
                if (attempt === retries) {
                    throw error; // Last attempt failed
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        return new Promise((resolve) => {
            if (this.socket) {
                this.socket.close(() => {
                    this.isConnected = false;
                    this.emit('disconnected');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

/**
 * Factory function for creating UDP server
 */
export function createServer(options) {
    return new UDPServer(options);
}

/**
 * Factory function for creating UDP client
 */
export function createClient(options) {
    return new UDPClient(options);
}

export { UDPServer, UDPClient };