import dgram from 'dgram';
import crypto from 'crypto';
import readline from 'readline';

class DNSServer {
    constructor(port = 53, domain = 'example.com') {
        this.port = port;
        this.domain = domain.toLowerCase();
        this.socket = dgram.createSocket('udp4');
        this.cache = new Map();
        this.records = new Map();
        this.rateLimiter = new Map();
        
        // Initialize with domain-specific records
        this.initializeRecords();
        this.setupEventHandlers();
    }

    initializeRecords() {
        // A records
        this.records.set(this.domain, { type: 'A', value: '192.168.1.100', ttl: 300 });
        this.records.set(`www.${this.domain}`, { type: 'A', value: '192.168.1.101', ttl: 300 });
        this.records.set(`api.${this.domain}`, { type: 'A', value: '192.168.1.102', ttl: 300 });
        
        // AAAA records (IPv6)
        this.records.set(`ipv6.${this.domain}`, { type: 'AAAA', value: '2001:db8::1', ttl: 300 });
        
        // CNAME records
        this.records.set(`mail.${this.domain}`, { type: 'CNAME', value: `www.${this.domain}`, ttl: 300 });
        this.records.set(`cdn.${this.domain}`, { type: 'CNAME', value: 'cloudfront.amazonaws.com', ttl: 300 });
        
        // MX records
        this.records.set(this.domain, { type: 'MX', value: `10 mail.${this.domain}`, ttl: 300 });
        
        // TXT records
        this.records.set(`_verification.${this.domain}`, { type: 'TXT', value: 'verification-token-123', ttl: 300 });
    }

    setupEventHandlers() {
        this.socket.on('message', (msg, rinfo) => {
            this.handleDNSQuery(msg, rinfo);
        });

        this.socket.on('error', (err) => {
            console.error('DNS Server Error:', err);
        });

        this.socket.on('listening', () => {
            const address = this.socket.address();
            console.log(`DNS Server listening on ${address.address}:${address.port}`);
            console.log(`Serving DNS records for domain: ${this.domain}`);
        });
    }

    async handleDNSQuery(buffer, rinfo) {
        try {
            // Rate limiting
            if (!this.checkRateLimit(rinfo.address)) {
                console.log(`Rate limit exceeded for ${rinfo.address}`);
                return;
            }

            const query = this.parseDNSQuery(buffer);
            if (!query) return;

            console.log(`DNS Query: ${query.name} (${query.type}) from ${rinfo.address}:${rinfo.port}`);

            // Check cache first
            const cacheKey = `${query.name}:${query.type}`;
            let response = this.cache.get(cacheKey);

            if (!response || Date.now() > response.expires) {
                // Generate response
                response = this.generateDNSResponse(query);
                if (response && response.answer) {
                    // Cache the response
                    this.cache.set(cacheKey, {
                        ...response,
                        expires: Date.now() + (response.ttl * 1000)
                    });
                }
            }

            if (response) {
                const responseBuffer = this.buildDNSResponse(query, response);
                this.socket.send(responseBuffer, rinfo.port, rinfo.address);
            }

        } catch (error) {
            console.error('Error handling DNS query:', error);
        }
    }

    parseDNSQuery(buffer) {
        try {
            const header = {
                id: buffer.readUInt16BE(0),
                flags: buffer.readUInt16BE(2),
                questions: buffer.readUInt16BE(4),
                answers: buffer.readUInt16BE(6),
                authority: buffer.readUInt16BE(8),
                additional: buffer.readUInt16BE(10)
            };

            if (header.questions !== 1) return null;

            let offset = 12;
            let name = '';
            
            // Parse domain name
            while (offset < buffer.length) {
                const length = buffer.readUInt8(offset);
                if (length === 0) {
                    offset++;
                    break;
                }
                
                if (name) name += '.';
                name += buffer.toString('utf8', offset + 1, offset + 1 + length);
                offset += length + 1;
            }

            const type = buffer.readUInt16BE(offset);
            const qclass = buffer.readUInt16BE(offset + 2);

            return {
                id: header.id,
                name: name.toLowerCase(),
                type: this.getTypeString(type),
                class: qclass
            };
        } catch (error) {
            console.error('Error parsing DNS query:', error);
            return null;
        }
    }

