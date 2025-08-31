const fs = require('fs');
const path = require('path');

/**
 * TLS Configuration for HTTPS Server
 * Implements industry-standard security practices
 */
class TLSConfig {
    constructor() {
        this.sslKeyPath = process.env.SSL_KEY_PATH || './certs/server.key';
        this.sslCertPath = process.env.SSL_CERT_PATH || './certs/server.crt';
    }

    /**
     * Get TLS options for HTTPS server
     * @returns {Object} TLS configuration object
     */
    getTLSOptions() {
        try {
            const options = {
                // SSL Certificate and Key
                key: fs.readFileSync(path.resolve(this.sslKeyPath)),
                cert: fs.readFileSync(path.resolve(this.sslCertPath)),
                
                // TLS Version Configuration - Force TLS 1.3
                minVersion: 'TLSv1.3',
                maxVersion: 'TLSv1.3',
                
                // Cipher Suite Configuration (TLS 1.3 ciphers)
                ciphers: [
                    'TLS_AES_256_GCM_SHA384',
                    'TLS_CHACHA20_POLY1305_SHA256',
                    'TLS_AES_128_GCM_SHA256'
                ].join(':'),
                
                // Security Options
                honorCipherOrder: true,
                
                // Session Configuration
                sessionIdContext: 'https-server',
                
                // OCSP Stapling (if needed in production)
                requestOCSP: false,
                
                // Client Certificate Verification (disabled for development)
                requestCert: false,
                rejectUnauthorized: false,
                
                // Additional Security Headers
                secureOptions: this.getSecureOptions()
            };

            return options;
        } catch (error) {
            console.error('Error loading TLS certificates:', error.message);
            throw new Error('Failed to load TLS configuration. Please ensure certificates exist.');
        }
    }

    /**
     * Validate TLS configuration
     * @returns {boolean} True if configuration is valid
     */
    validateConfig() {
        try {
            // Check if certificate files exist
            if (!fs.existsSync(this.sslKeyPath)) {
                throw new Error(`SSL key file not found: ${this.sslKeyPath}`);
            }
            
            if (!fs.existsSync(this.sslCertPath)) {
                throw new Error(`SSL certificate file not found: ${this.sslCertPath}`);
            }

            // Check file permissions (should be readable)
            fs.accessSync(this.sslKeyPath, fs.constants.R_OK);
            fs.accessSync(this.sslCertPath, fs.constants.R_OK);

            console.log('✅ TLS configuration validated successfully');
            return true;
        } catch (error) {
            console.error('❌ TLS configuration validation failed:', error.message);
            return false;
        }
    }

    /**
     * Get security headers for HTTPS responses
     * @returns {Object} Security headers object
     */
    getSecurityHeaders() {
        return {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; child-src 'none'; worker-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; manifest-src 'self';"
        };
    }

    /**
     * Get secure SSL options
     * @returns {number} Secure options bitmask
     */
    getSecureOptions() {
        try {
            const constants = require('constants');
            return constants.SSL_OP_NO_SSLv2 | 
                   constants.SSL_OP_NO_SSLv3 | 
                   constants.SSL_OP_NO_TLSv1 | 
                   constants.SSL_OP_NO_TLSv1_1 | 
                   constants.SSL_OP_NO_TLSv1_2;
        } catch (error) {
            console.warn('⚠️  Could not load SSL constants, using defaults');
            return 0;
        }
    }
}

module.exports = TLSConfig;
