import tls from 'tls';
import dgram from 'dgram';
import { Buffer } from 'buffer';

class DNSOverTLS {
    constructor(options = {}) {
        this.servers = options.servers || [
            { host: '1.1.1.1', port: 853 },
            { host: '8.8.8.8', port: 853 },
            { host: '9.9.9.9', port: 853 }
        ];
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
        this.minTLSVersion = 'TLSv1.3';
        this.maxTLSVersion = 'TLSv1.3';
    }

    // Create DNS query packet
    createDNSQuery(domain, type = 1) {
        const id = Math.floor(Math.random() * 65536);
        const flags = 0x0100; // Standard query with recursion desired
        
        // Header (12 bytes)
        const header = Buffer.allocUnsafe(12);
        header.writeUInt16BE(id, 0);        // ID
        header.writeUInt16BE(flags, 2);     // Flags
        header.writeUInt16BE(1, 4);         // Questions
        header.writeUInt16BE(0, 6);         // Answer RRs
        header.writeUInt16BE(0, 8);         // Authority RRs
        header.writeUInt16BE(0, 10);        // Additional RRs

        // Question section
        const labels = domain.split('.');
        let questionLength = 0;
        const questionParts = [];

        labels.forEach(label => {
            const labelBuffer = Buffer.from(label);
            const lengthBuffer = Buffer.from([labelBuffer.length]);
            questionParts.push(lengthBuffer, labelBuffer);
            questionLength += 1 + labelBuffer.length;
        });

        questionParts.push(Buffer.from([0])); // Root label
        questionParts.push(Buffer.allocUnsafe(4));
        questionParts[questionParts.length - 1].writeUInt16BE(type, 0); // QTYPE
        questionParts[questionParts.length - 1].writeUInt16BE(1, 2);    // QCLASS (IN)
        questionLength += 5;

        return Buffer.concat([header, ...questionParts]);
    }

    // Parse DNS response
    parseDNSResponse(buffer) {
        if (buffer.length < 12) {
            throw new Error('Invalid DNS response: too short');
        }

        const header = {
            id: buffer.readUInt16BE(0),
            flags: buffer.readUInt16BE(2),
            questions: buffer.readUInt16BE(4),
            answers: buffer.readUInt16BE(6),
            authority: buffer.readUInt16BE(8),
            additional: buffer.readUInt16BE(10)
        };

        const rcode = header.flags & 0x0F;
        if (rcode !== 0) {
            throw new Error(`DNS query failed with RCODE: ${rcode}`);
        }

        let offset = 12;
        const answers = [];

        // Skip question section
        for (let i = 0; i < header.questions; i++) {
            while (offset < buffer.length && buffer[offset] !== 0) {
                const labelLength = buffer[offset];
                offset += labelLength + 1;
            }
            offset += 5; // Skip null terminator + QTYPE + QCLASS
        }

        // Parse answer section
        for (let i = 0; i < header.answers; i++) {
            const answer = this.parseResourceRecord(buffer, offset);
            answers.push(answer.record);
            offset = answer.newOffset;
        }

        return { header, answers };
    }

    parseResourceRecord(buffer, offset) {
        // Skip name (assuming compression)
        if ((buffer[offset] & 0xC0) === 0xC0) {
            offset += 2;
        } else {
            while (offset < buffer.length && buffer[offset] !== 0) {
                offset += buffer[offset] + 1;
            }
            offset += 1;
        }

        const type = buffer.readUInt16BE(offset);
        const class_ = buffer.readUInt16BE(offset + 2);
        const ttl = buffer.readUInt32BE(offset + 4);
        const rdLength = buffer.readUInt16BE(offset + 8);
        
        let data;
        if (type === 1 && rdLength === 4) { // A record
            data = Array.from(buffer.slice(offset + 10, offset + 10 + rdLength)).join('.');
        } else {
            data = buffer.slice(offset + 10, offset + 10 + rdLength);
        }

        return {
            record: { type, class: class_, ttl, data },
            newOffset: offset + 10 + rdLength
        };
    }

    // Establish TLS connection
    async createTLSConnection(server) {
        return new Promise((resolve, reject) => {
            const tlsOptions = {
                host: server.host,
                port: server.port,
                minVersion: this.minTLSVersion,
                maxVersion: this.maxTLSVersion,
                rejectUnauthorized: true,
                servername: server.host,
                timeout: this.timeout
            };

            const socket = tls.connect(tlsOptions, () => {
                if (socket.authorized) {
                    resolve(socket);
                } else {
                    reject(new Error(`TLS authorization failed: ${socket.authorizationError}`));
                }
            });

            socket.on('error', reject);
            socket.on('timeout', () => reject(new Error('TLS connection timeout')));
        });
    }

    // Send DNS query over TLS
    async queryDNS(domain, type = 1, serverIndex = 0) {
        if (serverIndex >= this.servers.length) {
            throw new Error('All DNS servers failed');
        }

        const server = this.servers[serverIndex];
        let socket;

        try {
            socket = await this.createTLSConnection(server);
            const query = this.createDNSQuery(domain, type);
            
            // DNS over TLS uses length-prefixed messages
            const lengthPrefix = Buffer.allocUnsafe(2);
            lengthPrefix.writeUInt16BE(query.length, 0);
            const message = Buffer.concat([lengthPrefix, query]);

            return new Promise((resolve, reject) => {
                let responseBuffer = Buffer.alloc(0);
                let expectedLength = null;

                const timeoutId = setTimeout(() => {
                    socket.destroy();
                    reject(new Error('Query timeout'));
                }, this.timeout);

                socket.on('data', (data) => {
                    responseBuffer = Buffer.concat([responseBuffer, data]);

                    if (expectedLength === null && responseBuffer.length >= 2) {
                        expectedLength = responseBuffer.readUInt16BE(0);
                    }

                    if (expectedLength !== null && responseBuffer.length >= expectedLength + 2) {
                        clearTimeout(timeoutId);
                        const dnsResponse = responseBuffer.slice(2, expectedLength + 2);
                        socket.end();
                        
                        try {
                            const parsed = this.parseDNSResponse(dnsResponse);
                            resolve(parsed);
                        } catch (parseError) {
                            reject(parseError);
                        }
                    }
                });

                socket.on('error', (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                });

                socket.write(message);
            });

        } catch (error) {
            if (socket) socket.destroy();
            
            // Try next server
            if (serverIndex < this.servers.length - 1) {
                return this.queryDNS(domain, type, serverIndex + 1);
            }
            throw error;
        }
    }

    // Public method to resolve domain
    async resolve(domain, type = 'A') {
        const typeMap = { A: 1, AAAA: 28, MX: 15, TXT: 16, NS: 2 };
        const queryType = typeMap[type.toUpperCase()] || 1;

        for (let attempt = 0; attempt < this.retries; attempt++) {
            try {
                const result = await this.queryDNS(domain, queryType);
                return result.answers.map(answer => answer.data);
            } catch (error) {
                if (attempt === this.retries - 1) {
                    throw new Error(`DNS resolution failed after ${this.retries} attempts: ${error.message}`);
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
}

// Usage example
export default DNSOverTLS;

// Example usage:
// const dns = new DNSOverTLS();
// dns.resolve('example.com').then(console.log).catch(console.error);

const dns = new DNSOverTLS();
dns.resolve('hussennasser.com').then(console.log).catch(console.error);