'use strict';

const net = require('net');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
/**
 * Logger interface for dependency injection
 * Allows flexible logging implementations
 */
class Logger {
  /**
   * Log at info level
   * @param {string} message
   * @param {Object} meta
   */
  info(message, meta = {}) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
  }

  /**
   * Log at error level
   * @param {string} message
   * @param {Error|Object} error
   * @param {Object} meta
   */
  error(message, error, meta = {}) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error instanceof Error ? error.message : error, meta);
  }

  /**
   * Log at warn level
   * @param {string} message
   * @param {Object} meta
   */
  warn(message, meta = {}) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
  }

  /**
   * Log at debug level
   * @param {string} message
   * @param {Object} meta
   */
  debug(message, meta = {}) {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, meta);
  }
}

/**
 * Metrics collector for observability
 * Tracks connection statistics and performance data
 */
class MetricsCollector {
  constructor() {
    this.totalConnections = 0;
    this.activeConnections = 0;
    this.totalBytesReceived = 0;
    this.totalBytesSent = 0;
    this.totalErrors = 0;
    this.connectionDurations = [];
    this.peakConnections = 0;
  }

  /**
   * Record a new connection
   */
  recordConnection() {
    this.totalConnections++;
    this.activeConnections++;
    if (this.activeConnections > this.peakConnections) {
      this.peakConnections = this.activeConnections;
    }
  }

  /**
   * Record connection termination
   * @param {number} duration - Connection duration in milliseconds
   */
  recordDisconnection(duration) {
    this.activeConnections--;
    this.connectionDurations.push(duration);
  }

  /**
   * Record bytes received
   * @param {number} bytes
   */
  recordBytesReceived(bytes) {
    this.totalBytesReceived += bytes;
  }

  /**
   * Record bytes sent
   * @param {number} bytes
   */
  recordBytesSent(bytes) {
    this.totalBytesSent += bytes;
  }

  /**
   * Record an error occurrence
   */
  recordError() {
    this.totalErrors++;
  }

  /**
   * Get average connection duration
   * @returns {number} Average duration in milliseconds
   */
  getAverageConnectionDuration() {
    if (this.connectionDurations.length === 0) return 0;
    const sum = this.connectionDurations.reduce((a, b) => a + b, 0);
    return sum / this.connectionDurations.length;
  }

  /**
   * Get current metrics snapshot
   * @returns {Object} Metrics object
   */
  getSnapshot() {
    return {
      totalConnections: this.totalConnections,
      activeConnections: this.activeConnections,
      peakConnections: this.peakConnections,
      totalBytesReceived: this.totalBytesReceived,
      totalBytesSent: this.totalBytesSent,
      totalErrors: this.totalErrors,
      averageConnectionDuration: this.getAverageConnectionDuration(),
      throughput: {
        bytesPerConnection: this.totalConnections > 0 ? (this.totalBytesReceived / this.totalConnections).toFixed(2) : 0,
      },
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.totalConnections = 0;
    this.activeConnections = 0;
    this.totalBytesReceived = 0;
    this.totalBytesSent = 0;
    this.totalErrors = 0;
    this.connectionDurations = [];
    this.peakConnections = 0;
  }
}

/**
 * Configuration manager
 * Handles server configuration with validation
 */
class ServerConfig {
  constructor(options = {}) {
    this.port = options.port ?? 5000;
    this.host = options.host ?? 'localhost';
    this.maxConnections = options.maxConnections ?? 1000;
    this.socketTimeout = options.socketTimeout ?? 60000; // 60 seconds
    this.maxBacklog = options.maxBacklog ?? 128;
    this.enableMetrics = options.enableMetrics ?? true;
    this.bufferSize = options.bufferSize ?? 64 * 1024; // 64KB

    this.validate();
  }

  /**
   * Validate configuration
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (!Number.isInteger(this.port) || this.port < 1 || this.port > 65535) {
      throw new Error('Port must be an integer between 1 and 65535');
    }
    if (typeof this.host !== 'string') {
      throw new Error('Host must be a string');
    }
    if (!Number.isInteger(this.maxConnections) || this.maxConnections < 1) {
      throw new Error('maxConnections must be a positive integer');
    }
    if (!Number.isInteger(this.socketTimeout) || this.socketTimeout < 0) {
      throw new Error('socketTimeout must be a non-negative integer');
    }
  }

  /**
   * Get configuration object
   * @returns {Object}
   */
  toObject() {
    return {
      port: this.port,
      host: this.host,
      maxConnections: this.maxConnections,
      socketTimeout: this.socketTimeout,
      maxBacklog: this.maxBacklog,
      bufferSize: this.bufferSize,
      enableMetrics: this.enableMetrics,
    };
  }
}

/**
 * Connection handler for individual client connections
 * Encapsulates the logic for handling a single TCP connection
 */
class ClientConnection {
  /**
   * @param {net.Socket} socket
   * @param {string} clientId
   * @param {Logger} logger
   * @param {MetricsCollector} metrics
   * @param {ServerConfig} config
   */
  constructor(socket, clientId, logger, metrics, config) {
    this.socket = socket;
    this.clientId = clientId;
    this.logger = logger;
    this.metrics = metrics;
    this.config = config;
    this.startTime = Date.now();
    this.bytesReceived = 0;
    this.bytesSent = 0;
    this.isActive = true;

    this.setup();
  }

