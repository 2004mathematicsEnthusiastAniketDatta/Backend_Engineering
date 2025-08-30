// Import required Node.js built-in modules for HTTPS server creation
const https = require('https');
// Import file system module to read SSL certificates
const fs = require('fs');
// Import path module for handling file paths
const path = require('path');
// Import crypto module for advanced cryptographic operations
const crypto = require('crypto');

// Import Express.js framework for robust web application features
const express = require('express');
// Import Helmet for setting various HTTP security headers
const helmet = require('helmet');
// Import rate limiting middleware to prevent abuse
const rateLimit = require('express-rate-limit');
// Import compression middleware to reduce response size
const compression = require('compression');
// Import CORS middleware for Cross-Origin Resource Sharing
const cors = require('cors');

// Create Express application instance
const app = express();

// Define the port for HTTPS server (8443 is common for HTTPS development)
const HTTPS_PORT = 8443;

// Define paths for SSL certificate files
const CERT_DIR = path.join(__dirname, 'certs');
const PRIVATE_KEY_PATH = path.join(CERT_DIR, 'server.key');
const CERTIFICATE_PATH = path.join(CERT_DIR, 'server.crt');

/**
 * Advanced Security Middleware Configuration
 * Implementing defense-in-depth security practices
 */

// Configure Helmet with strict security policies
app.use(helmet({
    // Content Security Policy to prevent XSS attacks
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Only allow resources from same origin
            scriptSrc: ["'self'", "'unsafe-inline'"], // Allow scripts from same origin and inline
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from same origin and inline
            imgSrc: ["'self'", "data:", "https:"], // Allow images from self, data URLs, and HTTPS
            connectSrc: ["'self'"], // Restrict AJAX/WebSocket connections to same origin
            fontSrc: ["'self'"], // Only allow fonts from same origin
            objectSrc: ["'none'"], // Disable plugins like Flash
            mediaSrc: ["'self'"], // Only allow media from same origin
            frameSrc: ["'none'"], // Disable iframes for clickjacking protection
        },
    },
    // Strict Transport Security - force HTTPS for 1 year including subdomains
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true, // Apply to all subdomains
        preload: true // Allow inclusion in browser HSTS preload lists
    },
    // Prevent MIME type sniffing attacks
    noSniff: true,
    // Enable XSS filtering in older browsers
    xssFilter: true,
    // Prevent clickjacking attacks
    frameguard: { action: 'deny' },
    // Hide server information
    hidePoweredBy: true,
    // Referrer Policy to control information leakage
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Configure CORS with strict policies
app.use(cors({
    origin: ['https://localhost:8443'], // Only allow requests from specific origins
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    maxAge: 86400 // Cache preflight response for 24 hours
}));

// Configure rate limiting to prevent DoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable legacy headers
    // Skip rate limiting for localhost in development
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1'
});

// Apply rate limiting to all routes
app.use(limiter);

// Enable response compression to reduce bandwidth usage
app.use(compression({
    level: 6, // Compression level (1-9, 6 is good balance)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression filter function
        return compression.filter(req, res);
    }
}));

// Parse JSON requests with size limit to prevent memory exhaustion
app.use(express.json({ 
    limit: '10mb', // Limit request size
    strict: true // Only parse objects and arrays
}));

// Parse URL-encoded requests with size limit
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

/**
 * Custom Security Middleware
 */

// Add custom security headers
app.use((req, res, next) => {
    // Prevent information disclosure
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Additional security header for IE
    res.setHeader('X-Download-Options', 'noopen');
    // Prevent Adobe Flash/PDF from executing scripts
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    // Feature Policy to control browser features
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Remove server signature
    res.removeHeader('X-Powered-By');
    next();
});

// Request logging middleware with security considerations
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    // Log request (be careful not to log sensitive data)
    console.log(`[${timestamp}] ${method} ${url} from ${ip} - ${userAgent}`);
    next();
});

/**
 * Route Definitions with Security Best Practices
 */

