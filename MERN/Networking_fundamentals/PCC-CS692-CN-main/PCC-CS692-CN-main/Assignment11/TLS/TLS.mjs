import crypto from 'crypto';
import { EventEmitter } from 'events';

/**  Transport Layer Security (TLS) Protocol Implementation
 *  Vanilla HTTP -> HTTPS -> TLS 1.2 Handshake -> Diffie Hellman Key Exchange -> TLS 1.3 Handshake
 *  Encryption with symmetric key algorithms.
 * PKI (Public Key Infrastructure) is used for secure key exchange.
 * We need to exchange the symmetric key securely between the client and server.
 * Key excahange  requires assymmetric encryption algorithms in  Public key Infrastructure.
 * Authentication of the server
 * Extensions : SNI (Server Name Indication), ALPN (Application-Layer Protocol Negotiation),Preshared ,ORTT
 *A symmetric key is a single, secret key used by both the sender and receiver to encrypt and decrypt messages in symmetric key cryptography.  
 *This means the same key is used for both encryption and decryption processes. It's a foundational concept in cryptography, offering speed and efficiency but requiring secure key exchange.  
 * Asymmetric keys, also known as public-private key pairs, are fundamental to asymmetric cryptography. They consist of two mathematically linked keys: a public key, which can be freely shared, and a private key, which must be kept secret. 
 * This system allows for secure communication and digital signatures. 
 * Diffie- Hellman key exchange for securely exchanging cryptographic keys over a public channel:
 * Private key x : 🔑
 * public key g,n : 🗝
 * Private key y : 🔐
 * public / unbreakable key that can be shared : g ^ x % n
 * public / unbreakable key that can be shared : g ^ y % n 
 * (g ^ x % n ) ^ y = g ^ (x * y) % n
 * (g ^ y % n ) ^ x = g ^ (x * y) % n
 */


// TLS Protocol Constants
const TLS_VERSIONS = {
    TLS_1_2: 0x0303,
    TLS_1_3: 0x0304
};

const CIPHER_SUITES = {
    TLS_AES_128_GCM_SHA256: 0x1301,
    TLS_AES_256_GCM_SHA384: 0x1302,
    TLS_CHACHA20_POLY1305_SHA256: 0x1303,
    TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256: 0xC02F,
    TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384: 0xC030
};

const HANDSHAKE_TYPES = {
    CLIENT_HELLO: 1,
    SERVER_HELLO: 2,
    CERTIFICATE: 11,
    SERVER_KEY_EXCHANGE: 12,
    CERTIFICATE_REQUEST: 13,
    SERVER_HELLO_DONE: 14,
    CERTIFICATE_VERIFY: 15,
    CLIENT_KEY_EXCHANGE: 16,
    FINISHED: 20
};

const EXTENSIONS = {
    SERVER_NAME: 0,
    ALPN: 16,
    SUPPORTED_GROUPS: 10,
    KEY_SHARE: 51,
    PRE_SHARED_KEY: 41
};

// Diffie-Hellman Key Exchange Implementation
class DiffieHellman {
    constructor(prime = null, generator = 2) {
        this.prime = prime || this.generateSafePrime(2048);
        this.generator = BigInt(generator);
        this.privateKey = this.generatePrivateKey();
        this.publicKey = this.generatePublicKey();
    }

    generateSafePrime(bits) {
        // Using a well-known safe prime for demonstration
        return BigInt('0xFFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF');
    }

    generatePrivateKey() {
        return BigInt('0x' + crypto.randomBytes(32).toString('hex'));
    }

    generatePublicKey() {
        return this.modPow(this.generator, this.privateKey, this.prime);
    }

    computeSharedSecret(otherPublicKey) {
        return this.modPow(BigInt(otherPublicKey), this.privateKey, this.prime);
    }

    modPow(base, exponent, modulus) {
        let result = 1n;
        base = base % modulus;
        while (exponent > 0n) {
            if (exponent % 2n === 1n) {
                result = (result * base) % modulus;
            }
            exponent = exponent >> 1n;
            base = (base * base) % modulus;
        }
        return result;
    }
}

// TLS Record Layer
class TLSRecord {
    static CONTENT_TYPES = {
        CHANGE_CIPHER_SPEC: 20,
        ALERT: 21,
        HANDSHAKE: 22,
        APPLICATION_DATA: 23
    };

    constructor(type, version, data) {
        this.type = type;
        this.version = version;
        this.length = data.length;
        this.data = data;
    }

    serialize() {
        const buffer = Buffer.allocUnsafe(5 + this.length);
        buffer.writeUInt8(this.type, 0);
        buffer.writeUInt16BE(this.version, 1);
        buffer.writeUInt16BE(this.length, 3);
        this.data.copy(buffer, 5);
        return buffer;
    }

