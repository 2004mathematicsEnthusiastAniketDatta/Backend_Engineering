#!/usr/bin/env node

/**
 * Simplified HTTPS Server with TLS 1.3
 */

// Set the working directory to the project root
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

require('dotenv').config();

const https = require('https');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

/**
 * Simple HTTPS Server Class
 */
class SimpleHTTPSServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8443;
        this.host = process.env.HOST || 'localhost';
        
        this.init();
    }

    /**
     * Initialize the server
     */
    init() {
        try {
            this.setupMiddleware();
            this.setupRoutes();
            this.setupErrorHandling();
            console.log('✅ Server initialization completed');
        } catch (error) {
            console.error('❌ Server initialization failed:', error.message);
            process.exit(1);
        }
    }

    /**
     * Setup middleware
     */
    setupMiddleware() {
        // Basic middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Trust proxy
        this.app.set('trust proxy', 1);
        
        // Request ID
        this.app.use((req, res, next) => {
            req.requestId = require('crypto').randomUUID();
            res.setHeader('X-Request-ID', req.requestId);
            next();
        });

        // Morgan logging
        this.app.use(morgan('combined'));

        // Helmet security
        this.app.use(helmet({
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        }));

        // CORS
        this.app.use(cors({
            origin: ['https://localhost:3000', 'https://localhost:8080'],
            credentials: true
        }));

        console.log('✅ Middleware setup completed');
    }

    /**
     * Setup routes
     */
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                tls: 'TLS 1.3',
                port: this.port,
                requestId: req.requestId
            });
        });

        // Ping
        this.app.get('/ping', (req, res) => {
            res.status(200).json({ 
                message: 'pong',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        // TLS info
        this.app.get('/tls-info', (req, res) => {
            const tlsInfo = {
                version: req.socket.getProtocol?.() || 'Unknown',
                cipher: req.socket.getCipher?.() || 'Unknown',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            };
            
            res.status(200).json(tlsInfo);
        });

        // Root
        this.app.get('/', (req, res) => {
            res.status(200).json({
                message: 'Welcome to the HTTPS Server with TLS 1.3',
                version: '1.0.0',
                tls: 'TLS 1.3',
                secure: true,
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Endpoint ${req.method} ${req.originalUrl} not found`,
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        console.log('✅ Routes setup completed');
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        this.app.use((err, req, res, next) => {
            console.error('Error:', err.message);
            
            res.status(err.status || 500).json({
                error: true,
                message: err.message || 'Internal Server Error',
                requestId: req.requestId,
                timestamp: new Date().toISOString()
            });
        });

        console.log('✅ Error handling setup completed');
    }

    /**
     * Get TLS options
     */
    getTLSOptions() {
        try {
            const keyPath = './certs/server.key';
            const certPath = './certs/server.crt';
            
            if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
                throw new Error('SSL certificates not found. Please run: npm run generate-certs');
            }

            return {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(certPath),
                minVersion: 'TLSv1.3',
                maxVersion: 'TLSv1.3',
                ciphers: [
                    'TLS_AES_256_GCM_SHA384',
                    'TLS_CHACHA20_POLY1305_SHA256',
                    'TLS_AES_128_GCM_SHA256'
                ].join(':'),
                honorCipherOrder: true
            };
        } catch (error) {
            console.error('❌ TLS configuration error:', error.message);
            throw error;
        }
    }

    /**
     * Start the server
     */
    start() {
        try {
            const tlsOptions = this.getTLSOptions();
            
            this.server = https.createServer(tlsOptions, this.app);
            
            this.server.listen(this.port, this.host, () => {
                console.log('\n🚀 HTTPS Server Started!');
                console.log('========================');
                console.log(`🔒 Protocol: HTTPS with TLS 1.3`);
                console.log(`🌍 Host: ${this.host}`);
                console.log(`🔌 Port: ${this.port}`);
                console.log(`🏠 URL: https://${this.host}:${this.port}`);
                console.log(`⏰ Started: ${new Date().toISOString()}`);
                console.log('========================\n');
                
                console.log('📋 Test with:');
                console.log(`   curl -k https://${this.host}:${this.port}/health`);
                console.log(`   curl -k https://${this.host}:${this.port}/tls-info\n`);
            });

            // Error handling
            this.server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${this.port} is already in use`);
                } else {
                    console.error('❌ Server error:', error.message);
                }
                process.exit(1);
            });

            // Graceful shutdown
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));

        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        console.log('\n📡 Shutting down gracefully...');
        
        this.server.close((err) => {
            if (err) {
                console.error('❌ Error during shutdown:', err.message);
                process.exit(1);
            } else {
                console.log('✅ Server closed successfully');
                process.exit(0);
            }
        });
    }
}

// Start the server
if (require.main === module) {
    const server = new SimpleHTTPSServer();
    server.start();
}

module.exports = SimpleHTTPSServer;
