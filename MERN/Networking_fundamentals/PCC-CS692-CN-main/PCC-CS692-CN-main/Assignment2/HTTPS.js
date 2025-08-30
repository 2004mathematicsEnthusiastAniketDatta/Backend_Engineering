// Import the built-in HTTPS module to create secure HTTP servers
const https = require('https');
// Import the file system module to read SSL certificate files
const fs = require('fs');
// Import the path module to handle file and directory paths
const path = require('path');
const crypto = require('crypto');

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

// X.509 Certificate
// Certificate Header 
// - Version
// - Serial Number
// - Signature Algorithm Identifier
// - Issuer Name (Who issued the certificate)
// - Validity Period (start and end dates)
// - Subject Name ( Owner of the certificate)
// - Subject Public Key Info
// Public Key
// - Algorithm identifier
// - Public Key Data
// Optional Extensions (X.509 v3)
// - Subject Alternative Name (SAN)
// - Key Usage (e.g. digitalSignature, keyEncipherment)
// - Extended Key Usage (e.g. serverAuth, clientAuth)
// - Basic Constraints (e.g. CA:TRUE/FALSE)
// - CRL Distribution Points
// - Authority Key Identifier
// - Subject Key Identifier
// Digital Signature
// - Signature Algorithm Identifier
// - Signature Value ( Signed by Issuer's Private Key )
// Certificates
// Certificates can be "Self Signed"
//  - i.e. private key signing the certificate belong to the public key.
//  - Usually untrusted and used for testing / local.
// Certificates can sign "other certificates"
//  - Creating a trust chain
//  - Issuer name is who issued this
//  - Let's encrypt
// Ultimately a ROOT cert is found 
//   - ROOT certs are always self signed 
//   - They are trusted by everybody.
//   - Installed with OS root (certificate store).
// Root Certificates
// - The top-level certificates in a certificate hierarchy
// - Trust anchors for all certificates below them
// - Must be securely distributed and installed
// - Typically pre-installed in web browsers and operating systems.
// - We require public key infrastructure (PKI) to manage certificates
// TLS: TLS stands for Transport Layer Security and encrypts with the same key on both client and server.
// For that we need to exchange the key securely.
// WE require Public Key Encryption to exchange key.
//We share certificate for authentication.
// TLS 1.2
// - Introduced in 2008
// - Improved security and performance over TLS 1.1
// - Supports modern cryptographic algorithms
// - Widely adopted and used in practice
// RSA
// - Rivest-Shamir-Adleman (RSA) is a widely used public key cryptosystem
// - Based on the mathematical difficulty of factoring large integers
// - Provides secure key exchange and digital signatures
// - First the connection is established the open is created in the client side
// There is RSA public key and RSA private key.
// - Then the client sends a "ClientHello" message to the server
// - The server responds with a "Server Hello" message with x509 certificate
// - The client verifies the server's certificate
// - The key of the client and RSA public key of the server is sent along with Change Cipher , fin
// - Key exchange and authentication occur during the handshake process
// - The client and server establish a secure session using the agreed-upon parameters
// - Man in the Middle cannot decrypt the public key without the private key.
// - The client and server can now securely exchange data.
// - Change the cipher , fin and send response back to client from the server.
// - Encrypted Connection already established.
// - So a get request is sent
// - The server responds with the requested resource.  Here Headers and index.html along with html 
// - is sent as response to the server.
// - The client receives the response and decrypts it using the session key.
// - The client can now access the requested resource securely.
// Finally we close the client
// JSON (JavaScript Object Notation)
// - Lightweight data-interchange format
// - Easy for humans to read and write
// - Easy for machines to parse and generate
// - Based on a subset of the JavaScript programming language
// - Used to transmit data between a server and web application
// - Data is represented as key-value pairs
// - Supports primitive data types (string, number, boolean, null)
// - Supports nested objects and arrays
// Example:
// {
//   "name": "John Doe",
//   "age": 30,
//   "isStudent": false,
//   "address": {
//     "street": "123 Main St",
//     "city": "Anytown"
//   },
//   "courses": ["Math", "Science", "History"]
// }
// JSON methods
// - JSON.stringify(): Converts a JavaScript object to a JSON string
// - JSON.parse(): Parses a JSON string to a JavaScript object

// Request Object (req)
// - Provides information about the incoming HTTP request
// - Properties:
//   - req.method: HTTP method (GET, POST, PUT, DELETE, etc.)
//   - req.url: Requested URL
//   - req.headers: Request headers
//   - req.body: Request body (for POST, PUT requests)
//   - req.query: Query parameters in the URL
//   - req.params: Route parameters (if using a framework like Express)
// - Methods:
//   - req.on('data', (chunk) => {}): Event listener for incoming data chunks in the request body
//   - req.on('end', () => {}): Event listener for the end of the request body
// Example:
// req.method: 'GET'
// req.url: '/?name=John&age=30'
// req.headers: {
//   host: 'localhost:8443',
//   connection: 'keep-alive',
//   'sec-ch-ua': '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
//   'sec-ch-ua-mobile': '?0',
//   'sec-ch-ua-platform': '"macOS"',
//   'upgrade-insecure-requests': '1',
//   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
//   accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//   'sec-fetch-site': 'none',
//   'sec-fetch-mode': 'navigate',
//   'sec-fetch-user': '?1',
//   'sec-fetch-dest': 'document',
//   'accept-encoding': 'gzip, deflate, br',
//   'accept-language': 'en-US,en;q=0.9'
// }
// req.query: { name: 'John', age: '30' }
// Response Object (res)
// - Used to send the HTTP response back to the client
// - Properties:
//   - res.statusCode: HTTP status code (200 OK, 404 Not Found, 500 Internal Server Error, etc.)
//   - res.headers: Response headers
// - Methods:
//   - res.writeHead(statusCode, headers): Sets the status code and headers for the response
//   - res.write(chunk): Sends a chunk of the response body
//   - res.end(chunk): Sends the final chunk of the response body and ends the response
//   - res.setHeader(name, value): Sets a single response header
//   - res.getHeader(name): Gets the value of a response header
//   - res.removeHeader(name): Removes a response header
// Example:
// res.statusCode: 200
// res.headers: { 'Content-Type': 'text/plain' }
// res.writeHead(200, { 'Content-Type': 'text/plain' });
// res.write('Hello, world!');
// res.end();

// HTTPS Concepts and Security Considerations:
// - Always use HTTPS in production to encrypt data in transit.
// - Obtain a certificate from a trusted Certificate Authority (CA) for production use.
// - Keep your server's private key secure.
// - Regularly update your server's software and dependencies to patch security vulnerabilities.
// - Implement security best practices such as:
//   - Using strong TLS versions (TLS 1.2 or higher).
//   - Configuring strong cipher suites.
//   - Setting appropriate HTTP security headers (e.g., Strict-Transport-Security, Content-Security-Policy).
//   - Validating and sanitizing user input to prevent injection attacks.
//   - Protecting against cross-site scripting (XSS) and cross-site request forgery (CSRF) attacks.
//   - Implementing proper authentication and authorization mechanisms.
//   - Regularly monitoring and logging server activity for security incidents.