    generateDNSResponse(query) {
        const record = this.records.get(query.name);
        
        if (!record) {
            return {
                found: false,
                rcode: 3 // NXDOMAIN
            };
        }

        if (record.type !== query.type && query.type !== 'ANY') {
            return {
                found: false,
                rcode: 0 // NOERROR but no answer
            };
        }

        return {
            found: true,
            answer: record.value,
            type: record.type,
            ttl: record.ttl,
            rcode: 0
        };
    }

    buildDNSResponse(query, response) {
        const buffer = Buffer.alloc(512);
        let offset = 0;

        // Header
        buffer.writeUInt16BE(query.id, offset); // ID
        offset += 2;
        
        let flags = 0x8000; // QR bit set (response)
        flags |= (response.rcode & 0xF); // RCODE
        if (response.found) flags |= 0x0400; // AA bit
        
        buffer.writeUInt16BE(flags, offset); // Flags
        offset += 2;
        
        buffer.writeUInt16BE(1, offset); // Questions
        offset += 2;
        
        buffer.writeUInt16BE(response.found ? 1 : 0, offset); // Answers
        offset += 2;
        
        buffer.writeUInt16BE(0, offset); // Authority
        offset += 2;
        
        buffer.writeUInt16BE(0, offset); // Additional
        offset += 2;

        // Question section
        const nameParts = query.name.split('.');
        for (const part of nameParts) {
            buffer.writeUInt8(part.length, offset);
            offset++;
            buffer.write(part, offset);
            offset += part.length;
        }
        buffer.writeUInt8(0, offset); // End of name
        offset++;
        
        buffer.writeUInt16BE(this.getTypeCode(query.type), offset); // Type
        offset += 2;
        
        buffer.writeUInt16BE(1, offset); // Class (IN)
        offset += 2;

        // Answer section
        if (response.found) {
            // Name (pointer to question)
            buffer.writeUInt16BE(0xC00C, offset);
            offset += 2;
            
            // Type
            buffer.writeUInt16BE(this.getTypeCode(response.type), offset);
            offset += 2;
            
            // Class
            buffer.writeUInt16BE(1, offset);
            offset += 2;
            
            // TTL
            buffer.writeUInt32BE(response.ttl, offset);
            offset += 4;
            
            // Data
            if (response.type === 'A') {
                buffer.writeUInt16BE(4, offset); // Data length
                offset += 2;
                const ip = response.answer.split('.');
                for (const octet of ip) {
                    buffer.writeUInt8(parseInt(octet), offset);
                    offset++;
                }
            } else if (response.type === 'CNAME') {
                const nameData = this.encodeName(response.answer);
                buffer.writeUInt16BE(nameData.length, offset);
                offset += 2;
                nameData.copy(buffer, offset);
                offset += nameData.length;
            }
        }

        return buffer.slice(0, offset);
    }

    encodeName(name) {
        const buffer = Buffer.alloc(256);
        let offset = 0;
        const parts = name.split('.');
        
        for (const part of parts) {
            buffer.writeUInt8(part.length, offset);
            offset++;
            buffer.write(part, offset);
            offset += part.length;
        }
        buffer.writeUInt8(0, offset);
        offset++;
        
        return buffer.slice(0, offset);
    }

    checkRateLimit(ip) {
        const now = Date.now();
        const key = ip;
        const limit = this.rateLimiter.get(key) || { count: 0, window: now };
        
        // Reset window every minute
        if (now - limit.window > 60000) {
            limit.count = 0;
            limit.window = now;
        }
        
        limit.count++;
        this.rateLimiter.set(key, limit);
        
        // Allow 100 queries per minute per IP
        return limit.count <= 100;
    }

    getTypeString(typeCode) {
        const types = {
            1: 'A',
            2: 'NS',
            5: 'CNAME',
            15: 'MX',
            16: 'TXT',
            28: 'AAAA',
            255: 'ANY'
        };
        return types[typeCode] || 'UNKNOWN';
    }

