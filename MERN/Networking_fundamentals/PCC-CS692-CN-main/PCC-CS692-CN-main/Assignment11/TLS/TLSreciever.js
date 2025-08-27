const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { createInterface } = require('readline');

// TLSReceiver.js
// Encrypted TCP receiver (server) using Node's tls module.
// - Exposes a simple newline-delimited JSON protocol.
// - Broadcasts messages to all connected clients.
// Usage: node TLSReceiver.js [--port 9443] [--host 0.0.0.0] [--key ./server.key] [--cert ./server.cert]

const argv = require('minimist')(process.argv.slice(2));
const PORT = Number(argv.port || process.env.PORT || 9443);
const HOST = argv.host || process.env.HOST || '0.0.0.0';

const SCRIPT_DIR = __dirname;
const defaultKey = path.join(SCRIPT_DIR, 'server.key');
const defaultCert = path.join(SCRIPT_DIR, 'server.cert');


function resolveCandidate(p) {
    // If absolute, return as-is
    if (path.isAbsolute(p) && fs.existsSync(p)) return p;
    // Try resolving relative to current working directory
    const cwdResolved = path.resolve(process.cwd(), p);
    if (fs.existsSync(cwdResolved)) return cwdResolved;
    // Try resolving relative to the script directory
    const scriptResolved = path.resolve(SCRIPT_DIR, p);
    if (fs.existsSync(scriptResolved)) return scriptResolved;
    // Not found; return the cwdResolved (useful for error output)
    return cwdResolved;
}

const rawKey = argv.key || process.env.TLS_KEY || defaultKey;
const rawCert = argv.cert || process.env.TLS_CERT || defaultCert;

const keyPath = resolveCandidate(rawKey);
const certPath = resolveCandidate(rawCert);

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('TLS key/cert not found. Tried the following locations:');
    console.error('  key candidates:');
    console.error('    -', path.resolve(process.cwd(), rawKey));
    console.error('    -', path.resolve(SCRIPT_DIR, rawKey));
    console.error('  cert candidates:');
    console.error('    -', path.resolve(process.cwd(), rawCert));
    console.error('    -', path.resolve(SCRIPT_DIR, rawCert));
    process.exit(1);
}

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
    // Do not request client cert by default. Can be extended to mTLS later.
    requestCert: false,
    rejectUnauthorized: false
};

let nextId = 1;
const clients = new Map(); // id -> { socket, name }

function broadcast(obj, exceptId = null) {
    const line = JSON.stringify(obj) + '\n';
    for (const [id, c] of clients.entries()) {
        if (id === exceptId) continue;
        c.socket.write(line);
    }
}

const server = tls.createServer(options, (socket) => {
    // Socket is an encrypted TLSSocket
    socket.setEncoding('utf8');
    const id = String(nextId++);
    const rl = createInterface({ input: socket, crlfDelay: Infinity });
    clients.set(id, { socket, name: `user${id}` });

    // welcome
    socket.write(JSON.stringify({ type: 'system', text: 'send {"type":"join","name":"yourname"} to set your name' }) + '\n');
    broadcast({ type: 'system', text: `user${id} joined` }, id);

    rl.on('line', (line) => {
        if (!line) return;
        let msg;
        try {
            msg = JSON.parse(line);
        } catch (err) {
            socket.write(JSON.stringify({ type: 'error', text: 'invalid_json' }) + '\n');
            return;
        }

        if (msg.type === 'join' && typeof msg.name === 'string' && msg.name.trim()) {
            const old = clients.get(id).name;
            clients.get(id).name = msg.name.trim();
            broadcast({ type: 'system', text: `${old} is now ${msg.name.trim()}` });
            return;
        }

        if (msg.type === 'message' && typeof msg.text === 'string') {
            const from = clients.get(id).name;
            broadcast({ type: 'message', from, text: msg.text });
            return;
        }

        if (msg.type === 'list') {
            const names = Array.from(clients.values()).map(c => c.name);
            socket.write(JSON.stringify({ type: 'list', users: names }) + '\n');
            return;
        }

        socket.write(JSON.stringify({ type: 'error', text: 'unknown_command' }) + '\n');
    });

    socket.on('error', (err) => {
        // log minimal info
        console.error('client socket error:', err && err.message ? err.message : err);
    });

    socket.on('close', () => {
        const c = clients.get(id);
        if (c) {
            broadcast({ type: 'system', text: `${c.name} left` }, id);
            clients.delete(id);
        }
        try { rl.close(); } catch (e) {}
    });
});

server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    }
    console.error('server error:', err && err.message ? err.message : err);
    process.exit(1);
});

server.listen(PORT, HOST, () => {
    console.log(`TLS receiver listening on ${HOST}:${PORT}`);
    console.log('Using key:', keyPath);
    console.log('Using cert:', certPath);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close(() => process.exit(0));
});