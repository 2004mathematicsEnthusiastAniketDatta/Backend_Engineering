# Industry-Standard HTTPS Server with TLS 1.3

A production-ready HTTPS server implementation with modern security features and TLS 1.3 support.

## 🚀 Features

- **TLS 1.3 Encryption**: Latest TLS protocol for maximum security
- **Comprehensive Security**: Helmet.js, CORS, Rate Limiting, CSP headers
- **Request Logging**: Morgan middleware for detailed request logging
- **Error Handling**: Centralized error handling with proper status codes
- **Health Checks**: Built-in health and status endpoints
- **Graceful Shutdown**: Proper cleanup on process termination
- **Development SSL**: Self-signed certificates for local development

## 📋 Prerequisites

- Node.js 16+ (for TLS 1.3 support)
- OpenSSL (for certificate generation)
- npm or yarn

## 🛠️ Installation

1. Clone the repository and navigate to the server directory:
```bash
cd /path/to/Backend_Engineering/MERN/Node/Server
```

2. Install dependencies:
```bash
npm install
```

3. Generate SSL certificates (for development):
```bash
npm run generate-certs
```

4. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `8443` | HTTPS server port |
| `HOST` | `localhost` | Server host |
| `SSL_KEY_PATH` | `./certs/server.key` | Path to SSL private key |
| `SSL_CERT_PATH` | `./certs/server.crt` | Path to SSL certificate |
| `HELMET_ENABLED` | `true` | Enable Helmet security headers |
| `CORS_ENABLED` | `true` | Enable CORS middleware |
| `MORGAN_ENABLED` | `true` | Enable request logging |
| `CORS_ORIGIN` | `https://localhost:3000,https://localhost:8080` | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window |

### TLS Configuration

The server enforces TLS 1.3 with the following security measures:

- **Minimum TLS Version**: TLS 1.3
- **Cipher Suites**: 
  - TLS_AES_256_GCM_SHA384
  - TLS_CHACHA20_POLY1305_SHA256
  - TLS_AES_128_GCM_SHA256
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Perfect Forward Secrecy**: Enabled by default

## 🚀 Usage

### Development Mode

Start the server with automatic restart on file changes:
```bash
npm run dev
```

### Production Mode

Start the server in production mode:
```bash
npm start
```

### Testing the Server

1. **Health Check**:
```bash
curl -k https://localhost:8443/health
```

2. **TLS Information**:
```bash
curl -k https://localhost:8443/tls-info
```

3. **API Status**:
```bash
curl -k https://localhost:8443/api/status
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Welcome message and server info |
| `/health` | GET | Health check endpoint |
| `/ping` | GET | Simple ping-pong response |
| `/tls-info` | GET | TLS connection information |
| `/api/status` | GET | Detailed API status and features |

## 🔒 Security Features

### Headers

- **Strict-Transport-Security**: Forces HTTPS connections
- **Content-Security-Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information

### Rate Limiting

- Default: 100 requests per 15-minute window
- Configurable via environment variables
- Returns proper HTTP 429 status with retry information

### Request Validation

- JSON body size limit: 10MB
- Request timeout: 30 seconds
- Proper error handling for malformed requests

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the HTTPS server |
| `npm run dev` | Start with nodemon (development) |
| `npm run generate-certs` | Generate new SSL certificates |
| `npm run clean-certs` | Remove existing certificates |
| `npm run validate-certs` | Validate certificate information |
| `npm run check-tls` | Test TLS connection |

## 📁 Project Structure

```
├── src/
│   ├── httpsServer.js          # Main server file
│   └── securityMiddleware.js   # Security middleware
├── config/
│   └── tlsConfig.js           # TLS configuration
├── certs/
│   ├── server.key             # SSL private key
│   ├── server.crt             # SSL certificate
│   └── server.csr             # Certificate signing request
├── .env                       # Environment configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:
```bash
# Find process using port 8443
sudo lsof -i :8443
# Kill the process
sudo kill -9 <PID>
```

2. **Certificate errors**:
```bash
# Regenerate certificates
npm run generate-certs
```

3. **Permission denied**:
```bash
# Run with sudo (not recommended) or use port > 1024
sudo npm start
```

### Browser Security Warnings

For development, browsers will show security warnings for self-signed certificates. You can:

1. Click "Advanced" → "Proceed to localhost (unsafe)"
2. Use curl with `-k` flag to bypass certificate validation
3. Add the certificate to your system's trusted store (advanced)

## 🔍 Monitoring

### Logs

The server provides detailed logging including:

- Request/response information (Morgan)
- Error stack traces (development mode)
- Security events
- TLS handshake information

### Health Monitoring

Monitor server health using the `/health` endpoint:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "tls": "TLS 1.3",
  "port": 8443
}
```

## 🚀 Production Deployment

### SSL Certificates

Replace self-signed certificates with CA-signed certificates:

1. Obtain certificates from a trusted CA (Let's Encrypt, etc.)
2. Update `SSL_KEY_PATH` and `SSL_CERT_PATH` in `.env`
3. Ensure proper file permissions (600 for private key)

### Environment Configuration

```bash
NODE_ENV=production
PORT=443
HOST=0.0.0.0
SSL_KEY_PATH=/path/to/production/private.key
SSL_CERT_PATH=/path/to/production/certificate.crt
```

### Process Management

Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start src/httpsServer.js --name "https-server"
pm2 startup
pm2 save
```

## 📝 License

ISC License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📧 Support

For issues and questions, please create an issue in the repository.