// Problems with this approach
// - Complexity: Implementing and maintaining strong security measures can be complex and time-consuming.
// - Performance: Some security measures may introduce latency or impact performance.
// - Usability: Striking a balance between security and user experience can be challenging.
// HTTPS encrypts all communication between a client and a server.
// It uses SSL/TLS to secure the connection and verify the server's identity.
// Problems with that approach
// - Encrypting the symmetric key with the public key is simple
// - But this is not perfectly forward
// - Attacker can record all encrypted communications.
// - If the server's private key is leaked (Heart Bleed)
// - They can go back and decrypt everything.
// - We need ephemeral keys! Meet Diffie-Hellman.
// Diffie-Hellman Key Exchange
// - A method for two parties to securely share a secret key over an insecure channel
// - Based on the mathematical difficulty of the discrete logarithm problem
// Heartbleed Bug
// - A critical vulnerability in the OpenSSL cryptographic software library
// - Discovered in April 2014
// - Affected a large number of websites and online services
// - Allowed attackers to steal sensitive information from the server's memory
// - Including private keys, user credentials, and other confidential data
// How it Worked:
// - The Heartbleed bug was caused by a missing bounds check in the OpenSSL implementation of the TLS heartbeat extension (RFC 6520).
// - The heartbeat extension was designed to allow a client to send a small "heartbeat" message to the server, which would then respond with the same message.
// - The purpose of this was to keep the connection alive and detect if the server was still available.
// - However, the OpenSSL implementation did not properly validate the length of the heartbeat message.
// - An attacker could send a heartbeat message with a small payload length but specify a much larger length in the message header.
// - The server would then allocate a buffer based on the length in the header and copy the payload into it.
// - However, since the payload was smaller than the buffer, the server would then read additional data from its memory and send it back to the attacker.
// - This allowed the attacker to steal up to 64KB of data from the server's memory with each heartbeat request.
// Impact:
// - The Heartbleed bug had a significant impact on the security of the internet.
// - It allowed attackers to steal sensitive information from a large number of websites and online services.
// - This information could then be used to compromise user accounts, steal financial data, or launch further attacks.
// - The bug also undermined trust in the security of the internet and raised concerns about the security of open-source software.
// Mitigation:
// - The Heartbleed bug was quickly patched by the OpenSSL project.
// - However, it took time for websites and online services to update their OpenSSL installations.
// - In the meantime, many users were advised to change their passwords and monitor their accounts for suspicious activity.
// - The Heartbleed bug also led to increased scrutiny of open-source software and a greater emphasis on security testing and code review.
// Diffie-Hellman Key Exchange - Detailed Explanation
//
// Diffie-Hellman (DH) is a cryptographic key exchange protocol that allows two parties
// to establish a shared secret key over an insecure communication channel without
// having prior knowledge of each other or sharing any secret information beforehand.
//
// Mathematical Foundation:
// DH is based on the discrete logarithm problem, which is computationally difficult
// to solve for large numbers. The protocol uses modular arithmetic and the concept
// that (g^a mod p)^b mod p = g^(a*b) mod p = (g^b mod p)^a mod p
//
// Key Exchange Process:
//
// 1. Public Parameters Setup:
//    - Both parties agree on two public values:
//      * p: A large prime number (typically 2048 bits or larger)
//      * g: A generator (primitive root modulo p)
//    - These values can be shared publicly and don't need to be secret
//
// 2. Private Key Generation:
//    - Alice generates a random private key 'a' (1 < a < p-1)
//    - Bob generates a random private key 'b' (1 < b < p-1)
//    - These private keys must never be shared
//
// 3. Public Key Calculation:
//    - Alice calculates her public key: A = g^a mod p
//    - Bob calculates his public key: B = g^b mod p
//
// 4. Public Key Exchange:
//    - Alice sends A to Bob over the insecure channel
//    - Bob sends B to Alice over the insecure channel
//    - An eavesdropper can see A, B, g, and p but not a or b
//
// 5. Shared Secret Computation:
//    - Alice computes the shared secret: s = B^a mod p = (g^b)^a mod p = g^(a*b) mod p
//    - Bob computes the shared secret: s = A^b mod p = (g^a)^b mod p = g^(a*b) mod p
//    - Both arrive at the same shared secret without ever transmitting it
//
// Security Properties:
//
// Forward Secrecy (Perfect Forward Secrecy - PFS):
// - Even if long-term private keys are compromised later, past communications remain secure
// - This is achieved by generating ephemeral (temporary) keys for each session
// - Ephemeral Diffie-Hellman (EDH/DHE) generates new key pairs for each connection
//
// Discrete Logarithm Problem:
// - An attacker knows g, p, A = g^a mod p, and B = g^b mod p
// - To break the protocol, they would need to find 'a' from A = g^a mod p
// - This is the discrete logarithm problem, which is computationally infeasible for large p
//
// Variants of Diffie-Hellman:
//
// 1. Classic Diffie-Hellman (Static DH):
//    - Uses fixed, long-term key pairs
//    - Vulnerable if private keys are compromised
//    - Does not provide forward secrecy
//
// 2. Ephemeral Diffie-Hellman (DHE):
//    - Generates new key pairs for each session
//    - Provides perfect forward secrecy
//    - Computationally more expensive but more secure
//
// 3. Elliptic Curve Diffie-Hellman (ECDH):
//    - Uses elliptic curve cryptography instead of modular arithmetic
//    - Provides equivalent security with smaller key sizes
//    - More efficient than traditional DH
//
// 4. Elliptic Curve Ephemeral Diffie-Hellman (ECDHE):
//    - Combines ECDH with ephemeral keys
//    - Currently the most recommended approach
//    - Used in modern TLS 1.3 implementations
//
// Integration with TLS:
//
// In TLS handshake with DHE/ECDHE:
// 1. Client sends ClientHello with supported cipher suites
// 2. Server responds with ServerHello, certificate, and DH parameters
// 3. Server generates ephemeral DH key pair and sends public key
// 4. Client generates ephemeral DH key pair and sends public key
// 5. Both compute shared secret and derive session keys
// 6. All subsequent communication is encrypted with session keys
//
// Advantages over RSA Key Exchange:
// - Forward secrecy: Compromise of server's private key doesn't affect past sessions
// - Better long-term security as quantum computers may break RSA but DH variants exist that are quantum-resistant
// - Session keys are never transmitted, even in encrypted form
//
// Vulnerabilities and Considerations:
//
// 1. Man-in-the-Middle (MITM) Attack:
//    - DH by itself doesn't provide authentication
//    - An attacker can intercept and replace public keys
//    - TLS solves this by signing DH parameters with server's certificate
//
// 2. Small Subgroup Attack:
//    - If generator g has a small order, the shared secret space is reduced
//    - Proper parameter validation is essential
//
// 3. Weak Random Number Generation:
//    - If private keys are predictable, the protocol is broken
//    - Requires cryptographically secure random number generators
//
// 4. Parameter Validation:
//    - Must validate that received public keys are in the correct range
//    - Must ensure parameters p and g are secure
//
// Example Implementation Considerations in Node.js:
//
// const crypto = require('crypto');
//
// // Generate DH parameters (expensive operation, usually pre-computed)
// const dh = crypto.createDiffieHellman(2048);
// dh.generateKeys();
//
// // Get public parameters to share
// const prime = dh.getPrime();
// const generator = dh.getGenerator();
// const publicKey = dh.getPublicKey();
//
// // After receiving other party's public key
// // const sharedSecret = dh.computeSecret(otherPublicKey);
//
// Modern TLS 1.3 Changes:
// - Removed support for static DH (no forward secrecy)
// - Only supports ephemeral key exchange (DHE, ECDHE)
// - Simplified handshake with fewer round trips
// - Mandatory forward secrecy for all connections
//
// Performance Considerations:
// - ECDHE is generally faster than DHE for equivalent security levels
// - Key generation is computationally expensive
// - Some implementations pre-generate DH parameters to improve performance
// - Hardware acceleration available on modern processors
//
// Quantum Resistance:
// - Traditional DH will be broken by sufficiently large quantum computers
// - Post-quantum key exchange algorithms are being developed
// - NIST is standardizing quantum-resistant algorithms
// - Current recommendations include larger key sizes as interim protection
// Diffie Hellman:
// Let us not share the symmetric key at all
// Let us only share parameters enough to generate this.
// Each party generates the same key.
// Party one generates X number (Private)
     // Also generates g and n (public , random and prime)
// Party two generates Y number (Private)

// Public g, n
// Private X -> Private Y 
// during the above transmission we try to compute g^x % n for communication from Public g,n to Public g,n.
// From Private Y to Private X the computation is g^y % n.

// Party 1 takes g to the power of X % n
// g ^ X % n is now a public value
// Cannot be broken to get X!
// Party 2 does the same with Y
// g^Y % n is now a public value
// Cannot be broken to get Y!
// Both parties share the new values.
// Now both parties can compute the shared secret independently:
// Party 1: (g^Y % n)^X % n = g^(Y*X) % n
// Party 2: (g^X % n)^Y % n = g^(X*Y) % n
// Both get the same result: g^(X*Y) % n = shared secret

// This shared secret can now be used as a symmetric encryption key
// without ever having transmitted the actual key over the network.

// Example walkthrough with small numbers for illustration:
// Let's say g = 5, n = 23 (prime)
// Alice chooses private X = 6
// Bob chooses private Y = 15

// Alice computes: g^X % n = 5^6 % 23 = 15625 % 23 = 8
// Bob computes: g^Y % n = 5^15 % 23 = 30517578125 % 23 = 19

// They exchange these public values (8 and 19)

// Alice computes shared secret: 19^6 % 23 = 47045881 % 23 = 2
// Bob computes shared secret: 8^15 % 23 = 35184372088832 % 23 = 2

// Both arrive at the same shared secret: 2

// Security Analysis:
// An eavesdropper sees: g=5, n=23, Alice's public=8, Bob's public=19
// To break this, they would need to solve the discrete log problem:
// Find X such that 5^X ≡ 8 (mod 23) OR find Y such that 5^Y ≡ 19 (mod 23)
// For small numbers this is trivial, but for 2048+ bit numbers it's computationally infeasible

// Real-world Implementation in TLS with ECDHE:
// Modern TLS uses Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) which provides:
// 1. Same mathematical security with smaller key sizes
// 2. Better performance
// 3. Perfect Forward Secrecy through ephemeral keys

// Node.js crypto module example for ECDH:

function demonstrateECDH() {
    // Create ECDH instances for Alice and Bob using P-256 curve
    const alice = crypto.createECDH('secp256k1');
    const bob = crypto.createECDH('secp256k1');
    
    // Generate key pairs
    alice.generateKeys();
    bob.generateKeys();
    
    // Exchange public keys (this happens over the network in TLS)
    const alicePublicKey = alice.getPublicKey();
    const bobPublicKey = bob.getPublicKey();
    
    // Compute shared secrets independently
    const aliceSharedSecret = alice.computeSecret(bobPublicKey);
    const bobSharedSecret = bob.computeSecret(alicePublicKey);
    
    // Verify they match
    console.log('Shared secrets match:', aliceSharedSecret.equals(bobSharedSecret));
    
    // In TLS, this shared secret is used with a Key Derivation Function (KDF)
    // to generate the actual session keys for encryption, MAC, and IV
    return aliceSharedSecret;
}

