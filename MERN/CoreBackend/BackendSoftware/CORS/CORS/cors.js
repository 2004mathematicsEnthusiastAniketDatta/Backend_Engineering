const cors = require('cors');

// CORS configuration with security best practices
const corsOptions = {
    // Specify allowed origins (replace with your actual domains)
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://yourdomain.com',
            'https://www.yourdomain.com',
            'https://staging.yourdomain.com'
        ];
        
        // Allow requests with no origin (mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    
    // Specify allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    // Allowed headers
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-Access-Token'
    ],
    
    // Enable credentials (cookies, authorization headers)
    credentials: true,
    
    // Preflight cache duration (in seconds)
    maxAge: 86400, // 24 hours
    
    // Disable for security unless needed
    optionsSuccessStatus: 200
};

// For development environment
const devCorsOptions = {
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['*']
};

// Export based on environment
const corsConfig = process.env.NODE_ENV === 'production' ? corsOptions : devCorsOptions;

module.exports = {
    corsMiddleware: cors(corsConfig),
    corsOptions,
    devCorsOptions
};