    static parse(buffer) {
        const type = buffer.readUInt8(0);
        const version = buffer.readUInt16BE(1);
        const length = buffer.readUInt16BE(3);
        const data = buffer.slice(5, 5 + length);
        return new TLSRecord(type, version, data);
    }
}

// TLS Handshake Messages
class TLSHandshake {
    constructor(type, data) {
        this.type = type;
        this.length = data.length;
        this.data = data;
    }

    serialize() {
        const buffer = Buffer.allocUnsafe(4 + this.length);
        buffer.writeUInt8(this.type, 0);
        buffer.writeUIntBE(this.length, 1, 3);
        this.data.copy(buffer, 4);
        return buffer;
    }

    static parse(buffer) {
        const type = buffer.readUInt8(0);
        const length = buffer.readUIntBE(1, 3);
        const data = buffer.slice(4, 4 + length);
        return new TLSHandshake(type, data);
    }
}

// Client Hello Message
class ClientHello {
    constructor(version = TLS_VERSIONS.TLS_1_3) {
        this.version = version;
        this.random = crypto.randomBytes(32);
        this.sessionId = Buffer.alloc(0);
        this.cipherSuites = [
            CIPHER_SUITES.TLS_AES_256_GCM_SHA384,
            CIPHER_SUITES.TLS_AES_128_GCM_SHA256,
            CIPHER_SUITES.TLS_CHACHA20_POLY1305_SHA256
        ];
        this.compressionMethods = [0]; // null compression
        this.extensions = this.buildExtensions();
    }

    buildExtensions() {
        const extensions = [];
        
        // Server Name Indication
        extensions.push({
            type: EXTENSIONS.SERVER_NAME,
            data: this.buildSNIExtension('localhost')
        });

        // ALPN
        extensions.push({
            type: EXTENSIONS.ALPN,
            data: this.buildALPNExtension(['http/1.1', 'h2'])
        });

        // Supported Groups
        extensions.push({
            type: EXTENSIONS.SUPPORTED_GROUPS,
            data: this.buildSupportedGroupsExtension()
        });

        return extensions;
    }

    buildSNIExtension(hostname) {
        const hostnameBuffer = Buffer.from(hostname);
        const buffer = Buffer.allocUnsafe(5 + hostnameBuffer.length);
        buffer.writeUInt16BE(hostnameBuffer.length + 3, 0);
        buffer.writeUInt8(0, 2); // name_type: host_name
        buffer.writeUInt16BE(hostnameBuffer.length, 3);
        hostnameBuffer.copy(buffer, 5);
        return buffer;
    }

    buildALPNExtension(protocols) {
        let totalLength = 0;
        const protocolBuffers = protocols.map(protocol => {
            const buf = Buffer.from(protocol);
            totalLength += buf.length + 1;
            return buf;
        });

        const buffer = Buffer.allocUnsafe(2 + totalLength);
        buffer.writeUInt16BE(totalLength, 0);
        
        let offset = 2;
        protocolBuffers.forEach(protocolBuffer => {
            buffer.writeUInt8(protocolBuffer.length, offset);
            protocolBuffer.copy(buffer, offset + 1);
            offset += protocolBuffer.length + 1;
        });

        return buffer;
    }

    buildSupportedGroupsExtension() {
        const groups = [0x001D, 0x0017, 0x0018]; // x25519, secp256r1, secp384r1
        const buffer = Buffer.allocUnsafe(2 + groups.length * 2);
        buffer.writeUInt16BE(groups.length * 2, 0);
        
        groups.forEach((group, index) => {
            buffer.writeUInt16BE(group, 2 + index * 2);
        });

        return buffer;
    }

    serialize() {
        const data = Buffer.alloc(1024); // Estimate size
        let offset = 0;

        // Protocol version
        data.writeUInt16BE(this.version, offset);
        offset += 2;

        // Random
        this.random.copy(data, offset);
        offset += 32;

        // Session ID
        data.writeUInt8(this.sessionId.length, offset);
        offset++;
        this.sessionId.copy(data, offset);
        offset += this.sessionId.length;

        // Cipher suites
        data.writeUInt16BE(this.cipherSuites.length * 2, offset);
        offset += 2;
        this.cipherSuites.forEach(suite => {
            data.writeUInt16BE(suite, offset);
            offset += 2;
        });

        // Compression methods
        data.writeUInt8(this.compressionMethods.length, offset);
        offset++;
        this.compressionMethods.forEach(method => {
            data.writeUInt8(method, offset);
            offset++;
        });

        // Extensions
        const extensionsStart = offset + 2;
        offset += 2;
        this.extensions.forEach(ext => {
            data.writeUInt16BE(ext.type, offset);
            offset += 2;
            data.writeUInt16BE(ext.data.length, offset);
            offset += 2;
            ext.data.copy(data, offset);
            offset += ext.data.length;
        });
        data.writeUInt16BE(offset - extensionsStart, extensionsStart - 2);

        return data.slice(0, offset);
    }
}