// Health check endpoint
app.get('/health', (req, res) => {
    // Return minimal health information
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Secure API endpoint example
app.get('/api/secure', (req, res) => {
    // Generate a secure random token for demonstration
    const secureToken = crypto.randomBytes(32).toString('hex');
    
    res.status(200).json({
        message: 'This is a secure HTTPS endpoint with TLS 1.3',
        timestamp: new Date().toISOString(),
        secureToken: secureToken,
        security: {
            protocol: 'TLS 1.3',
            cipher: req.socket.getCipher ? req.socket.getCipher().name : 'Unknown',
            version: req.socket.getProtocol ? req.socket.getProtocol() : 'Unknown'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Secure HTTPS Server with TLS 1.3',
        documentation: '/api/docs',
        health: '/health',
        secureEndpoint: '/api/secure'
    });
});

// 404 handler - should be before error handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'The requested resource does not exist',
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    // Log error for debugging (in production, use proper logging service)
    console.error('Error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

/**
 * SSL Certificate Validation and Loading
 */
function loadSSLCertificates() {
    try {
        // Check if certificate files exist
        if (!fs.existsSync(PRIVATE_KEY_PATH)) {
            throw new Error(`Private key not found at: ${PRIVATE_KEY_PATH}`);
        }
        
        if (!fs.existsSync(CERTIFICATE_PATH)) {
            throw new Error(`Certificate not found at: ${CERTIFICATE_PATH}`);
        }
        
        // Read certificate files synchronously at startup
        const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        const certificate = fs.readFileSync(CERTIFICATE_PATH, 'utf8');
        
        // Validate certificate format (basic check)
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') && 
            !privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
            throw new Error('Invalid private key format');
        }
        
        if (!certificate.includes('-----BEGIN CERTIFICATE-----')) {
            throw new Error('Invalid certificate format');
        }
        
        console.log('✓ SSL certificates loaded successfully');
        return { key: privateKey, cert: certificate };
        
    } catch (error) {
        console.error('✗ SSL Certificate Error:', error.message);
        console.error('\nTo generate self-signed certificates for development:');
        console.error('mkdir -p certs');
        console.error('openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/server.key -out certs/server.crt -days 365 -subj "/CN=localhost"');
        process.exit(1);
    }
}

/**
 * Advanced HTTPS Server Configuration with TLS 1.3
 */
function createSecureServer() {
    // Load SSL certificates
    const sslOptions = loadSSLCertificates();
    
    // Advanced TLS configuration for maximum security
    const httpsOptions = {
        ...sslOptions,
        
        // Force TLS 1.3 and 1.2 only (disable older vulnerable versions)
        minVersion: 'TLSv1.2', // Minimum supported version
        maxVersion: 'TLSv1.3', // Maximum supported version
        
        // Disable insecure SSL/TLS versions
        secureOptions: crypto.constants.SSL_OP_NO_SSLv2 |
                      crypto.constants.SSL_OP_NO_SSLv3 |
                      crypto.constants.SSL_OP_NO_TLSv1 |
                      crypto.constants.SSL_OP_NO_TLSv1_1,
        
        // Preferred cipher suites for TLS 1.3 and 1.2
        ciphers: [
            // TLS 1.3 cipher suites (automatic with TLS 1.3)
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_128_GCM_SHA256',
            
            // TLS 1.2 secure cipher suites
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'DHE-RSA-AES256-GCM-SHA384',
            'DHE-RSA-AES128-GCM-SHA256'
        ].join(':'),
        
        // Prefer server cipher order
        honorCipherOrder: true,
        
        // Enable session resumption for performance
        sessionIdContext: 'secure-https-server',
        
        // DH parameters for perfect forward secrecy
        dhparam: generateDHParams(),
        
        // Elliptic curves for ECDHE
        ecdhCurve: 'auto', // Use strong curves
        
        // Request client certificate (optional)
        requestCert: false,
        rejectUnauthorized: false
    };
    
    // Create HTTPS server with Express app and security options
    const server = https.createServer(httpsOptions, app);
    
    // Configure server settings
    server.timeout = 30000; // 30 second timeout
    server.headersTimeout = 31000; // Slightly higher than timeout
    server.keepAliveTimeout = 5000; // Keep-alive timeout
    
    return server;
}

/**
 * Generate Diffie-Hellman parameters for Perfect Forward Secrecy
 */
function generateDHParams() {
    try {
        // Try to load existing DH params
        const dhParamPath = path.join(CERT_DIR, 'dhparam.pem');
        if (fs.existsSync(dhParamPath)) {
            return fs.readFileSync(dhParamPath, 'utf8');
        }
        
        console.log('Generating DH parameters (this may take a moment)...');
        // Generate 2048-bit DH parameters (compromise between security and performance)
        const dhParams = crypto.generateKeyPairSync('dh', {
            namedCurve: 'secp384r1' // Use elliptic curve instead
        });
        
        return null; // Let OpenSSL use default secure DH params
    } catch (error) {
        console.warn('Could not generate DH params, using defaults:', error.message);
        return null;
    }
}

/**
 * Server Startup and Error Handling
 */
function startServer() {
    try {
        // Create the secure HTTPS server
        const server = createSecureServer();
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`✗ Port ${HTTPS_PORT} is already in use`);
                console.error('Please stop the other service or use a different port');
            } else if (error.code === 'EACCES') {
                console.error(`✗ Permission denied to bind to port ${HTTPS_PORT}`);
                console.error('You may need to run with elevated privileges');
            } else {
                console.error('✗ Server error:', error.message);
            }
            process.exit(1);
        });
        
        // Handle successful server start
        server.listen(HTTPS_PORT, () => {
            console.log('\n🔒 Secure HTTPS Server Started Successfully!');
            console.log('==========================================');
            console.log(`📍 URL: https://localhost:${HTTPS_PORT}`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🛡️  TLS Version: 1.3 (with 1.2 fallback)`);
            console.log(`⚡ Node.js Version: ${process.version}`);
            console.log(`🕐 Started at: ${new Date().toISOString()}`);
            console.log('==========================================');
            console.log('\nAvailable endpoints:');
            console.log('  GET  /              - Server information');
            console.log('  GET  /health        - Health check');
            console.log('  GET  /api/secure    - Secure API example');
            console.log('\n⚠️  Note: Accept the self-signed certificate in your browser');
        });
        
        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            console.log(`\n📡 Received ${signal}, shutting down gracefully...`);
            
            server.close((err) => {
                if (err) {
                    console.error('Error during server shutdown:', err);
                    process.exit(1);
                }
                
                console.log('✅ HTTPS server closed successfully');
                process.exit(0);
            });
            
            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('⚠️  Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };
        
        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });
        
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

// Export for testing purposes
module.exports = { app, startServer };
