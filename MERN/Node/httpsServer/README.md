# Secure HTTPS Server with TLS 1.3

A modern, secure HTTPS server implementation using Node.js with TLS 1.3 support and advanced security practices.

## Features

🔒 **Security Features:**
- TLS 1.3 support with TLS 1.2 fallback
- Strong cipher suites configuration
- Perfect Forward Secrecy (PFS)
- Security headers via Helmet.js
- Rate limiting protection
- CORS configuration
- Content Security Policy (CSP)
- Request size limits
- Input validation

🚀 **Performance Features:**
- Response compression
- Keep-alive connections
- Session resumption
- Optimized cipher preferences

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate SSL Certificates (Development)
```bash
npm run generate-certs
```

### 3. Start the Server
```bash
npm start
```

The server will be available at: `https://localhost:8443`

## API Endpoints

- `GET /` - Server information
- `GET /health` - Health check endpoint
- `GET /api/secure` - Secure API example with TLS information

## Security Headers

The server implements the following security headers:

- **Strict-Transport-Security (HSTS)** - Forces HTTPS connections
- **Content-Security-Policy (CSP)** - Prevents XSS attacks
- **X-Content-Type-Options** - Prevents MIME sniffing
- **X-Frame-Options** - Prevents clickjacking
- **X-XSS-Protection** - XSS filtering
- **Referrer-Policy** - Controls referrer information

## TLS Configuration

- **Minimum Version:** TLS 1.2
- **Maximum Version:** TLS 1.3
- **Cipher Suites:** Modern, secure cipher suites only
- **Perfect Forward Secrecy:** Enabled
- **Session Resumption:** Enabled for performance

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP per window
- **Bypass:** Localhost (development)

## Development

### Generate New Certificates
```bash
npm run generate-certs
```

### Start with Auto-reload
```bash
npm run dev
```

## Environment Variables

- `NODE_ENV` - Set to 'production' for production mode
- `PORT` - Override default port (8443)

## Security Best Practices Implemented

1. **Transport Layer Security**
   - TLS 1.3 with strong cipher suites
   - Perfect Forward Secrecy
   - Certificate validation

2. **Application Security**
   - Input validation and sanitization
   - Request size limits
   - Rate limiting
   - Security headers

3. **Error Handling**
   - Graceful shutdown
   - Error logging without information disclosure
   - Timeout configuration

4. **Monitoring & Logging**
   - Request logging
   - Health check endpoint
   - Performance metrics

## Production Deployment

For production deployment, consider:

1. Use certificates from a trusted CA (Let's Encrypt, etc.)
2. Set `NODE_ENV=production`
3. Configure proper logging
4. Set up monitoring
5. Use a reverse proxy (nginx, CloudFlare)
6. Implement proper secret management

## Certificate Management

### Development (Self-signed)
The included script generates self-signed certificates suitable for development.

### Production
Replace the self-signed certificates with certificates from a trusted Certificate Authority:

```bash
# Place your production certificates in the certs directory
cp your-domain.key certs/server.key
cp your-domain.crt certs/server.crt
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 8443
   lsof -i :8443
   # Kill the process
   kill -9 <PID>
   ```

2. **Certificate errors**
   - Regenerate certificates with `npm run generate-certs`
   - Check file permissions on certificate files

3. **Browser security warnings**
   - Accept the self-signed certificate for development
   - Use certificates from a trusted CA for production

## License

MIT License - see LICENSE file for details.