// TLS 1.3 Key Schedule (simplified):
// The shared secret from ECDHE goes through HKDF (HMAC-based KDF) to derive:
// 1. Handshake traffic keys (for encrypting handshake messages)
// 2. Application traffic keys (for encrypting application data)
// 3. Resumption master secret (for session resumption)

// Advanced Security Considerations:

// 1. Side-Channel Attacks:
// - Timing attacks on modular exponentiation
// - Power analysis attacks on embedded devices
// - Cache timing attacks
// - Mitigation: Constant-time implementations, blinding techniques

// 2. Invalid Curve Attacks (for ECDH):
// - Attacker sends points not on the expected curve
// - Can leak information about private keys
// - Mitigation: Always validate received points are on the curve

// 3. Twist Attacks (for ECDH):
// - Similar to invalid curve attacks but using quadratic twist of the curve
// - Mitigation: Use curves with large cofactor or validate subgroup membership

// 4. Implementation Vulnerabilities:
// - Buffer overflows in big integer arithmetic
// - Improper parameter validation
// - Weak random number generation
// - Memory leaks of private keys

// 5. Protocol-Level Attacks:
// - Downgrade attacks (forcing weaker DH groups)
// - Logjam attack (pre-computed discrete logs for common primes)
// - Key compromise impersonation

// Performance Optimizations:

// 1. Pre-computation:
// - Pre-compute DH parameters and store them
// - Use Montgomery ladder for scalar multiplication in ECC
// - Windowing methods for exponentiation

// 2. Hardware Acceleration:
// - Use AES-NI and other CPU crypto extensions
// - Leverage dedicated crypto processors
// - GPU acceleration for batch operations

// 3. Curve Selection:
// - Curve25519: Fast, secure, constant-time
// - secp256r1 (P-256): NIST standard, hardware support
// - Brainpool curves: European alternative to NIST curves

// Post-Quantum Considerations:
// Shor's algorithm on quantum computers can break DH in polynomial time
// NIST Post-Quantum Cryptography standardization:
// - CRYSTALS-Kyber: Lattice-based KEM (Key Encapsulation Mechanism)
// - CRYSTALS-DILITHIUM: Lattice-based digital signatures
// - FALCON: NTRU lattice-based signatures
// - SPHINCS+: Hash-based signatures

// Hybrid approaches are being deployed:
// - Use both classical ECDHE and post-quantum KEM
// - Combine outputs to maintain security if either is broken
// - Example: X25519 + Kyber512 in experimental TLS implementations

// Production Deployment Recommendations:

// 1. TLS Configuration:
// - Use TLS 1.3 when possible (mandatory PFS)
// - Disable weak cipher suites and DH groups
// - Use ECDHE with P-256, P-384, or X25519
// - Implement HSTS (HTTP Strict Transport Security)

// 2. Certificate Management:
// - Use certificates with ECDSA keys for better performance
// - Implement certificate pinning for critical connections
// - Automate certificate renewal (Let's Encrypt, ACME)
// - Monitor certificate transparency logs

// 3. Monitoring and Incident Response:
// - Log TLS handshake failures and anomalies
// - Monitor for deprecated cipher suite usage
// - Implement key rotation procedures
// - Have incident response plan for key compromise

// 4. Compliance and Standards:
// - Follow NIST SP 800-52 guidelines
// - Comply with PCI DSS requirements for payment processing
// - Implement FIPS 140-2 validated crypto modules for government use
// - Regular security audits and penetration testing

console.log('DH Key Exchange demonstration completed');

// Man-in-the-Middle (MITM) Attack on Diffie-Hellman Key Exchange
//
// The fundamental vulnerability of pure DH: It provides key agreement but NOT authentication
// An attacker (Mallory) can position themselves between Alice and Bob and establish
// separate DH exchanges with each party, effectively becoming a transparent proxy.

// MITM Attack Scenario Walkthrough:

// Normal DH Exchange:
// Alice ←--g,n--> Bob
// Alice ←--g^a mod n--> Bob  
// Alice ←--g^b mod n--> Bob
// Both compute shared secret: g^(ab) mod n

// MITM Attack:
// Alice ←--g,n--> Mallory ←--g,n--> Bob
// Alice ←--g^a mod n--> Mallory ←--g^m1 mod n--> Bob
// Alice ←--g^m2 mod n--> Mallory ←--g^b mod n--> Bob
//
// Result: Alice and Mallory share secret g^(am2) mod n
//         Bob and Mallory share secret g^(bm1) mod n
//         Mallory can decrypt, read, modify, and re-encrypt all traffic

function demonstrateMITMAttack() {
    console.log('\n=== MITM Attack Demonstration ===');
    
    // Simulate the attack scenario
    const alice = crypto.createECDH('secp256k1');
    const bob = crypto.createECDH('secp256k1');
    const mallory1 = crypto.createECDH('secp256k1'); // Mallory's key for Alice
    const mallory2 = crypto.createECDH('secp256k1'); // Mallory's key for Bob
    
    // Generate keys
    alice.generateKeys();
    bob.generateKeys();
    mallory1.generateKeys();
    mallory2.generateKeys();
    
    // Normal exchange would be: Alice ↔ Bob
    // But Mallory intercepts and replaces public keys
    
    // Alice thinks she's talking to Bob, but gets Mallory's key
    const aliceSharedSecret = alice.computeSecret(mallory1.getPublicKey());
    
    // Bob thinks he's talking to Alice, but gets Mallory's key  
    const bobSharedSecret = bob.computeSecret(mallory2.getPublicKey());
    
    // Mallory can compute both shared secrets
    const malloryAliceSecret = mallory1.computeSecret(alice.getPublicKey());
    const malloryBobSecret = mallory2.computeSecret(bob.getPublicKey());
    
    console.log('Alice-Mallory secret match:', aliceSharedSecret.equals(malloryAliceSecret));
    console.log('Bob-Mallory secret match:', bobSharedSecret.equals(malloryBobSecret));
    console.log('Alice and Bob secrets match:', aliceSharedSecret.equals(bobSharedSecret)); // FALSE!
    
    // Mallory can now decrypt messages from Alice, read/modify them, 
    // then encrypt with Bob's shared secret and forward to Bob
    console.log('MITM attack successful - Mallory has two separate shared secrets');
}

// Real-World MITM Attack Vectors:

// 1. Network-Level Attacks:
// - ARP spoofing on local networks
// - DNS hijacking to redirect traffic
// - BGP hijacking for large-scale attacks
// - Rogue Wi-Fi access points
// - Compromised routers or network infrastructure

// 2. Certificate-Based Attacks:
// - Rogue Certificate Authorities (DigiNotar incident)
// - Compromised CA private keys
// - Government-issued certificates (NSA, GCHQ)
// - Self-signed certificate substitution
// - Certificate pinning bypass

// 3. Protocol Downgrade Attacks:
// - Force clients to use weak encryption
// - Strip TLS and downgrade to HTTP
// - Disable perfect forward secrecy
// - Force weak cipher suites

// TLS Solutions to MITM Attacks:

// 1. Certificate-Based Authentication:
// The server's DH parameters are digitally signed with its private key
// corresponding to its X.509 certificate, providing authentication

function tlsAuthenticationProcess() {
    console.log('\n=== TLS Authentication Against MITM ===');
    
    // In TLS, the server signs its DH public key with its certificate private key
    // Client verifies this signature using the server's public key from certificate
    
    // Simplified TLS handshake with authentication:
    console.log('1. Client → Server: ClientHello');
    console.log('2. Server → Client: ServerHello, Certificate, ServerKeyExchange');
    console.log('   ServerKeyExchange contains:');
    console.log('   - DH parameters (g, p)');
    console.log('   - Server DH public key');
    console.log('   - Digital signature over all above using server private key');
    console.log('3. Client verifies certificate chain and signature');
    console.log('4. Client → Server: ClientKeyExchange (client DH public key)');
    console.log('5. Both derive shared secret from DH exchange');
    
    // If Mallory tries MITM:
    // - Mallory cannot forge server's digital signature (doesn't have private key)
    // - Client certificate verification will fail
    // - Connection is terminated, attack detected
}

// 2. Certificate Pinning:
// Applications can "pin" expected certificates or public keys
// Prevents attacks even with rogue CAs

const certificatePinningExample = {
    // Pin specific certificate fingerprints
    expectedFingerprints: [
        'sha256/YLh1dUR9y6Kja30RrAn7JKnbQG/uEtLMkBgFF2Fuihg=',
        'sha256/Vjs8r4z+80wjNcr1YKepWQboSIRi63WsWXhIMN+eWys='
    ],
    
    validateCertificate(receivedFingerprint) {
        if (!this.expectedFingerprints.includes(receivedFingerprint)) {
            throw new Error('Certificate pinning validation failed - possible MITM attack');
        }
        console.log('Certificate pinning validation passed');
    }
};

// 3. HTTP Public Key Pinning (HPKP) - Now deprecated:
// const hpkpHeader = 'Public-Key-Pins: pin-sha256="base64=="; pin-sha256="backup=="; max-age=2592000';

// 4. Certificate Transparency (CT):
// All certificates must be logged in public CT logs
// Monitors can detect rogue certificates for their domains

// 5. DNS-Based Authentication of Named Entities (DANE):
// Uses DNS records to specify which certificates are valid for a domain
// Requires DNSSEC for security

