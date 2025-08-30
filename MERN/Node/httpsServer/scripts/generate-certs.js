// Certificate generation script for development purposes
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '..', 'certs');

console.log('🔧 Generating SSL certificates for development...');

try {
    // Create certs directory
    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir, { recursive: true });
        console.log('✓ Created certs directory');
    }

    // Generate private key and certificate
    const opensslCommand = `openssl req -x509 -newkey rsa:4096 -nodes -keyout "${path.join(certsDir, 'server.key')}" -out "${path.join(certsDir, 'server.crt')}" -days 365 -subj "/C=US/ST=Development/L=Localhost/O=DevServer/CN=localhost"`;
    
    console.log('🔑 Generating RSA 4096-bit private key and certificate...');
    execSync(opensslCommand, { stdio: 'inherit' });
    
    console.log('✅ SSL certificates generated successfully!');
    console.log(`📁 Certificate files created in: ${certsDir}`);
    console.log('   - server.key (private key)');
    console.log('   - server.crt (certificate)');
    console.log('\n⚠️  These are self-signed certificates for development only!');
    
} catch (error) {
    console.error('❌ Error generating certificates:', error.message);
    console.error('\nPlease ensure OpenSSL is installed on your system:');
    console.error('- Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
    console.error('- macOS: brew install openssl');
    console.error('- Ubuntu/Debian: sudo apt-get install openssl');
    console.error('- CentOS/RHEL: sudo yum install openssl');
    process.exit(1);
}
