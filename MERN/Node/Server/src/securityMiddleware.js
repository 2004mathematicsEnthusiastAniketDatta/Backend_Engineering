const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

/**
 * Security Middleware Configuration
 * Implements industry-standard security practices for HTTPS servers
 */
class SecurityMiddleware {
    constructor() {
        this.corsOptions = this.getCorsOptions();
        this.helmetOptions = this.getHelmetOptions();
        this.morganOptions = this.getMorganOptions();
    }

    /**
     * Get CORS configuration
     * @returns {Object} CORS options
     */
    getCorsOptions() {
        const allowedOrigins = process.env.CORS_ORIGIN 
            ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
            : ['https://localhost:3000', 'https://localhost:8080'];

        return {
            origin: function (origin, callback) {
                // Allow requests with no origin (mobile apps, etc.)
                if (!origin) return callback(null, true);
                
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS policy'));
                }
            },
            credentials: process.env.CORS_CREDENTIALS === 'true',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'Authorization',
                'X-CSRF-Token'
            ],
            exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
            optionsSuccessStatus: 200,
            maxAge: 86400 // 24 hours
        };
    }

    /**
     * Get Helmet security configuration
     * @returns {Object} Helmet options
     */
    getHelmetOptions() {
        return {
            // Content Security Policy
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    fontSrc: ["'self'"],
                    connectSrc: ["'self'"],
                    mediaSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    childSrc: ["'none'"],
                    workerSrc: ["'none'"],
                    frameAncestors: ["'none'"],
                    formAction: ["'self'"],
                    baseUri: ["'self'"],
                    manifestSrc: ["'self'"]
                }
            },

            // HTTP Strict Transport Security
            hsts: {
                maxAge: 31536000, // 1 year
                includeSubDomains: true,
                preload: true
            },

            // X-Content-Type-Options
            noSniff: true,

            // X-Frame-Options
            frameguard: {
                action: 'deny'
            },

            // X-XSS-Protection
            xssFilter: true,

            // Referrer Policy
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin'
            },

            // Hide X-Powered-By header
            hidePoweredBy: true,

            // DNS Prefetch Control
            dnsPrefetchControl: {
                allow: false
            },

            // Don't infer IE compatibility mode
            ieNoOpen: true,

            // Prevent MIME type sniffing
            noSniff: true
        };
    }

    /**
     * Get Morgan logging configuration
     * @returns {Object} Morgan options
     */
    getMorganOptions() {
        const format = process.env.NODE_ENV === 'production' 
            ? 'combined' 
            : 'dev';

        return {
            format,
            skip: (req, res) => {
                // Skip logging for health check endpoints
                return req.url === '/health' || req.url === '/ping';
            }
        };
    }

    /**
     * Initialize all security middleware
     * @param {Object} app - Express application instance
     */
    init(app) {
        // Request ID middleware
        app.use((req, res, next) => {
            req.requestId = require('crypto').randomUUID();
            res.setHeader('X-Request-ID', req.requestId);
            next();
        });

        // Trust proxy for proper IP detection
        app.set('trust proxy', 1);

        // Morgan logging
        if (process.env.MORGAN_ENABLED === 'true') {
            app.use(morgan(this.morganOptions.format, {
                skip: this.morganOptions.skip
            }));
        }

        // Helmet security headers
        if (process.env.HELMET_ENABLED === 'true') {
            app.use(helmet(this.helmetOptions));
        }

        // CORS
        if (process.env.CORS_ENABLED === 'true') {
            app.use(cors(this.corsOptions));
        }

        // Rate limiting middleware
        this.setupRateLimiting(app);

        // Request timeout middleware
        this.setupRequestTimeout(app);

        console.log('✅ Security middleware initialized');
    }

    /**
     * Setup rate limiting
     * @param {Object} app - Express application instance
     */
    setupRateLimiting(app) {
        try {
            // Simple rate limiting without external dependencies
            const rateLimitMap = new Map();
            
            app.use((req, res, next) => {
                const clientIP = req.ip || req.connection.remoteAddress;
                const now = Date.now();
                const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
                const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
                
                if (!rateLimitMap.has(clientIP)) {
                    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
                    return next();
                }
                
                const clientData = rateLimitMap.get(clientIP);
                
                if (now > clientData.resetTime) {
                    // Reset the window
                    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
                    return next();
                }
                
                if (clientData.count >= maxRequests) {
                    return res.status(429).json({
                        error: 'Rate limit exceeded',
                        message: 'Too many requests from this IP, please try again later.',
                        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
                    });
                }
                
                clientData.count++;
                rateLimitMap.set(clientIP, clientData);
                next();
            });
            
            console.log('✅ Custom rate limiting configured');
        } catch (error) {
            console.warn('⚠️  Rate limiting setup failed:', error.message);
        }
    }

    /**
     * Setup request timeout
     * @param {Object} app - Express application instance
     */
    setupRequestTimeout(app) {
        app.use((req, res, next) => {
            const timeout = 30000; // 30 seconds
            
            const timer = setTimeout(() => {
                if (!res.headersSent) {
                    res.status(408).json({
                        error: 'Request Timeout',
                        message: 'The request took too long to process'
                    });
                }
            }, timeout);

            res.on('finish', () => {
                clearTimeout(timer);
            });

            next();
        });
    }
}

module.exports = SecurityMiddleware;
