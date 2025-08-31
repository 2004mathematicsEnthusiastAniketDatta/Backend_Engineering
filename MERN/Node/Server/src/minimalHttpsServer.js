#!/usr/bin/env node

/**
 * Minimal HTTPS Server with TLS 1.3
 */

// Set working directory
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

require('dotenv').config();

const https = require('https');
const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8443;
const host = process.env.HOST || 'localhost';

// Basic middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tls: 'TLS 1.3',
        port: port
    });
});

app.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.json({
        message: 'HTTPS Server with TLS 1.3',
        version: '1.0.0',
        secure: true,
        timestamp: new Date().toISOString()
    });
});

// TLS Configuration
function getTLSOptions() {
    try {
        const keyPath = './certs/server.key';
        const certPath = './certs/server.crt';
        
        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            throw new Error('SSL certificates not found. Run: npm run generate-certs');
        }

        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
            minVersion: 'TLSv1.3',
            maxVersion: 'TLSv1.3'
        };
    } catch (error) {
        console.error('❌ TLS Error:', error.message);
        throw error;
    }
}

// Start server
try {
    const tlsOptions = getTLSOptions();
    const server = https.createServer(tlsOptions, app);
    
    server.listen(port, host, () => {
        console.log('\n🚀 HTTPS Server with TLS 1.3 Started!');
        console.log('====================================');
        console.log(`🔒 Protocol: HTTPS/TLS 1.3`);
        console.log(`🌍 URL: https://${host}:${port}`);
        console.log(`⏰ Started: ${new Date().toISOString()}`);
        console.log('====================================\n');
        console.log('Test endpoints:');
        console.log(`  curl -k https://${host}:${port}/`);
        console.log(`  curl -k https://${host}:${port}/health`);
        console.log(`  curl -k https://${host}:${port}/ping\n`);
    });

    server.on('error', (error) => {
        console.error('❌ Server error:', error.message);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n📡 Shutting down...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

} catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
}
