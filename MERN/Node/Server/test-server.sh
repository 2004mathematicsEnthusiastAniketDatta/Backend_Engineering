#!/bin/bash

# Test script for HTTPS Server
echo "🧪 Testing Industry-Standard HTTPS Server with TLS 1.3"
echo "======================================================"

# Check if server is running
echo "📡 Checking if server is running on port 8445..."
if netstat -tlnp 2>/dev/null | grep -q ":8445 "; then
    echo "✅ Server is running on port 8445"
else
    echo "❌ No server found on port 8445"
    echo "💡 Starting server..."
    cd /home/aniketdatta/Backend_Engineering/MERN/Node/Server
    node src/httpsServer.js &
    SERVER_PID=$!
    echo "🚀 Server started with PID: $SERVER_PID"
    sleep 3
fi

echo ""
echo "🔍 Testing endpoints..."

# Test health endpoint
echo "📋 Testing /health endpoint:"
curl -k -s https://localhost:8445/health | python3 -m json.tool 2>/dev/null || curl -k -s https://localhost:8445/health

echo ""
echo ""

# Test TLS info endpoint
echo "🔒 Testing /tls-info endpoint:"
curl -k -s https://localhost:8445/tls-info | python3 -m json.tool 2>/dev/null || curl -k -s https://localhost:8445/tls-info

echo ""
echo ""

# Test API status endpoint
echo "📊 Testing /api/status endpoint:"
curl -k -s https://localhost:8445/api/status | python3 -m json.tool 2>/dev/null || curl -k -s https://localhost:8445/api/status

echo ""
echo ""

# Test TLS version with OpenSSL
echo "🔐 Testing TLS version with OpenSSL:"
echo | openssl s_client -connect localhost:8445 -servername localhost 2>/dev/null | grep -E "(Protocol|Cipher)"

echo ""
echo "✅ All tests completed!"
echo "💡 To stop the server: pkill -f 'node.*httpsServer'"