    getTypeCode(typeString) {
        const codes = {
            'A': 1,
            'NS': 2,
            'CNAME': 5,
            'MX': 15,
            'TXT': 16,
            'AAAA': 28,
            'ANY': 255
        };
        return codes[typeString] || 1;
    }

    addRecord(name, type, value, ttl = 300) {
        this.records.set(name.toLowerCase(), { type, value, ttl });
        console.log(`Added DNS record: ${name} ${type} ${value}`);
    }

    removeRecord(name) {
        this.records.delete(name.toLowerCase());
        console.log(`Removed DNS record: ${name}`);
    }

    clearCache() {
        this.cache.clear();
        console.log('DNS cache cleared');
    }

    getStats() {
        return {
            domain: this.domain,
            records: this.records.size,
            cacheEntries: this.cache.size,
            rateLimitEntries: this.rateLimiter.size
        };
    }

    listRecords() {
        console.log(`\nDNS Records for ${this.domain}:`);
        for (const [name, record] of this.records.entries()) {
            console.log(`${name} ${record.type} ${record.value} (TTL: ${record.ttl})`);
        }
    }

    start() {
        this.socket.bind(this.port);
        
        // Cleanup old cache entries every 5 minutes
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (now > entry.expires) {
                    this.cache.delete(key);
                }
            }
        }, 300000);
        
        // Cleanup rate limiter every hour
        setInterval(() => {
            this.rateLimiter.clear();
        }, 3600000);
    }

    stop() {
        this.socket.close();
        console.log('DNS Server stopped');
    }
}

// Interactive setup function
async function setupDNSServer() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
        console.log('=== DNS Server Configuration ===');
        
        const domain = await question('Enter domain name (e.g., mydomain.com): ');
        if (!domain.trim()) {
            console.log('Domain name is required!');
            process.exit(1);
        }

        const portInput = await question('Enter port number (default 5353): ');
        const port = parseInt(portInput) || 5353;

        console.log('\n=== Starting DNS Server ===');
        const dnsServer = new DNSServer(port, domain.trim());
        
        // Start the server
        dnsServer.start();
        
        // Show initial records
        dnsServer.listRecords();
        
        console.log('\n=== Server Commands ===');
        console.log('Type "help" for available commands');
        console.log('Type "quit" to stop the server\n');

        // Interactive command loop
        const commandLoop = async () => {
            while (true) {
                const command = await question('DNS> ');
                const parts = command.trim().split(' ');
                const cmd = parts[0].toLowerCase();

                switch (cmd) {
                    case 'help':
                        console.log('Available commands:');
                        console.log('  add <name> <type> <value> [ttl] - Add DNS record');
                        console.log('  remove <name> - Remove DNS record');
                        console.log('  list - List all records');
                        console.log('  stats - Show server statistics');
                        console.log('  clear - Clear cache');
                        console.log('  quit - Stop server');
                        break;
                    
                    case 'add':
                        if (parts.length >= 4) {
                            const ttl = parseInt(parts[4]) || 300;
                            dnsServer.addRecord(parts[1], parts[2], parts[3], ttl);
                        } else {
                            console.log('Usage: add <name> <type> <value> [ttl]');
                        }
                        break;
                    
                    case 'remove':
                        if (parts[1]) {
                            dnsServer.removeRecord(parts[1]);
                        } else {
                            console.log('Usage: remove <name>');
                        }
                        break;
                    
                    case 'list':
                        dnsServer.listRecords();
                        break;
                    
                    case 'stats':
                        console.log('Server Statistics:', dnsServer.getStats());
                        break;
                    
                    case 'clear':
                        dnsServer.clearCache();
                        break;
                    
                    case 'quit':
                    case 'exit':
                        dnsServer.stop();
                        rl.close();
                        process.exit(0);
                        
                    default:
                        if (command.trim()) {
                            console.log('Unknown command. Type "help" for available commands.');
                        }
                }
            }
        };

        commandLoop();

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\nShutting down DNS server...');
            dnsServer.stop();
            rl.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('Error setting up DNS server:', error);
        rl.close();
        process.exit(1);
    }
}

// Start the interactive setup
setupDNSServer();

export default DNSServer;