// TLS Connection Manager
class TLSConnection extends EventEmitter {
    constructor(isServer = false) {
        super();
        this.isServer = isServer;
        this.state = 'INIT';
        this.version = TLS_VERSIONS.TLS_1_3;
        this.cipherSuite = null;
        this.dh = new DiffieHellman();
        this.masterSecret = null;
        this.keyMaterial = null;
        this.handshakeMessages = [];
    }

    async startHandshake() {
        if (this.isServer) {
            this.state = 'WAITING_CLIENT_HELLO';
            this.emit('waiting_client_hello');
        } else {
            await this.sendClientHello();
        }
    }

    async sendClientHello() {
        this.state = 'CLIENT_HELLO_SENT';
        const clientHello = new ClientHello(this.version);
        const handshake = new TLSHandshake(HANDSHAKE_TYPES.CLIENT_HELLO, clientHello.serialize());
        const record = new TLSRecord(TLSRecord.CONTENT_TYPES.HANDSHAKE, this.version, handshake.serialize());
        
        this.handshakeMessages.push(handshake.serialize());
        this.emit('send_record', record.serialize());
    }

    processRecord(buffer) {
        try {
            const record = TLSRecord.parse(buffer);
            
            switch (record.type) {
                case TLSRecord.CONTENT_TYPES.HANDSHAKE:
                    this.processHandshakeRecord(record);
                    break;
                case TLSRecord.CONTENT_TYPES.APPLICATION_DATA:
                    this.processApplicationData(record);
                    break;
                case TLSRecord.CONTENT_TYPES.ALERT:
                    this.processAlert(record);
                    break;
            }
        } catch (error) {
            this.emit('error', error);
        }
    }

    processHandshakeRecord(record) {
        const handshake = TLSHandshake.parse(record.data);
        this.handshakeMessages.push(handshake.serialize());

        switch (handshake.type) {
            case HANDSHAKE_TYPES.CLIENT_HELLO:
                if (this.isServer) {
                    this.processClientHello(handshake);
                }
                break;
            case HANDSHAKE_TYPES.SERVER_HELLO:
                if (!this.isServer) {
                    this.processServerHello(handshake);
                }
                break;
            case HANDSHAKE_TYPES.FINISHED:
                this.processFinished(handshake);
                break;
        }
    }

    processClientHello(handshake) {
        // Parse client hello and send server hello
        this.state = 'SERVER_HELLO_SENDING';
        this.sendServerHello();
    }

    sendServerHello() {
        // Simplified server hello
        const serverHello = Buffer.from('server_hello_placeholder');
        const handshake = new TLSHandshake(HANDSHAKE_TYPES.SERVER_HELLO, serverHello);
        const record = new TLSRecord(TLSRecord.CONTENT_TYPES.HANDSHAKE, this.version, handshake.serialize());
        
        this.emit('send_record', record.serialize());
        this.state = 'HANDSHAKE_COMPLETE';
    }

    processServerHello(handshake) {
        this.state = 'HANDSHAKE_COMPLETE';
        this.emit('handshake_complete');
    }

    processFinished(handshake) {
        this.state = 'CONNECTED';
        this.emit('connected');
    }

    processApplicationData(record) {
        // Decrypt and process application data
        const decryptedData = this.decrypt(record.data);
        this.emit('application_data', decryptedData);
    }

    processAlert(record) {
        const alertLevel = record.data[0];
        const alertDescription = record.data[1];
        this.emit('alert', { level: alertLevel, description: alertDescription });
    }

    encrypt(data) {
        if (!this.keyMaterial) {
            throw new Error('Encryption keys not established');
        }
        
        const cipher = crypto.createCipher('aes-256-gcm', this.keyMaterial.clientWriteKey);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted;
    }

    decrypt(data) {
        if (!this.keyMaterial) {
            throw new Error('Decryption keys not established');
        }
        
        const decipher = crypto.createDecipher('aes-256-gcm', this.keyMaterial.serverWriteKey);
        let decrypted = decipher.update(data);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    }

