// Import the built-in HTTPS module to create secure HTTP servers
const https = require('https');
// Import the file system module to read SSL certificate files
const fs = require('fs');
// Import the path module to handle file and directory paths
const path = require('path');

/**
 * HTTPS.js
 *
 * Minimal HTTPS server using Node.js built-in https module.
 *
 * To generate a self-signed certificate for local testing:
 *   mkdir -p certs
 *   openssl req -x509 -newkey rsa:4096 -nodes -keyout certs/server.key -out certs/server.crt -days 365 \
 *     -subj "/C=US/ST=State/L=City/O=Org/OU=Dev/CN=localhost"
 *
 * Save server.key and server.crt under ./certs then run:
 *   node HTTPS.js
 *
 * The server listens on port 8443 (non-root). Visit: https://localhost:8443/
 */


// Try to locate key and cert in a few common locations and filename variants.
// Get the directory path where this script is located
const SCRIPT_DIR = __dirname;
// Create a path to the 'certs' subdirectory relative to script location
const CERT_DIR = path.resolve(SCRIPT_DIR, 'certs');

// Array of common private key file names to search for
const keyNames = ['server.key', 'key.pem', 'private.key'];
// Array of common certificate file names to search for
const certNames = ['server.crt', 'server.cert', 'cert.pem', 'server.pem'];

// Helper function to find the first existing file from a list of possible names
function findExisting(dir, names) {
    // Loop through each possible filename
    for (const n of names) {
        // Create the full path by joining directory and filename
        const p = path.join(dir, n);
        // Check if the file exists at this path
        if (fs.existsSync(p)) return p;
    }
    // Return null if no file was found
    return null;
}

// Array to track which file paths were successfully found (for debugging)
const triedPaths = [];

// look in ./certs first, then script dir
// First, search for private key file in the certs directory
let keyPath = findExisting(CERT_DIR, keyNames);
// If not found in certs, search in the script directory
if (!keyPath) keyPath = findExisting(SCRIPT_DIR, keyNames);
// If a key was found, add its path to the tracked paths
if (keyPath) triedPaths.push(keyPath);

// First, search for certificate file in the certs directory
let certPath = findExisting(CERT_DIR, certNames);
// If not found in certs, search in the script directory
if (!certPath) certPath = findExisting(SCRIPT_DIR, certNames);
// If a certificate was found, add its path to the tracked paths
if (certPath) triedPaths.push(certPath);

// Check if both private key and certificate files were found
if (!keyPath || !certPath) {
    console.error('Could not find both a TLS private key and certificate. Tried the following paths:');
    // show the likely candidates for easier debugging
    // Create array to hold all possible file paths that were checked
    const allTried = [];
    // Loop through both directories (certs and script directory)
    for (const d of [CERT_DIR, SCRIPT_DIR]) {
        // Loop through all possible key and certificate filenames
        for (const n of keyNames.concat(certNames)) {
            // Add the full path to the list of attempted paths
            allTried.push(path.join(d, n));
        }
    }
    // Display each attempted path to help with debugging
    allTried.forEach(p => console.error('  -', p));
    console.error('\nGenerate them with the openssl command in the file header or place your files in one of the locations above.');
    // Exit the process with error code 1 (indicating failure)
    process.exit(1);
}

// Create the SSL options object required by the HTTPS server
const options = {
    // Read the private key file synchronously and store as Buffer
    key: fs.readFileSync(keyPath),
    // Read the certificate file synchronously and store as Buffer
    cert: fs.readFileSync(certPath)
};

// Get the port number from environment variable, or default to 8443
const port = process.env.PORT || 8443;

// Create the HTTPS server with SSL options and request handler callback
const server = https.createServer(options, (req, res) => {
    // Very small router
    // Check if request is GET method and URL path is root "/"
    if (req.method === 'GET' && req.url === '/') {
        // Set response status to 200 (OK) and headers
        res.writeHead(200, {
            // Set content type to plain text with UTF-8 encoding
            'Content-Type': 'text/plain; charset=utf-8',
            // Add HSTS header for security (forces HTTPS for 1 year)
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
        });
        // Send the response body and end the response
        res.end('Hello world\n');
        // Exit early from the callback function
        return;
    }

    // Fallback: echo request info
    // For any other request, return 404 status with JSON response
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    // Send JSON response with error details and request information
    res.end(JSON.stringify({
        error: 'Not found',
        method: req.method,
        url: req.url
    }, null, 2));
});

// Start the server listening on the specified port
server.listen(port, () => {
    // Log message when server successfully starts listening
    console.log(`HTTPS server listening on https://localhost:${port}/`);
});

// Set up error event handler for the server
server.on('error', (err) => {
    // Check if error is specifically "address already in use"
    if (err && err.code === 'EADDRINUSE') {
        // Log specific error message for port already in use
        console.error(`Port ${port} is already in use.`);
        // Exit process with error code 1
        process.exit(1);
    }
    // For any other server error, log the error message
    console.error('Server error:', err && err.message ? err.message : err);
    // Exit process with error code 1
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.close(() => process.exit(0));
});