// Advanced MITM Attack Techniques:

// 1. SSL Stripping:
// - Attacker downgrades HTTPS connections to HTTP
// - User thinks they have secure connection but traffic is plaintext
// - Mitigation: HSTS (HTTP Strict Transport Security)

const hstsImplementation = {
    // HSTS header tells browser to always use HTTPS
    header: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    
    // HSTS preload list - browsers ship with list of HSTS-enabled domains
    // Prevents even first-visit attacks
    preloadRequirements: [
        'Serve valid certificate',
        'Redirect from HTTP to HTTPS on same host',
        'Serve all subdomains over HTTPS',
        'Serve HSTS header on base domain'
    ]
};

// 2. SSL/TLS Inspection (Corporate Environments):
// - Organizations install root CA on employee devices
// - Proxy generates certificates on-the-fly for inspected sites
// - Technically legitimate but creates security risks

// 3. BGP Hijacking:
// - Attack routing infrastructure to redirect traffic
// - Can affect certificate validation if attacker controls route to CA
// - Mitigation: RPKI (Resource Public Key Infrastructure)

// 4. Quantum Computer Attacks (Future):
// - Shor's algorithm breaks DH and RSA
// - Need post-quantum cryptography
// - Timeline: Potentially 10-30 years

// Detection and Prevention Strategies:

// 1. Certificate Monitoring:
function certificateMonitoring() {
    console.log('\n=== Certificate Monitoring Strategies ===');
    
    // Monitor Certificate Transparency logs
    const ctLogMonitoring = {
        purpose: 'Detect unauthorized certificates for your domain',
        tools: ['CertSpotter', 'Facebook Certificate Transparency Monitoring', 'SSLMate'],
        alerting: 'Immediate notification when new certificates are issued'
    };
    
    // Certificate validation in applications
    const certificateValidation = {
        checks: [
            'Verify certificate chain to trusted root',
            'Check certificate dates (not before/after)',
            'Validate hostname matches certificate',
            'Check for revocation (OCSP/CRL)',
            'Verify certificate purpose (server auth)',
            'Check for weak signature algorithms'
        ]
    };
    
    console.log('CT Log Monitoring:', ctLogMonitoring);
    console.log('Certificate Validation:', certificateValidation);
}

// 2. Network Monitoring:
const networkMonitoringTools = {
    activeProbing: [
        'Regular TLS handshake tests to detect certificate changes',
        'Monitor for unexpected certificate issuers',
        'Check for weak cipher suites or protocols'
    ],
    
    passiveMonitoring: [
        'Deep packet inspection for TLS anomalies',
        'Monitor for certificate validation failures',
        'Detect unusual traffic patterns'
    ],
    
    threatIntelligence: [
        'Subscribe to security feeds about compromised CAs',
        'Monitor for reports of nation-state attacks',
        'Track known APT group techniques'
    ]
};

// 3. Application-Level Protections:
function applicationLevelProtections() {
    console.log('\n=== Application-Level MITM Protections ===');
    
    // Implement certificate pinning properly
    const pinningBestPractices = {
        pinMultipleCerts: 'Pin both current and backup certificates',
        includeCA: 'Pin intermediate or root CA public keys',
        gracefulFailure: 'Allow override in development/testing',
        monitoring: 'Log pinning failures for security analysis',
        updates: 'Plan for certificate rotation'
    };
    
    // Additional security headers
    const securityHeaders = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Public-Key-Pins': 'Deprecated - use certificate pinning in app instead',
        'Expect-CT': 'Enforce Certificate Transparency compliance',
        'Content-Security-Policy': 'Prevent mixed content attacks'
    };
    
    console.log('Pinning Best Practices:', pinningBestPractices);
    console.log('Security Headers:', securityHeaders);
}

// Real-World MITM Attack Cases:

const historicalAttacks = {
    diginotar2011: {
        description: 'Dutch CA compromised, issued rogue certificates for Google, Yahoo, etc.',
        impact: 'Complete loss of trust, CA removed from browsers',
        lesson: 'Certificate Transparency and better CA security needed'
    },
    
    nsa2013: {
        description: 'NSA reportedly obtained certificates from CAs for surveillance',
        impact: 'Revealed systematic compromise of PKI',
        lesson: 'Certificate pinning and transparency became critical'
    },
    
    superfish2015: {
        description: 'Lenovo preinstalled adware with root certificate',
        impact: 'All HTTPS traffic vulnerable to interception',
        lesson: 'Hardware vendors can compromise security'
    },
    
    kazakhstan2019: {
        description: 'Government required citizens to install root certificate',
        impact: 'State-level MITM of all HTTPS traffic',
        lesson: 'Political/legal attacks on cryptography'
    }
};

// Call demonstration functions
demonstrateMITMAttack();
tlsAuthenticationProcess();
certificateMonitoring();
applicationLevelProtections();

console.log('\n=== Historical MITM Attacks ===');
Object.entries(historicalAttacks).forEach(([name, attack]) => {
    console.log(`${name.toUpperCase()}:`);
    console.log(`  Description: ${attack.description}`);
    console.log(`  Impact: ${attack.impact}`);
    console.log(`  Lesson: ${attack.lesson}\n`);
});

// Conclusion: MITM attacks on DH show why authentication is crucial
// TLS solves this through certificates, but implementation and deployment matter
// Defense in depth: Use multiple layers of protection
console.log('MITM analysis complete - Always verify authentication in key exchange protocols!');

// More Problems ! MITM

// 1. This solves perfect secrecy
// 2. What if someone intercepts and put their own DH keys?
// 3. MITM replaces Y' parameter with their own
// 4. X does not know what happened (Just numbers).
// 5. How to prevent this? Simply by signing -> Digitally Signed SSL/TLS ccertificates
// Diffie-Hellman Key Exchange Mathematical Calculations
// ================================================

// Step 1: Setup Public Parameters
// These are agreed upon and shared publicly
const g1 = 5;      // Generator (primitive root modulo p)
const p1 = 23;     // Large prime number (small for demo)

console.log(`Public parameters: g = ${g1}, p = ${p1}`);

// Step 2: Private Key Generation
// Each party generates a random private key
const privateAlice = 6;   // Alice's private key (secret)
const privateBob = 15;    // Bob's private key (secret)

console.log(`Alice's private key: ${privateAlice} (secret)`);
console.log(`Bob's private key: ${privateBob} (secret)`);

// Step 3: Public Key Calculation
// Each party computes their public key using: g^private mod p

// Alice's calculation: g^a mod p = 5^6 mod 23
const publicAlice = Math.pow(g, privateAlice) % p;
console.log(`Alice computes public key: ${g}^${privateAlice} mod ${p} = ${Math.pow(g, privateAlice)} mod ${p} = ${publicAlice}`);

// Bob's calculation: g^b mod p = 5^15 mod 23
const publicBob = Math.pow(g, privateBob) % p;
console.log(`Bob computes public key: ${g}^${privateBob} mod ${p} = ${Math.pow(g, privateBob)} mod ${p} = ${publicBob}`);

// Step 4: Public Key Exchange (transmitted over insecure channel)
console.log(`\nPublic key exchange:`);
console.log(`Alice sends to Bob: ${publicAlice}`);
console.log(`Bob sends to Alice: ${publicBob}`);

// Step 5: Shared Secret Calculation
// Each party computes the shared secret using the other's public key

// Alice's calculation: (Bob's public)^(Alice's private) mod p
const sharedSecretAlice = Math.pow(publicBob, privateAlice) % p;
console.log(`\nAlice computes shared secret: ${publicBob}^${privateAlice} mod ${p} = ${Math.pow(publicBob, privateAlice)} mod ${p} = ${sharedSecretAlice}`);

// Bob's calculation: (Alice's public)^(Bob's private) mod p  
const sharedSecretBob = Math.pow(publicAlice, privateBob) % p;
console.log(`Bob computes shared secret: ${publicAlice}^${privateBob} mod ${p} = ${Math.pow(publicAlice, privateBob)} mod ${p} = ${sharedSecretBob}`);

// Verification: Both should arrive at the same shared secret
console.log(`\nShared secrets match: ${sharedSecretAlice === sharedSecretBob}`);
console.log(`Final shared secret: ${sharedSecretAlice}`);

// Mathematical proof why this works:
// Alice: (g^b mod p)^a mod p = g^(b*a) mod p
// Bob:   (g^a mod p)^b mod p = g^(a*b) mod p
// Since a*b = b*a, both get the same result: g^(a*b) mod p

console.log(`\nMathematical verification:`);
console.log(`g^(a*b) mod p = ${g}^(${privateAlice}*${privateBob}) mod ${p} = ${g}^${privateAlice * privateBob} mod ${p} = ${Math.pow(g, privateAlice * privateBob) % p}`);

// Security: What an eavesdropper sees vs. what they need to break it
console.log(`\nSecurity Analysis:`);
console.log(`Eavesdropper can see: g=${g}, p=${p}, Alice's public=${publicAlice}, Bob's public=${publicBob}`);
console.log(`To break it, they need to solve discrete logarithm:`);
console.log(`Find x where ${g}^x ≡ ${publicAlice} (mod ${p}) OR find y where ${g}^y ≡ ${publicBob} (mod ${p})`);
console.log(`For large primes (2048+ bits), this is computationally infeasible`);

