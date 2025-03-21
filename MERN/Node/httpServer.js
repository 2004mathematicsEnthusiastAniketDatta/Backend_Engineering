/**
 * @fileoverview Main server application entry point
 * @description Professional Express server with industry-standard setup
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Routes
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import notFoundHandler from './middleware/notFoundHandler.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());  // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // CORS preflight request cache (24 hours)
}));

// Request parsing
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression
app.use(compression());

// Logging
if (!isProduction) {
  // Development logging
  app.use(morgan('dev'));
} else {
  // Production logging to file
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs', 'access.log'), 
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Custom request logger
app.use(requestLogger);

// Static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Trust proxy (important for production deployments with load balancers)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/v1', apiRoutes);
app.use('/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API',
    documentation: '/api/docs',
    version: '1.0.0'
  });
});

// 404 handler - should be after all routes
app.use(notFoundHandler);

// Global error handler - should be last middleware
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 4000;

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  // Close database connections, finish processing requests, etc.
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Unhandled rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;