    deriveKeyMaterial(sharedSecret) {
        const masterSecret = crypto.createHash('sha256').update(sharedSecret.toString()).digest();
        
        // Simplified key derivation
        this.keyMaterial = {
            clientWriteKey: crypto.createHash('sha256').update(masterSecret + 'client').digest().slice(0, 32),
            serverWriteKey: crypto.createHash('sha256').update(masterSecret + 'server').digest().slice(0, 32),
            clientWriteIV: crypto.randomBytes(16),
            serverWriteIV: crypto.randomBytes(16)
        };
    }

    sendApplicationData(data) {
        if (this.state !== 'CONNECTED') {
            throw new Error('Connection not established');
        }
        
        const encryptedData = this.encrypt(data);
        const record = new TLSRecord(TLSRecord.CONTENT_TYPES.APPLICATION_DATA, this.version, encryptedData);
        this.emit('send_record', record.serialize());
    }
}

// TLS Server
class TLSServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.port = options.port || 8443;
        this.connections = new Map();
    }

    listen(callback) {
        console.log(`TLS Server listening on port ${this.port}`);
        if (callback) callback();
    }

    createConnection(socket) {
        const connectionId = crypto.randomUUID();
        const tlsConnection = new TLSConnection(true);
        
        tlsConnection.on('send_record', (data) => {
            socket.write(data);
        });

        tlsConnection.on('connected', () => {
            this.emit('connection', tlsConnection);
        });

        this.connections.set(connectionId, tlsConnection);
        return tlsConnection;
    }
}

// TLS Client
class TLSClient extends EventEmitter {
    constructor(options = {}) {
        super();
        this.host = options.host || 'localhost';
        this.port = options.port || 8443;
        this.connection = null;
    }

    connect(callback) {
        this.connection = new TLSConnection(false);
        
        this.connection.on('send_record', (data) => {
            // In real implementation, this would send over TCP socket
            console.log('Sending TLS record:', data.length, 'bytes');
        });

        this.connection.on('connected', () => {
            console.log('TLS connection established');
            if (callback) callback();
        });

        this.connection.startHandshake();
    }

    write(data) {
        if (this.connection) {
            this.connection.sendApplicationData(Buffer.from(data));
        }
    }
}

// Example usage and demonstration
function demonstrateTLS() {
    console.log('🔐 TLS Protocol Implementation Demo');
    console.log('=====================================');

    // Demonstrate Diffie-Hellman Key Exchange
    console.log('\n1. Diffie-Hellman Key Exchange:');
    const alice = new DiffieHellman();
    const bob = new DiffieHellman(alice.prime, Number(alice.generator));
    
    console.log('Alice private key (partial):', alice.privateKey.toString(16).substring(0, 16) + '...');
    console.log('Bob private key (partial):', bob.privateKey.toString(16).substring(0, 16) + '...');
    
    const aliceSharedSecret = alice.computeSharedSecret(bob.publicKey);
    const bobSharedSecret = bob.computeSharedSecret(alice.publicKey);
    
    console.log('Shared secrets match:', aliceSharedSecret === bobSharedSecret);

    // Demonstrate TLS Client
    console.log('\n2. TLS Client Connection:');
    const client = new TLSClient({ host: 'example.com', port: 443 });
    client.connect(() => {
        console.log('Client connected successfully');
        client.write('Hello, secure world!');
    });

    // Demonstrate TLS Server
    console.log('\n3. TLS Server:');
    const server = new TLSServer({ port: 8443 });
    server.listen(() => {
        console.log('TLS server started');
    });

    // Demonstrate record creation
    console.log('\n4. TLS Record Structure:');
    const sampleData = Buffer.from('Hello TLS');
    const record = new TLSRecord(TLSRecord.CONTENT_TYPES.APPLICATION_DATA, TLS_VERSIONS.TLS_1_3, sampleData);
    const serialized = record.serialize();
    console.log('Record serialized length:', serialized.length);
    
    const parsed = TLSRecord.parse(serialized);
    console.log('Record parsed successfully:', parsed.data.toString() === 'Hello TLS');
}

// Export classes and functions
export {
    TLSConnection,
    TLSServer,
    TLSClient,
    DiffieHellman,
    TLSRecord,
    TLSHandshake,
    ClientHello,
    TLS_VERSIONS,
    CIPHER_SUITES,
    HANDSHAKE_TYPES,
    demonstrateTLS
};

// Run demonstration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    demonstrateTLS();

}

// Note: In a real-world application, you would not run the demonstration code directly.


//Symmetric Encryption 
//Assume both parties have the same key(The most difficult thing)
//users use the key to encrypt messages
//send this
//reciever gets the encrypted message
//Uses the same key to decrypt the message
//AES
//