// MITM Attack Mathematical Calculations for TLS 1.2 Scenario
// ============================================================

console.log('\n=== MITM Attack Mathematical Breakdown for TLS 1.2 ===');

// TLS 1.2 with DHE (Diffie-Hellman Ephemeral) scenario
// Normal flow: Client ←→ Server
// MITM flow: Client ←→ Mallory ←→ Server

// Shared public parameters (same for all parties)
const g = 5;      // Generator
const p = 23;     // Prime modulus

console.log(`\nTLS 1.2 DHE Parameters: g = ${g}, p = ${p}`);

// Step 1: Key Generation
const clientPrivate = 7;    // Client's ephemeral private key
const serverPrivate = 11;   // Server's ephemeral private key
const malloryPrivate1 = 13; // Mallory's private key for client connection
const malloryPrivate2 = 17; // Mallory's private key for server connection

console.log(`\nPrivate Keys (secret):`);
console.log(`Client: ${clientPrivate}`);
console.log(`Server: ${serverPrivate}`);
console.log(`Mallory (for client): ${malloryPrivate1}`);
console.log(`Mallory (for server): ${malloryPrivate2}`);

// Step 2: Public Key Calculations
const clientPublic = Math.pow(g, clientPrivate) % p;
const serverPublic = Math.pow(g, serverPrivate) % p;
const malloryPublic1 = Math.pow(g, malloryPrivate1) % p;
const malloryPublic2 = Math.pow(g, malloryPrivate2) % p;

console.log(`\nPublic Key Calculations:`);
console.log(`Client public: ${g}^${clientPrivate} mod ${p} = ${clientPublic}`);
console.log(`Server public: ${g}^${serverPrivate} mod ${p} = ${serverPublic}`);
console.log(`Mallory public 1: ${g}^${malloryPrivate1} mod ${p} = ${malloryPublic1}`);
console.log(`Mallory public 2: ${g}^${malloryPrivate2} mod ${p} = ${malloryPublic2}`);

// Step 3: NORMAL TLS 1.2 Flow (without MITM)
console.log(`\n--- NORMAL TLS 1.2 DHE Handshake ---`);
console.log(`1. Client → Server: ClientHello`);
console.log(`2. Server → Client: ServerHello, Certificate, ServerKeyExchange`);
console.log(`   ServerKeyExchange contains: DH params + Server public key (${serverPublic}) + Signature`);
console.log(`3. Client → Server: ClientKeyExchange with client public key (${clientPublic})`);

const normalSharedSecret = Math.pow(serverPublic, clientPrivate) % p;
const normalSharedSecretVerify = Math.pow(clientPublic, serverPrivate) % p;

console.log(`\nNormal shared secret calculation:`);
console.log(`Client: ${serverPublic}^${clientPrivate} mod ${p} = ${normalSharedSecret}`);
console.log(`Server: ${clientPublic}^${serverPrivate} mod ${p} = ${normalSharedSecretVerify}`);
console.log(`Shared secrets match: ${normalSharedSecret === normalSharedSecretVerify}`);

// Step 4: MITM ATTACK Flow
console.log(`\n--- MITM ATTACK on TLS 1.2 DHE ---`);

// Phase 1: Mallory intercepts Client → Server communication
console.log(`\nPhase 1: Client → Mallory (Client thinks it's talking to Server)`);
console.log(`1. Client → Mallory: ClientHello`);
console.log(`2. Mallory → Client: ServerHello, FAKE Certificate, ServerKeyExchange`);
console.log(`   Mallory sends her own public key (${malloryPublic1}) instead of server's`);
console.log(`   Mallory signs with FAKE certificate (client must not validate properly)`);
console.log(`3. Client → Mallory: ClientKeyExchange with client public key (${clientPublic})`);

// Client-Mallory shared secret
const clientMallorySecret = Math.pow(malloryPublic1, clientPrivate) % p;
const malloryClientSecret = Math.pow(clientPublic, malloryPrivate1) % p;

console.log(`\nClient-Mallory shared secret:`);
console.log(`Client calculation: ${malloryPublic1}^${clientPrivate} mod ${p} = ${clientMallorySecret}`);
console.log(`Mallory calculation: ${clientPublic}^${malloryPrivate1} mod ${p} = ${malloryClientSecret}`);
console.log(`Client-Mallory secrets match: ${clientMallorySecret === malloryClientSecret}`);

// Phase 2: Mallory initiates connection to real server
console.log(`\nPhase 2: Mallory → Server (Server thinks it's talking to legitimate client)`);
console.log(`1. Mallory → Server: ClientHello (acting as client)`);
console.log(`2. Server → Mallory: ServerHello, Certificate, ServerKeyExchange`);
console.log(`   Server sends real certificate and public key (${serverPublic})`);
console.log(`3. Mallory → Server: ClientKeyExchange with mallory public key (${malloryPublic2})`);

// Mallory-Server shared secret
const malloryServerSecret = Math.pow(serverPublic, malloryPrivate2) % p;
const serverMallorySecret = Math.pow(malloryPublic2, serverPrivate) % p;

console.log(`\nMallory-Server shared secret:`);
console.log(`Mallory calculation: ${serverPublic}^${malloryPrivate2} mod ${p} = ${malloryServerSecret}`);
console.log(`Server calculation: ${malloryPublic2}^${serverPrivate} mod ${p} = ${serverMallorySecret}`);
console.log(`Mallory-Server secrets match: ${malloryServerSecret === serverMallorySecret}`);

// Step 5: MITM Attack Success Analysis
console.log(`\n--- MITM ATTACK RESULT ---`);
console.log(`Client believes shared secret is: ${clientMallorySecret}`);
console.log(`Server believes shared secret is: ${serverMallorySecret}`);
console.log(`Mallory knows both secrets and can decrypt/encrypt for both parties`);
console.log(`Client-Server direct secret would have been: ${normalSharedSecret}`);
console.log(`But they never established direct communication!`);

// Step 6: Data Flow Through MITM
console.log(`\n--- DATA TRANSMISSION THROUGH MITM ---`);

function simulateEncryption(data, key) {
    // Simple XOR encryption for demonstration (NOT secure!)
    return data.split('').map(char => 
        String.fromCharCode(char.charCodeAt(0) ^ key)
    ).join('');
}

const originalMessage = "GET /secure-data HTTP/1.1";
console.log(`Original client message: "${originalMessage}"`);

// Client encrypts with Client-Mallory key
const clientEncrypted = simulateEncryption(originalMessage, clientMallorySecret);
console.log(`Client encrypts with key ${clientMallorySecret}: [encrypted data]`);

// Mallory decrypts with Client-Mallory key
const malloryDecrypted = simulateEncryption(clientEncrypted, clientMallorySecret);
console.log(`Mallory decrypts: "${malloryDecrypted}"`);

// Mallory can modify the message
const modifiedMessage = "GET /admin-panel HTTP/1.1";
console.log(`Mallory modifies to: "${modifiedMessage}"`);

// Mallory encrypts with Mallory-Server key and forwards
const malloryEncrypted = simulateEncryption(modifiedMessage, malloryServerSecret);
console.log(`Mallory encrypts with key ${malloryServerSecret} and forwards to server`);

// Server decrypts and sees modified message
const serverReceived = simulateEncryption(malloryEncrypted, malloryServerSecret);
console.log(`Server decrypts and sees: "${serverReceived}"`);

// Step 7: Why MITM Succeeds - Security Failures
console.log(`\n--- WHY MITM ATTACK SUCCEEDS ---`);
console.log(`1. Client failed to properly validate server certificate`);
console.log(`2. No certificate pinning implemented`);
console.log(`3. Client accepted self-signed or CA-signed certificate for attacker`);
console.log(`4. No out-of-band verification of server identity`);
console.log(`5. Diffie-Hellman provides key agreement but NOT authentication`);

// Step 8: Preventing MITM in TLS 1.2
console.log(`\n--- HOW TLS 1.2 PREVENTS MITM ---`);

// Server signs DH parameters with certificate private key
console.log(`\nTLS 1.2 ServerKeyExchange includes:`);
console.log(`- DH parameters (g, p): ${g}, ${p}`);
console.log(`- Server DH public key: ${serverPublic}`);
console.log(`- Digital signature over above data using server's certificate private key`);

// Simulate signature verification
function simulateSignatureVerification(serverPublicKey, signature, serverCertPublicKey) {
    // In reality, this would use RSA/ECDSA verification
    console.log(`Signature verification process:`);
    console.log(`1. Hash the DH parameters and server public key`);
    console.log(`2. Decrypt signature using server's certificate public key`);
    console.log(`3. Compare decrypted hash with computed hash`);
    console.log(`4. Verification ${signature === 'valid' ? 'PASSES' : 'FAILS'}`);
    return signature === 'valid';
}

const realServerSignature = 'valid';   // Server can sign with its private key
const mallorySignature = 'invalid';    // Mallory cannot forge server's signature

console.log(`\nSignature verification results:`);
console.log(`Real server signature: ${simulateSignatureVerification(serverPublic, realServerSignature, 'server-cert-key')}`);
console.log(`Mallory's forged signature: ${simulateSignatureVerification(malloryPublic1, mallorySignature, 'server-cert-key')}`);

