#!/usr/bin/env node

/** 
 * @author Aniket Datta
 * @version 1.0.0
 */

// Set the working directory to the project root
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

require('dotenv').config();
const https = require('https');
const http = require('http');
const express = require('express');
const fs = require('fs');

// Import custom modules
const TLSConfig = require('../config/tlsConfig');
const SecurityMiddleware = require('./securityMiddleware');

/**
 * HTTPS Server Class
 */
class HTTPSServer {
    constructor() {
        this.app = express();
        this.tlsConfig = new TLSConfig();
        this.securityMiddleware = new SecurityMiddleware();
        this.server = null;
        
        // Server configuration
        this.port = process.env.PORT || 8445;
        this.host = process.env.HOST || 'localhost';
        this.environment = process.env.NODE_ENV || 'development';
        
        // Initialize server
        this.init();
    }

    /**
     * Initialize the server
     */
    init() {
        try {
            // Validate TLS configuration
            if (!this.tlsConfig.validateConfig()) {
                throw new Error('TLS configuration validation failed');
            }

            // Setup middleware
            this.setupMiddleware();
            
            // Setup routes
            this.setupRoutes();
            
            // Setup error handling
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
        // Parse JSON bodies
        this.app.use(express.json({ 
            limit: '10mb',
            strict: true
        }));
        
        // Parse URL-encoded bodies
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: '10mb' 
        }));

        // Initialize security middleware
        try {
            this.securityMiddleware.init(this.app);
        } catch (error) {
            console.error('❌ Security middleware initialization failed:', error.message);
            throw error;
        }

        // Custom middleware for HTTPS-only responses
        this.app.use((req, res, next) => {
            // Add custom security headers
            const securityHeaders = this.tlsConfig.getSecurityHeaders();
            Object.keys(securityHeaders).forEach(header => {
                res.setHeader(header, securityHeaders[header]);
            });
            
            // Add server info (optional, can be removed in production)
            if (this.environment === 'development') {
                res.setHeader('X-Server-Info', 'HTTPS/TLS1.3 Server v1.0.0');
            }
            
            next();
        });

        console.log('✅ Middleware setup completed');
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: this.environment,
                tls: 'TLS 1.3',
                port: this.port,
                requestId: req.requestId
            });
        });

        // Ping endpoint
        this.app.get('/ping', (req, res) => {
            res.status(200).json({ 
                message: 'pong',
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        // TLS info endpoint
        this.app.get('/tls-info', (req, res) => {
            const tlsInfo = {
                version: req.connection.getProtocol?.() || 'Unknown',
                cipher: req.connection.getCipher?.() || 'Unknown',
                authorized: req.connection.authorized,
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            };
            
            res.status(200).json(tlsInfo);
        });

        // API status endpoint
        this.app.get('/api/status', (req, res) => {
            res.status(200).json({
                api: 'HTTPS Server API',
                version: '1.0.0',
                status: 'operational',
                features: [
                    'TLS 1.3 Encryption',
                    'Rate Limiting',
                    'Security Headers',
                    'Request Logging',
                    'Error Handling'
                ],
                endpoints: [
                    'GET /health',
                    'GET /ping',
                    'GET /tls-info',
                    'GET /api/status'
                ],
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        // Default route
        this.app.get('/', (req, res) => {
            res.status(200).json({
                message: 'HTTPS Server',
                version: '1.0.0',
                tls: 'TLS 1.3',
                secure: true,
                timestamp: new Date().toISOString(),
                documentation: '/api/status',
                requestId: req.requestId
            });
        });

        // Catch-all route for undefined endpoints
        this.app.all('*', (req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `The requested endpoint ${req.method} ${req.path} was not found`,
                availableEndpoints: [
                    'GET /',
                    'GET /health',
                    'GET /ping',
                    'GET /tls-info',
                    'GET /api/status'
                ],
                timestamp: new Date().toISOString(),
                requestId: req.requestId
            });
        });

        console.log('✅ Routes setup completed');
    }

    /**
     * Setup error handling middleware
     */
    setupErrorHandling() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            const statusCode = err.statusCode || err.status || 500;
            const message = err.message || 'Internal Server Error';
            
            // Log error
            console.error(`❌ Error ${statusCode}:`, {
                message: err.message,
                stack: this.environment === 'development' ? err.stack : undefined,
                requestId: req.requestId,
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            // Send error response
            res.status(statusCode).json({
                error: true,
                status: statusCode,
                message: this.environment === 'production' && statusCode === 500 
                    ? 'Internal Server Error' 
                    : message,
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                ...(this.environment === 'development' && { stack: err.stack })
            });
        });

        console.log('✅ Error handling setup completed');
    }

    /**
     * Start the HTTPS server
     */
    start() {
        try {
            // Get TLS options
            const tlsOptions = this.tlsConfig.getTLSOptions();
            
            // Create HTTPS server
            this.server = https.createServer(tlsOptions, this.app);

            // Configure server timeouts
            this.server.timeout = 120000; // 2 minutes
            this.server.keepAliveTimeout = 65000; // 65 seconds
            this.server.headersTimeout = 66000; // 66 seconds

            // Start listening
            this.server.listen(this.port, this.host, () => {
                console.log('\n🚀 HTTPS Server Started Successfully!');
                console.log('=====================================');
                console.log(`🔒 Protocol: HTTPS with TLS 1.3`);
                console.log(`🌍 Host: ${this.host}`);
                console.log(`🔌 Port: ${this.port}`);
                console.log(`🏠 URL: https://${this.host}:${this.port}`);
                console.log(`🛠️  Environment: ${this.environment}`);
                console.log(`⏰ Started: ${new Date().toISOString()}`);
                console.log('=====================================');
                console.log('\n📋 Available Endpoints:');
                console.log(`   GET https://${this.host}:${this.port}/`);
                console.log(`   GET https://${this.host}:${this.port}/health`);
                console.log(`   GET https://${this.host}:${this.port}/ping`);
                console.log(`   GET https://${this.host}:${this.port}/tls-info`);
                console.log(`   GET https://${this.host}:${this.port}/api/status`);
                console.log('\n💡 Tips:');
                console.log(`   - Use 'curl -k https://${this.host}:${this.port}/health' to test`);
                console.log(`   - Check TLS info at https://${this.host}:${this.port}/tls-info`);
                console.log(`   - Use Ctrl+C to gracefully shutdown\n`);
            });

            // Handle server events
            this.setupServerEvents();

        } catch (error) {
            console.error('❌ Failed to start HTTPS server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Setup server event handlers
     */
    setupServerEvents() {
        // Handle server errors
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${this.port} is already in use`);
            } else if (error.code === 'EACCES') {
                console.error(`❌ Permission denied to bind to port ${this.port}`);
            } else {
                console.error('❌ Server error:', error.message);
            }
            process.exit(1);
        });

        // Handle TLS errors
        this.server.on('tlsClientError', (err, tlsSocket) => {
            console.error('TLS Client Error:', err.message);
        });

        // Handle connection events
        this.server.on('connection', (socket) => {
            socket.setTimeout(30000); // 30 second socket timeout
        });

        // Graceful shutdown handling
        this.setupGracefulShutdown();
    }

    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown() {
        const shutdown = (signal) => {
            console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
            
            this.server.close((err) => {
                if (err) {
                    console.error('❌ Error during server shutdown:', err.message);
                    process.exit(1);
                } else {
                    console.log('✅ Server closed successfully');
                    console.log('👋 Goodbye!');
                    process.exit(0);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forcing shutdown...');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown('UNHANDLED_REJECTION');
        });
    }
}

// Create and start the server
if (require.main === module) {
    const server = new HTTPSServer();
    server.start();
}

module.exports = HTTPSServer;
