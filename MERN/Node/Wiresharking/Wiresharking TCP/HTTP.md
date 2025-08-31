# Wireshark Analysis: TCP and HTTP Deep Dive

## Introduction to Wireshark
Wireshark is a powerful network protocol analyzer that captures and displays packet-level data flowing through network interfaces. It's essential for network troubleshooting, security analysis, and understanding protocol behavior.

## TCP (Transmission Control Protocol) Analysis

### TCP Header Structure
- **Source Port** (16 bits): Identifies the sending application
- **Destination Port** (16 bits): Identifies the receiving application
- **Sequence Number** (32 bits): Position of data in the stream
- **Acknowledgment Number** (32 bits): Next expected sequence number
- **Flags**: SYN, ACK, FIN, RST, PSH, URG
- **Window Size** (16 bits): Flow control mechanism
- **Checksum** (16 bits): Error detection

### TCP Three-Way Handshake
1. **SYN**: Client sends SYN packet to server
2. **SYN-ACK**: Server responds with SYN-ACK
3. **ACK**: Client sends ACK to complete connection

### Key TCP Metrics in Wireshark
- **Round Trip Time (RTT)**: Time for packet to reach destination and return
- **Window Scaling**: Negotiated during handshake for large windows
- **Retransmissions**: Duplicate packets indicating network issues
- **Out-of-Order Packets**: Packets arriving in wrong sequence

## HTTP (HyperText Transfer Protocol) Analysis

### HTTP Request Structure
```
Method SP Request-URI SP HTTP-Version CRLF
Headers CRLF
CRLF
Message-Body
```

### HTTP Methods
- **GET**: Retrieve data
- **POST**: Submit data
- **PUT**: Update resource
- **DELETE**: Remove resource
- **HEAD**: Get headers only
- **OPTIONS**: Check allowed methods

### HTTP Status Codes
- **1xx**: Informational
- **2xx**: Success (200 OK, 201 Created)
- **3xx**: Redirection (301 Moved, 302 Found)
- **4xx**: Client Error (404 Not Found, 403 Forbidden)
- **5xx**: Server Error (500 Internal Server Error)

## Wireshark Filtering for TCP/HTTP

### TCP Filters
```
tcp.port == 80
tcp.flags.syn == 1
tcp.analysis.retransmission
tcp.window_size_value < 1000
```

### HTTP Filters
```
http
http.request.method == "GET"
http.response.code == 200
http.host contains "example.com"
http.request.uri contains "/api/"
```

## Performance Analysis

### TCP Performance Indicators
- **Bandwidth Delay Product**: Optimal window size calculation
- **Congestion Window**: TCP's congestion control mechanism
- **Slow Start**: Initial connection ramp-up phase
- **Fast Recovery**: Handling packet loss efficiently

### HTTP Performance Metrics
- **Time to First Byte (TTFB)**: Server response time
- **Content Download Time**: Time to receive complete response
- **Keep-Alive Connections**: Connection reuse for multiple requests
- **Compression**: gzip/deflate content encoding

## Common Issues and Troubleshooting

### TCP Issues
- **Window Zero**: Receiver buffer full
- **Duplicate ACKs**: Potential packet loss
- **RST Packets**: Connection forcefully closed
- **Fragmentation**: Large packets split across multiple frames

### HTTP Issues
- **Incomplete Responses**: Truncated content
- **Authentication Failures**: 401/403 responses
- **Redirect Loops**: Circular redirection patterns
- **Slow Responses**: High server processing time

## Advanced Analysis Techniques

### Stream Following
- **Follow TCP Stream**: View complete conversation
- **Follow HTTP Stream**: See request/response pairs
- **Export Objects**: Extract transferred files

### Statistical Analysis
- **IO Graphs**: Visualize traffic patterns
- **Protocol Hierarchy**: Traffic breakdown by protocol
- **Conversations**: Communication between endpoints
- **Endpoints**: Traffic statistics per IP/port

## Security Considerations

### HTTP Security Headers
- **X-Frame-Options**: Clickjacking protection
- **Content-Security-Policy**: XSS prevention
- **Strict-Transport-Security**: HTTPS enforcement
- **X-Content-Type-Options**: MIME-type sniffing protection

### SSL/TLS Analysis
- **Certificate Validation**: Check certificate chain
- **Cipher Suites**: Encryption algorithm negotiation
- **Handshake Analysis**: TLS connection establishment
- **Encrypted Traffic**: Limited analysis of HTTPS content

## Best Practices

### Capture Optimization
- Use specific capture filters to reduce file size
- Capture only necessary interfaces
- Set appropriate buffer sizes
- Use ring buffers for long captures

### Analysis Workflow
1. Apply display filters to focus on relevant traffic
2. Identify connection patterns and anomalies
3. Analyze timing and performance metrics
4. Export relevant data for reporting
5. Document findings and recommendations