// Step 9: TLS 1.2 Complete Handshake with Authentication
console.log(`\n--- SECURE TLS 1.2 HANDSHAKE (MITM Prevented) ---`);
console.log(`1. Client → Server: ClientHello`);
console.log(`2. Server → Client: ServerHello, Certificate, ServerKeyExchange (signed)`);
console.log(`3. Client verifies:`);
console.log(`   a. Certificate chain to trusted root CA`);
console.log(`   b. Certificate hostname matches server`);
console.log(`   c. Digital signature on ServerKeyExchange`);
console.log(`4. If verification passes: Client → Server: ClientKeyExchange`);
console.log(`5. Both derive same shared secret: ${normalSharedSecret}`);
console.log(`6. Finish messages exchanged to confirm handshake integrity`);

// Step 10: Advanced MITM Scenarios
console.log(`\n--- ADVANCED MITM SCENARIOS ---`);

// Scenario 1: Rogue CA
console.log(`\nScenario 1: Rogue Certificate Authority`);
console.log(`- Attacker compromises or operates rogue CA`);
console.log(`- Issues valid certificate for target domain`);
console.log(`- Can perform MITM with "valid" certificate`);
console.log(`- Mitigation: Certificate pinning, CT monitoring`);

// Scenario 2: Nation-state attacks
console.log(`\nScenario 2: Nation-State Level Attacks`);
console.log(`- Government forces CA to issue certificates`);
console.log(`- BGP hijacking to route traffic through attacker`);
console.log(`- Legal framework forcing cooperation`);
console.log(`- Mitigation: Multi-path validation, Tor, VPNs`);

// Scenario 3: Corporate environments
console.log(`\nScenario 3: Corporate TLS Inspection`);
console.log(`- Company installs root CA on employee devices`);
console.log(`- Proxy generates certificates on-demand`);
console.log(`- All HTTPS traffic is decrypted and re-encrypted`);
console.log(`- Legitimate for security but creates vulnerabilities`);

console.log(`\n=== MITM Mathematical Analysis Complete ===`);
console.log(`Key takeaway: DH provides secrecy but TLS adds authentication through certificates`);
//  Solved with Signing:
// We bring back public key Encryption 
// Only to sign the entire DH message with certificates.

// TLS 1.3 - Modern Transport Layer Security
// ==========================================

console.log('\n=== TLS 1.3 - Next Generation Transport Security ===');

// TLS 1.3 Overview
// ----------------
// Released in 2018 (RFC 8446)
// Major improvements over TLS 1.2:
// 1. Reduced handshake latency (1-RTT instead of 2-RTT)
// 2. Forward secrecy by default (only ephemeral key exchange)
// 3. Simplified cipher suite negotiation
// 4. Removed legacy cryptographic algorithms
// 5. Encrypted handshake messages
// 6. 0-RTT data support for session resumption

function demonstrateTLS13Improvements() {
    console.log('\n--- TLS 1.3 Key Improvements ---');
    
    const improvements = {
        performance: {
            handshakeRTT: 'Reduced from 2-RTT to 1-RTT',
            zeroRTT: 'Optional 0-RTT for resumed connections',
            cpuUsage: 'Fewer cryptographic operations',
            description: 'Faster connection establishment and reduced latency'
        },
        
        security: {
            forwardSecrecy: 'Mandatory - only ephemeral key exchange allowed',
            encryptedHandshake: 'Most handshake messages are encrypted',
            simplifiedCiphers: 'Removed weak and legacy cipher suites',
            keyDerivation: 'Improved key derivation with HKDF',
            description: 'Stronger security by default, no negotiation of weak options'
        },
        
        simplicity: {
            cipherSuites: 'Separate negotiation of key exchange and symmetric encryption',
            extensions: 'Cleaner extension handling',
            stateReduction: 'Less complex state machine',
            description: 'Easier to implement correctly and securely'
        }
    };
    
    Object.entries(improvements).forEach(([category, details]) => {
        console.log(`\n${category.toUpperCase()}:`);
        Object.entries(details).forEach(([key, value]) => {
            if (key !== 'description') {
                console.log(`  ${key}: ${value}`);
            }
        });
        console.log(`  Summary: ${details.description}`);
    });
}

// TLS 1.3 Handshake Flow (1-RTT)
// ==============================

function tls13HandshakeFlow() {
    console.log('\n--- TLS 1.3 Handshake Flow (1-RTT) ---');
    
    // Flight 1: Client → Server
    console.log('\nFlight 1: Client → Server');
    console.log('ClientHello:');
    console.log('  - Supported TLS version: 1.3');
    console.log('  - Random nonce');
    console.log('  - Supported cipher suites');
    console.log('  - Key share extension (client public keys for all supported groups)');
    console.log('  - Signature algorithms');
    console.log('  - Server name indication (SNI)');
    
    // Key share generation for multiple groups
    const clientKeyShares = {
        'x25519': crypto.createECDH('X25519'),
        'secp256r1': crypto.createECDH('secp256r1'),
        'secp384r1': crypto.createECDH('secp384r1')
    };
    
    // Generate keys for each group
    Object.entries(clientKeyShares).forEach(([group, dh]) => {
        dh.generateKeys();
        console.log(`  - Key share for ${group}: ${dh.getPublicKey('hex').substring(0, 16)}...`);
    });
    
    // Flight 2: Server → Client  
    console.log('\nFlight 2: Server → Client');
    console.log('ServerHello:');
    console.log('  - Selected TLS version: 1.3');
    console.log('  - Random nonce');
    console.log('  - Selected cipher suite: TLS_AES_256_GCM_SHA384');
    console.log('  - Key share (server public key for selected group)');
    
    // Server selects preferred group and generates key
    const selectedGroup = 'x25519';
    const serverKeyShare = crypto.createECDH('X25519');
    serverKeyShare.generateKeys();
    console.log(`  - Server key share for ${selectedGroup}: ${serverKeyShare.getPublicKey('hex').substring(0, 16)}...`);
    
    // Both sides can now compute shared secret
    const sharedSecret = clientKeyShares[selectedGroup].computeSecret(serverKeyShare.getPublicKey());
    console.log(`  - Shared secret established: ${sharedSecret.toString('hex').substring(0, 16)}...`);
    
    console.log('\n{Certificate*}:');
    console.log('  - Server certificate chain');
    console.log('  - * indicates message is encrypted with handshake traffic keys');
    
    console.log('\n{CertificateVerify*}:');
    console.log('  - Digital signature over handshake transcript');
    console.log('  - Proves server possesses certificate private key');
    
    console.log('\n{Finished*}:');
    console.log('  - HMAC over complete handshake transcript');
    console.log('  - Authenticates handshake integrity');
    
    // Flight 3: Client → Server
    console.log('\nFlight 3: Client → Server');
    console.log('{Finished*}:');
    console.log('  - Client HMAC over handshake transcript');
    console.log('  - Confirms handshake completion');
    
    console.log('\nApplication Data:');
    console.log('  - Both sides can now send encrypted application data');
    console.log('  - Using application traffic keys derived from shared secret');
    
    return { sharedSecret, clientKeyShares, serverKeyShare };
}

// TLS 1.3 Key Schedule
// ===================

function tls13KeySchedule(sharedSecret) {
    console.log('\n--- TLS 1.3 Key Schedule ---');
    
    // TLS 1.3 uses HKDF (HMAC-based Key Derivation Function)
    console.log('\nKey Derivation Process:');
    console.log('1. Early Secret (for 0-RTT, derived from PSK if available)');
    console.log('2. Handshake Secret (derived from ECDHE shared secret)');
    console.log('3. Master Secret (final derived secret)');
    
    // Simplified key derivation (actual implementation uses HKDF)
    function hkdfExpand(secret, label, length = 32) {
        const hmac = crypto.createHmac('sha384', secret);
        hmac.update(label);
        return hmac.digest().slice(0, length);
    }
    
    function hkdfExtract(salt, ikm) {
        const hmac = crypto.createHmac('sha384', salt || Buffer.alloc(48, 0));
        hmac.update(ikm);
        return hmac.digest();
    }
    
    // Step 1: Early Secret
    const earlySecret = hkdfExtract(null, Buffer.alloc(32, 0)); // No PSK for this demo
    console.log(`Early Secret: ${earlySecret.toString('hex').substring(0, 32)}...`);
    
    // Step 2: Handshake Secret  
    const handshakeSecret = hkdfExtract(
        hkdfExpand(earlySecret, 'derived', 48),
        sharedSecret
    );
    console.log(`Handshake Secret: ${handshakeSecret.toString('hex').substring(0, 32)}...`);
    
    // Step 3: Master Secret
    const masterSecret = hkdfExtract(
        hkdfExpand(handshakeSecret, 'derived', 48),
        Buffer.alloc(32, 0)
    );
    console.log(`Master Secret: ${masterSecret.toString('hex').substring(0, 32)}...`);
    
    // Derive traffic keys
    const clientHandshakeKey = hkdfExpand(handshakeSecret, 'c hs traffic');
    const serverHandshakeKey = hkdfExpand(handshakeSecret, 's hs traffic');
    const clientAppKey = hkdfExpand(masterSecret, 'c ap traffic');
    const serverAppKey = hkdfExpand(masterSecret, 's ap traffic');
    
    console.log('\nDerived Keys:');
    console.log(`Client Handshake Key: ${clientHandshakeKey.toString('hex').substring(0, 32)}...`);
    console.log(`Server Handshake Key: ${serverHandshakeKey.toString('hex').substring(0, 32)}...`);
    console.log(`Client Application Key: ${clientAppKey.toString('hex').substring(0, 32)}...`);
    console.log(`Server Application Key: ${serverAppKey.toString('hex').substring(0, 32)}...`);
    
    return {
        earlySecret,
        handshakeSecret,
        masterSecret,
        clientHandshakeKey,
        serverHandshakeKey,
        clientAppKey,
        serverAppKey
    };
}

