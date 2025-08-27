// server.js
'use strict';
const net = require('net');
const { createInterface } = require('readline');

const PORT = process.env.PORT ? Number(process.env.PORT) : 9000;
const HOST = process.env.HOST || '0.0.0.0';

let nextId = 1;
const clients = new Map(); // id -> { socket, name }

function broadcast(obj, exceptId = null) {
    const line = JSON.stringify(obj) + '\n';
    for (const [id, c] of clients.entries()) {
        if (id === exceptId) continue;
        c.socket.write(line);
    }
}

const server = net.createServer((socket) => {
    socket.setEncoding('utf8');
    const id = String(nextId++);
    const rl = createInterface({ input: socket, crlfDelay: Infinity });

    clients.set(id, { socket, name: `user${id}` });

    // Ask for a name
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

    socket.on('close', () => {
        const c = clients.get(id);
        if (c) {
            broadcast({ type: 'system', text: `${c.name} left` }, id);
            clients.delete(id);
        }
        try { rl.close(); } catch {}
    });

    socket.on('error', () => {
        try { socket.destroy(); } catch {}
    });
});

server.listen(PORT, HOST, () => {
    console.log(`TCP chat server listening on ${HOST}:${PORT}`);
});