  /**
   * Setup socket event handlers
   * @private
   */
  setup() {
    this.socket.setTimeout(this.config.socketTimeout);

    this.socket.on('data', (data) => this.handleData(data));
    this.socket.on('error', (error) => this.handleError(error));
    this.socket.on('end', () => this.handleEnd());
    this.socket.on('timeout', () => this.handleTimeout());
  }

  /**
   * Handle incoming data
   * @param {Buffer} data
   * @private
   */
  handleData(data) {
    if (!this.isActive) return;

    try {
      this.bytesReceived += data.length;
      this.metrics.recordBytesReceived(data.length);

      this.logger.debug('Data received', {
        clientId: this.clientId,
        bytes: data.length,
        totalBytesReceived: this.bytesReceived,
      });

      this.echo(data);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Echo data back to client
   * @param {Buffer} data
   * @private
   */
  echo(data) {
    if (!this.socket.writable) {
      this.logger.warn('Socket not writable', { clientId: this.clientId });
      return;
    }

    this.socket.write(data, (error) => {
      if (error) {
        this.handleError(error);
      } else {
        this.bytesSent += data.length;
        this.metrics.recordBytesSent(data.length);
        this.logger.debug('Data echoed', {
          clientId: this.clientId,
          bytes: data.length,
        });
      }
    });
  }

  /**
   * Handle socket errors
   * @param {Error} error
   * @private
   */
  handleError(error) {
    this.metrics.recordError();
    this.logger.error('Client connection error', error, {
      clientId: this.clientId,
      code: error.code,
    });

    this.close();
  }

  /**
   * Handle connection end
   * @private
   */
  handleEnd() {
    this.logger.info('Client disconnected', {
      clientId: this.clientId,
      duration: Date.now() - this.startTime,
      bytesReceived: this.bytesReceived,
      bytesSent: this.bytesSent,
    });

    this.close();
  }

  /**
   * Handle socket timeout
   * @private
   */
  handleTimeout() {
    this.logger.warn('Client timeout', {
      clientId: this.clientId,
      timeout: this.config.socketTimeout,
    });

    this.close();
  }

  /**
   * Close the connection
   * @private
   */
  close() {
    if (!this.isActive) return;

    this.isActive = false;
    const duration = Date.now() - this.startTime;
    this.metrics.recordDisconnection(duration);

    try {
      this.socket.destroy();
    } catch (error) {
      this.logger.debug('Error destroying socket', { clientId: this.clientId });
    }
  }

  /**
   * Get connection stats
   * @returns {Object}
   */
  getStats() {
    return {
      clientId: this.clientId,
      duration: Date.now() - this.startTime,
      bytesReceived: this.bytesReceived,
      bytesSent: this.bytesSent,
      isActive: this.isActive,
    };
  }
}

/**
 * TCP Echo Server
 * 
 * A production-grade TCP echo server with comprehensive error handling,
 * metrics collection, and graceful shutdown.
 */
class TCPEchoServer extends EventEmitter {
  /**
   * @param {ServerConfig|Object} config
   * @param {Logger} logger
   * @param {MetricsCollector} metrics
   */
  constructor(config = {}, logger = null, metrics = null) {
    super();

    // Initialize configuration
    this.config = config instanceof ServerConfig ? config : new ServerConfig(config);

    // Initialize dependencies
    this.logger = logger || new Logger();
    this.metrics = metrics || new MetricsCollector();

    // Server state
    this.server = null;
    this.isRunning = false;
    this.connections = new Map();
    this.shutdownSignals = ['SIGINT', 'SIGTERM'];

    this.setupGracefulShutdown();
  }

  /**
   * Start the TCP server
   * @returns {Promise<void>}
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        if (this.isRunning) {
          const error = new Error('Server is already running');
          this.logger.warn(error.message);
          return reject(error);
        }

        this.server = net.createServer((socket) => this.handleConnection(socket));

        this.server.on('error', (error) => this.handleServerError(error));
        this.server.maxConnections = this.config.maxConnections;

        this.server.listen(
          {
            port: this.config.port,
            host: this.config.host,
            backlog: this.config.maxBacklog,
          },
          () => {
            this.isRunning = true;
            const message = `TCP Echo Server listening on ${this.config.host}:${this.config.port}`;
            this.logger.info(message);
            this.emit('listening', { host: this.config.host, port: this.config.port });
            resolve();
          }
        );
      } catch (error) {
        this.logger.error('Failed to start server', error);
        reject(error);
      }
    });
  }

  /**
   * Stop the TCP server
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.isRunning) {
        this.logger.warn('Server is not running');
        return resolve();
      }

      try {
        // Close all active connections
        this.closeAllConnections();

        // Close the server
        this.server.close(() => {
          this.isRunning = false;
          this.logger.info('TCP Echo Server stopped');
          this.emit('stopped');
          resolve();
        });

        // Force close after timeout
        setTimeout(() => {
          this.logger.warn('Forcefully closing server after timeout');
          this.isRunning = false;
          resolve();
        }, 10000);
      } catch (error) {
        this.logger.error('Error stopping server', error);
        reject(error);
      }
    });
  }

  /**
   * Handle new client connection
   * @param {net.Socket} socket
   * @private
   */
  handleConnection(socket) {
    const clientId = uuidv4();

    if (!this.config.enableMetrics) {
      this.metrics.recordConnection();
    }

    this.logger.info('Client connected', {
      clientId,
      remoteAddress: socket.remoteAddress,
      remotePort: socket.remotePort,
      activeConnections: this.connections.size + 1,
    });

    // Create client connection handler
    const clientConnection = new ClientConnection(
      socket,
      clientId,
      this.logger,
      this.metrics,
      this.config
    );

    // Track connection
    this.connections.set(clientId, clientConnection);

    // Handle connection cleanup
    socket.on('close', () => {
      this.connections.delete(clientId);
      this.logger.debug('Connection removed from registry', { clientId });
    });

    this.emit('connection', { clientId, socket });
  }

  /**
   * Handle server errors
   * @param {Error} error
   * @private
   */
  handleServerError(error) {
    this.metrics.recordError();

    if (error.code === 'EADDRINUSE') {
      this.logger.error(
        'Port already in use. Try a different port.',
        error,
        { port: this.config.port }
      );
    } else if (error.code === 'EACCES') {
      this.logger.error(
        'Permission denied. Need higher privileges.',
        error,
        { port: this.config.port }
      );
    } else {
      this.logger.error('Server error', error);
    }

    this.emit('error', error);
  }

  /**
   * Close all active connections
   * @private
   */
  closeAllConnections() {
    const connectionIds = Array.from(this.connections.keys());
    this.logger.info(`Closing ${connectionIds.length} active connections`);

    for (const clientId of connectionIds) {
      const clientConnection = this.connections.get(clientId);
      if (clientConnection) {
        clientConnection.close();
      }
    }

    this.connections.clear();
  }

  /**
   * Setup graceful shutdown handlers
   * @private
   */
  setupGracefulShutdown() {
    this.shutdownSignals.forEach((signal) => {
      process.on(signal, () => {
        this.logger.info(`Received ${signal}, initiating graceful shutdown`);
        this.stop()
          .then(() => {
            this.logger.info('Graceful shutdown completed');
            process.exit(0);
          })
          .catch((error) => {
            this.logger.error('Error during shutdown', error);
            process.exit(1);
          });
      });
    });
  }

  /**
   * Get metrics snapshot
   * @returns {Object}
   */
  getMetrics() {
    return this.metrics.getSnapshot();
  }

  /**
   * Get active connections list
   * @returns {Array<Object>}
   */
  getActiveConnections() {
    return Array.from(this.connections.values()).map((conn) => conn.getStats());
  }

  /**
   * Get server status
   * @returns {Object}
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config.toObject(),
      metrics: this.getMetrics(),
      activeConnections: this.getActiveConnections(),
    };
  }

  /**
   * Reset metrics (useful for testing)
   */
  resetMetrics() {
    this.metrics.reset();
    this.logger.debug('Metrics reset');
  }
}

// Export for use as module
module.exports = {
  TCPEchoServer,
  ServerConfig,
  ClientConnection,
  MetricsCollector,
  Logger,
};

/**
 * Standalone execution
 * Allow this script to be run directly
 */
if (require.main === module) {
  (async () => {
    const config = new ServerConfig({
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
      host: process.env.HOST || 'localhost',
      enableMetrics: true,
    });

    const logger = new Logger();
    const metrics = new MetricsCollector();
    const server = new TCPEchoServer(config, logger, metrics);

    // Event listeners
    server.on('listening', ({ host, port }) => {
      logger.info(`Server listening on ${host}:${port}`);
    });

    server.on('connection', ({ clientId }) => {
      logger.info(`New connection: ${clientId}`);
    });

    server.on('error', (error) => {
      logger.error('Server error', error);
    });

    // Print metrics periodically
    const metricsInterval = setInterval(() => {
      const status = server.getStatus();
      logger.info('Server status', {
        metrics: status.metrics,
        activeConnections: status.activeConnections.length,
      });
    }, 30000); // Every 30 seconds

    // Start server
    try {
      await server.start();
    } catch (error) {
      logger.error('Failed to start server', error);
      clearInterval(metricsInterval);
      process.exit(1);
    }

    // Cleanup on shutdown
    process.on('SIGINT', () => {
      clearInterval(metricsInterval);
    });
  })();
}