// TLS 1.3 Cipher Suites
// =====================

function tls13CipherSuites() {
    console.log('\n--- TLS 1.3 Cipher Suites ---');
    
    // TLS 1.3 simplified cipher suite format
    // Only specifies symmetric encryption + hash, not key exchange or signatures
    const cipherSuites = {
        'TLS_AES_128_GCM_SHA256': {
            encryption: 'AES-128-GCM',
            hash: 'SHA-256',
            keyLength: 16,
            nonceLength: 12,
            tagLength: 16
        },
        'TLS_AES_256_GCM_SHA384': {
            encryption: 'AES-256-GCM', 
            hash: 'SHA-384',
            keyLength: 32,
            nonceLength: 12,
            tagLength: 16
        },
        'TLS_CHACHA20_POLY1305_SHA256': {
            encryption: 'ChaCha20-Poly1305',
            hash: 'SHA-256', 
            keyLength: 32,
            nonceLength: 12,
            tagLength: 16
        }
    };
    
    console.log('Mandatory cipher suites:');
    Object.entries(cipherSuites).forEach(([name, details]) => {
        console.log(`\n${name}:`);
        console.log(`  Encryption: ${details.encryption}`);
        console.log(`  Hash: ${details.hash}`);
        console.log(`  Key length: ${details.keyLength} bytes`);
        console.log(`  Nonce length: ${details.nonceLength} bytes`);
        console.log(`  Auth tag length: ${details.tagLength} bytes`);
    });
    
    console.log('\nKey Exchange Groups (separate from cipher suites):');
    const keyExchangeGroups = [
        'secp256r1 (P-256)',
        'secp384r1 (P-384)', 
        'secp521r1 (P-521)',
        'x25519 (Curve25519)',
        'x448 (Curve448)',
        'ffdhe2048 (RFC 7919)',
        'ffdhe3072 (RFC 7919)',
        'ffdhe4096 (RFC 7919)'
    ];
    
    keyExchangeGroups.forEach(group => console.log(`  - ${group}`));
    
    console.log('\nSignature Algorithms (separate from cipher suites):');
    const signatureAlgorithms = [
        'rsa_pkcs1_sha256',
        'rsa_pkcs1_sha384', 
        'rsa_pkcs1_sha512',
        'ecdsa_secp256r1_sha256',
        'ecdsa_secp384r1_sha384',
        'ecdsa_secp521r1_sha512',
        'rsa_pss_rsae_sha256',
        'rsa_pss_rsae_sha384',
        'rsa_pss_rsae_sha512',
        'ed25519',
        'ed448'
    ];
    
    signatureAlgorithms.forEach(alg => console.log(`  - ${alg}`));
}

// TLS 1.3 vs TLS 1.2 Comparison
// =============================

function tls13VsTls12Comparison() {
    console.log('\n--- TLS 1.3 vs TLS 1.2 Detailed Comparison ---');
    
    const comparison = {
        handshake: {
            tls12: '2 round trips (2-RTT)',
            tls13: '1 round trip (1-RTT)',
            improvement: '50% reduction in connection time'
        },
        
        forwardSecrecy: {
            tls12: 'Optional (DHE/ECDHE cipher suites)',
            tls13: 'Mandatory (only ephemeral key exchange)',
            improvement: 'All connections have forward secrecy'
        },
        
        encryptedHandshake: {
            tls12: 'Only application data encrypted',
            tls13: 'Certificate and later handshake messages encrypted',
            improvement: 'Better privacy protection'
        },
        
        cipherSuiteComplexity: {
            tls12: 'Monolithic (key exchange + auth + encryption + MAC)',
            tls13: 'Modular (separate negotiation of each component)',
            improvement: 'Cleaner negotiation, fewer combinations'
        },
        
        legacySupport: {
            tls12: 'Supports many legacy algorithms (3DES, RC4, MD5)',
            tls13: 'Only modern, secure algorithms',
            improvement: 'No weak crypto by accident'
        },
        
        sessionResumption: {
            tls12: 'Session IDs or session tickets',
            tls13: 'PSK-based resumption with 0-RTT support',
            improvement: 'Faster resumption, better security'
        },
        
        renegotiation: {
            tls12: 'Complex renegotiation protocol',
            tls13: 'No renegotiation (use post-handshake auth)',
            improvement: 'Simplified, more secure'
        }
    };
    
    Object.entries(comparison).forEach(([feature, details]) => {
        console.log(`\n${feature.toUpperCase()}:`);
        console.log(`  TLS 1.2: ${details.tls12}`);
        console.log(`  TLS 1.3: ${details.tls13}`);
        console.log(`  Improvement: ${details.improvement}`);
    });
}

// TLS 1.3 0-RTT (Zero Round Trip Time)
// ====================================

function tls13ZeroRTT() {
    console.log('\n--- TLS 1.3 Zero Round Trip Time (0-RTT) ---');
    
    console.log('\n0-RTT allows sending application data in the first flight');
    console.log('This is only possible for resumed connections with PSK');
    
    console.log('\n0-RTT Flow:');
    console.log('1. Initial connection establishes PSK');
    console.log('2. Subsequent connection sends early data immediately');
    console.log('3. Server processes early data before handshake completes');
    
    console.log('\nDetailed 0-RTT Process:');
    console.log('\nFirst Connection (establishes PSK):');
    console.log('  Client → Server: Full 1-RTT handshake');
    console.log('  Server → Client: NewSessionTicket (contains PSK)');
    console.log('  Client stores PSK for future use');
    
    console.log('\nSubsequent Connection (0-RTT):');
    console.log('  Client → Server: ClientHello + EarlyData + Application Data');
    console.log('  Server → Client: ServerHello + EncryptedExtensions + Finished');
    console.log('  Application data was processed before handshake completed!');
    
    console.log('\n0-RTT Security Considerations:');
    const zeroRTTRisks = [
        'Replay attacks: Early data can be replayed by network attackers',
        'Forward secrecy: Early data uses PSK, not ephemeral keys',
        'Key separation: Early data uses different keys than handshake',
        'Ordering: Early data might be processed out of order'
    ];
    
    zeroRTTRisks.forEach(risk => console.log(`  - ${risk}`));
    
    console.log('\n0-RTT Mitigations:');
    const mitigations = [
        'Use 0-RTT only for idempotent operations (GET, not POST)',
        'Implement replay protection (time windows, single-use tickets)',
        'Separate 0-RTT data from regular application data',
        'Client retry with 1-RTT if 0-RTT rejected'
    ];
    
    mitigations.forEach(mitigation => console.log(`  - ${mitigation}`));
    
    // Simulate 0-RTT key derivation
    console.log('\n0-RTT Key Derivation:');
    const psk = crypto.randomBytes(32);
    const earlySecret = crypto.createHmac('sha256', Buffer.alloc(32, 0))
                            .update(psk)
                            .digest();
    
    console.log(`PSK: ${psk.toString('hex').substring(0, 32)}...`);
    console.log(`Early Secret: ${earlySecret.toString('hex').substring(0, 32)}...`);
    console.log('Early traffic keys derived from Early Secret');
}

// TLS 1.3 Security Analysis
// =========================

