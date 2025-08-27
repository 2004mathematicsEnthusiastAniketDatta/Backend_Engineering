const tls = require('tls');
const fs = require('fs');
const path = require('path');
const { createInterface } = require('readline');

// TLSSender.js
// Simple encrypted TCP client using Node's tls module.
// Usage: node TLSSender.js --host localhost --port 9443 [--insecure] [--ca ./server.cert] [--cert ./client.cert --key ./client.key]

const argv = require('minimist')(process.argv.slice(2));
const HOST = argv.host || process.env.HOST || '127.0.0.1';
const PORT = Number(argv.port || process.env.PORT || 9443);
const insecure = Boolean(argv.insecure || process.env.TLS_INSECURE === '1');
const allowHostMismatch = Boolean(argv['allow-hostname-mismatch'] || argv['allow-host-mismatch'] || false);
const rawCa = argv.ca || process.env.TLS_CA;
const rawCert = argv.cert || process.env.TLS_CERT;
const rawKey = argv.key || process.env.TLS_KEY;

function resolveCandidate(p) {
    if (!p) return null;
    if (path.isAbsolute(p) && fs.existsSync(p)) return p;
    const cwdResolved = path.resolve(process.cwd(), p);
    if (fs.existsSync(cwdResolved)) return cwdResolved;
    const scriptResolved = path.resolve(__dirname, p);
    if (fs.existsSync(scriptResolved)) return scriptResolved;
    return cwdResolved;
}

const caPath = resolveCandidate(rawCa);
const certPath = resolveCandidate(rawCert);
const keyPath = resolveCandidate(rawKey);

const options = {
    host: HOST,
    port: PORT,
    rejectUnauthorized: !insecure
};

if (allowHostMismatch || insecure) {
    // skip hostname verification (only for testing with self-signed certs or IPs)
    options.checkServerIdentity = () => undefined;
}

if (caPath) {
    try { options.ca = fs.readFileSync(caPath); } catch (err) {
        console.error('Could not read CA file:', caPath, err && err.message ? err.message : err);
        process.exit(1);
    }
}

if (certPath) {
    try { options.cert = fs.readFileSync(certPath); } catch (err) {
        console.error('Could not read cert file:', certPath, err && err.message ? err.message : err);
        process.exit(1);
    }
}

if (keyPath) {
    try { options.key = fs.readFileSync(keyPath); } catch (err) {
        console.error('Could not read key file:', keyPath, err && err.message ? err.message : err);
        process.exit(1);
    }
}

const socket = tls.connect(options, () => {
    console.log('Connected to', `${HOST}:${PORT}`);
    if (socket.authorized) console.log('Server certificate authorized');
    else console.log('Server certificate not authorized:', socket.authorizationError);
    prompt();
});

socket.setEncoding('utf8');

const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });

function prompt() {
    rl.prompt();
}

rl.on('line', (line) => {
    if (!line) return prompt();
    const trimmed = line.trim();
    if (trimmed === '/quit' || trimmed === '/exit') {
        socket.end();
        rl.close();
        return;
    }

    if (trimmed.startsWith('/msg ')) {
        const text = trimmed.slice(5).trim();
        socket.write(JSON.stringify({ type: 'message', text }) + '\n');
        return prompt();
    }

    if (trimmed === '/list') {
        socket.write(JSON.stringify({ type: 'list' }) + '\n');
        return prompt();
    }

    try {
        if (!trimmed.startsWith('{')) {
            socket.write(JSON.stringify({ type: 'message', text: trimmed }) + '\n');
            return prompt();
        }
        JSON.parse(trimmed); // validate
        socket.write(trimmed + '\n');
    } catch (err) {
        console.error('Invalid JSON input');
    }
    prompt();
});

socket.on('data', (data) => {
    const lines = data.split(/\r?\n/).filter(Boolean);
    for (const l of lines) {
        try {
            const obj = JSON.parse(l);
            if (obj.type === 'system') console.log(`[system] ${obj.text}`);
            else if (obj.type === 'message') console.log(`[${obj.from}] ${obj.text}`);
            else console.log('[server]', obj);
        } catch (err) {
            console.log('[raw]', l);
        }
    }
    prompt();
});

socket.on('close', () => {
    console.log('Disconnected from server');
    process.exit(0);
});

socket.on('error', (err) => {
    // Improve feedback for hostname mismatch
    if (err && err.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
        console.error('Socket error: certificate does not match hostname.');
        console.error('Options:');
        console.error(' - Connect using the hostname listed in the certificate (e.g. --host localhost)');
        console.error(' - Use --allow-hostname-mismatch to bypass hostname verification for testing');
        console.error(' - Use --insecure to skip verification entirely (not for production)');
        console.error('Original error:', err && err.message ? err.message : err);
        return;
    }
    console.error('Socket error:', err && err.message ? err.message : err);
});

process.on('SIGINT', () => {
    console.log('Exiting...');
    try { socket.end(); } catch (e) {}
    process.exit(0);
});