function tls13SecurityAnalysis() {
    console.log('\n--- TLS 1.3 Security Analysis ---');
    
    console.log('\nSecurity Improvements:');
    
    const securityImprovements = {
        'Mandatory Forward Secrecy': {
            description: 'All key exchanges are ephemeral',
            impact: 'Compromise of long-term keys does not affect past sessions',
            implementation: 'Only DHE/ECDHE allowed, no RSA key transport'
        },
        
        'Encrypted Handshake': {
            description: 'Certificate and handshake messages encrypted',
            impact: 'Passive attackers cannot see certificate details',
            implementation: 'Encryption starts after ServerHello'
        },
        
        'Simplified Cipher Suites': {
            description: 'Removed weak and legacy algorithms',
            impact: 'No accidental use of broken cryptography',
            implementation: 'Only AEAD ciphers, modern key exchange'
        },
        
        'Improved Key Derivation': {
            description: 'HKDF-based key derivation with clear separation',
            impact: 'Better key hygiene and cryptographic agility',
            implementation: 'Separate keys for different purposes'
        },
        
        'No Renegotiation': {
            description: 'Removed complex renegotiation protocol',
            impact: 'Eliminates class of renegotiation attacks',
            implementation: 'Post-handshake authentication instead'
        }
    };
    
    Object.entries(securityImprovements).forEach(([improvement, details]) => {
        console.log(`\n${improvement}:`);
        console.log(`  Description: ${details.description}`);
        console.log(`  Impact: ${details.impact}`);
        console.log(`  Implementation: ${details.implementation}`);
    });
    
    console.log('\nRemoved Vulnerable Features:');
    const removedFeatures = [
        'RSA key transport (vulnerable to ROBOT attacks)',
        'CBC mode ciphers (vulnerable to padding oracles)', 
        'RC4 stream cipher (biased output)',
        'MD5 and SHA-1 (collision attacks)',
        'Static DH (no forward secrecy)',
        'Export ciphers (intentionally weak)',
        'NULL encryption (no confidentiality)',
        'Anonymous key exchange (no authentication)',
        'Compression (CRIME/BREACH attacks)'
    ];
    
    removedFeatures.forEach(feature => console.log(`  - ${feature}`));
    
    console.log('\nAttack Mitigations:');
    const attackMitigations = {
        'BEAST/CRIME/BREACH': 'No compression, only AEAD ciphers',
        'POODLE': 'No CBC mode ciphers',
        'Heartbleed': 'Simplified protocol, better implementations',
        'ROBOT': 'No RSA key transport',
        'Triple Handshake': 'Improved handshake design',
        'Logjam/FREAK': 'No export ciphers, strong DH groups only',
        'Sweet32': 'No 64-bit block ciphers',
        'SLOTH': 'No MD5 or SHA-1 signatures'
    };
    
    Object.entries(attackMitigations).forEach(([attack, mitigation]) => {
        console.log(`  ${attack}: ${mitigation}`);
    });
}

// TLS 1.3 Performance Analysis
// ============================

function tls13PerformanceAnalysis() {
    console.log('\n--- TLS 1.3 Performance Analysis ---');
    
    console.log('\nLatency Improvements:');
    console.log('Connection establishment:');
    console.log('  TLS 1.2: 2-RTT (2 × network round trip time)');
    console.log('  TLS 1.3: 1-RTT (1 × network round trip time)');
    console.log('  0-RTT:    0-RTT (application data in first flight)');
    
    // Simulate network delay impact
    const networkRTT = 50; // milliseconds
    console.log(`\nWith ${networkRTT}ms network RTT:`);
    console.log(`  TLS 1.2 handshake: ${2 * networkRTT}ms`);
    console.log(`  TLS 1.3 handshake: ${1 * networkRTT}ms`);
    console.log(`  TLS 1.3 0-RTT: ${0 * networkRTT}ms`);
    console.log(`  Improvement: ${networkRTT}ms faster (${((networkRTT / (2 * networkRTT)) * 100).toFixed(0)}% reduction)`);
    
    console.log('\nComputational Performance:');
    console.log('Cryptographic operations:');
    console.log('  - Fewer signature verifications in handshake');
    console.log('  - AEAD encryption more efficient than MAC-then-encrypt');
    console.log('  - Modern curves (X25519) faster than P-256');
    console.log('  - Hardware acceleration for AES-GCM widely available');
    
    console.log('\nBandwidth Efficiency:');
    console.log('  - Smaller handshake messages (fewer round trips)');
    console.log('  - More compact cipher suite encoding');
    console.log('  - Extension optimizations');
    console.log('  - HelloRetryRequest only when necessary');
    
    console.log('\nServer Resource Usage:');
    console.log('  - Less connection state during handshake');
    console.log('  - Simplified state machine');
    console.log('  - Better session resumption');
    console.log('  - Reduced DoS attack surface');
}

// TLS 1.3 Implementation Considerations
// ====================================

function tls13ImplementationConsiderations() {
    console.log('\n--- TLS 1.3 Implementation Considerations ---');
    
    console.log('\nLibrary Support:');
    const librarySupport = {
        'OpenSSL': '1.1.1+ (2018)',
        'BoringSSL': 'Full support',
        'LibreSSL': '3.2.0+ (2020)',
        'GnuTLS': '3.6.3+ (2018)',
        'mbedTLS': '2.16.0+ (2019)',
        'WolfSSL': '4.0.0+ (2019)',
        'NSS': '3.44+ (2019)',
        'SChannel': 'Windows 10 1903+',
        'Secure Transport': 'macOS 10.15+, iOS 13+'
    };
    
    Object.entries(librarySupport).forEach(([library, version]) => {
        console.log(`  ${library}: ${version}`);
    });
    
    console.log('\nBrowser Support:');
    const browserSupport = {
        'Chrome': '70+ (2018)',
        'Firefox': '63+ (2018)', 
        'Safari': '12.1+ (2019)',
        'Edge': '79+ (2020)',
        'Opera': '57+ (2018)'
    };
    
    Object.entries(browserSupport).forEach(([browser, version]) => {
        console.log(`  ${browser}: ${version}`);
    });
    
    console.log('\nServer Implementation:');
    const serverImplementation = [
        'Update TLS library to version with TLS 1.3 support',
        'Configure supported cipher suites and groups',
        'Test interoperability with major clients',
        'Monitor for TLS 1.3 adoption metrics',
        'Consider 0-RTT risks for your application',
        'Update certificate validation logic if needed',
        'Plan gradual rollout with fallback to TLS 1.2'
    ];
    
    serverImplementation.forEach(step => console.log(`  - ${step}`));
    
    console.log('\nCommon Implementation Issues:');
    const commonIssues = [
        'Middleboxes blocking TLS 1.3 (use compatibility mode)',
        'Certificate chain validation changes',
        'Session resumption behavior differences', 
        'Extension handling incompatibilities',
        'Key derivation function implementations',
        'Encrypted SNI support considerations',
        'Post-handshake authentication integration'
    ];
    
    commonIssues.forEach(issue => console.log(`  - ${issue}`));
}

// TLS 1.3 Future and Post-Quantum Cryptography
// ============================================

function tls13FutureAndPostQuantum() {
    console.log('\n--- TLS 1.3 Future and Post-Quantum Cryptography ---');
    
    console.log('\nQuantum Computing Threat:');
    console.log('Cryptographic algorithms vulnerable to quantum computers:');
    console.log('  - RSA (Shor\'s algorithm)');
    console.log('  - ECDH/ECDSA (Shor\'s algorithm)');
    console.log('  - Finite field Diffie-Hellman (Shor\'s algorithm)');
    console.log('\nQuantum-resistant algorithms:');
    console.log('  - Lattice-based (CRYSTALS-Kyber, CRYSTALS-Dilithium)');
    console.log('  - Hash-based (SPHINCS+)');
    console.log('  - Code-based (Classic McEliece)');
    console.log('  - Isogeny-based (SIKE - broken in 2022)');
    
    console.log('\nNIST Post-Quantum Standards (2022):');
    const nistStandards = {
        'CRYSTALS-Kyber': 'Key encapsulation mechanism (KEM)',
        'CRYSTALS-Dilithium': 'Digital signature algorithm',
        'FALCON': 'Digital signature algorithm (compact)',
        'SPHINCS+': 'Stateless hash-based signatures'
    };
    
    Object.entries(nistStandards).forEach(([algorithm, purpose]) => {
        console.log(`  ${algorithm}: ${purpose}`);
    });
    
    console.log('\nHybrid Approaches:');
    console.log('Current deployment strategy combines classical and post-quantum:');
    console.log('  - X25519 + Kyber-512 key exchange');
    console.log('  - RSA/ECDSA + Dilithium signatures');
    console.log('  - Maintains security if either algorithm is broken');
    console.log('  - Allows gradual transition');
    
    console.log('\nTLS 1.3 Post-Quantum Extensions:');
    const pqExtensions = [
        'Hybrid key exchange groups (classical + PQ)',
        'Post-quantum signature algorithms',
        'Larger message sizes (PQ algorithms have bigger keys/signatures)',
        'Performance considerations (PQ algorithms are slower)',
        'Backward compatibility with classical-only implementations'
    ];
    
    pqExtensions.forEach(extension => console.log(`  - ${extension}`));
    
    console.log('\nDeployment Timeline:');
    console.log('  2022-2024: NIST standards finalized, early implementations');
    console.log('  2024-2026: Library integration, experimental deployments');
    console.log('  2026-2030: Gradual production rollout');
    console.log('  2030+: Full quantum-resistant deployment expected');
    
    console.log('\nImplementation Challenges:');
    const challenges = [
        'Larger key and signature sizes (bandwidth impact)',
        'Slower cryptographic operations (performance impact)',
        'Different security assumptions and parameters',
        'Compatibility with existing PKI infrastructure',
        'Need for hybrid approaches during transition',
        'Potential for new cryptanalytic attacks'
    ];
    
    challenges.forEach(challenge => console.log(`  - ${challenge}`));
}

// Execute all TLS 1.3 demonstrations
demonstrateTLS13Improvements();

const { sharedSecret } = tls13HandshakeFlow();
tls13KeySchedule(sharedSecret);
tls13CipherSuites();
tls13VsTls12Comparison();
tls13ZeroRTT();
tls13SecurityAnalysis();
tls13PerformanceAnalysis();
tls13ImplementationConsiderations();
tls13FutureAndPostQuantum();

console.log('\n=== TLS 1.3 Analysis Complete ===');
console.log('TLS 1.3 represents the current state-of-the-art in transport security');
console.log('Mandatory forward secrecy, reduced latency, and simplified design');
console.log('Post-quantum cryptography integration is the next major evolution');