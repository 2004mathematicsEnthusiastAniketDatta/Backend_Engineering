import dgram from 'node:dgram';
import dns from 'dns-packet';


// DNS records database
const db = {
    'aniketdatta.dev': '1.2.3.4',
    'works.aniketdatta.dev': '4.5.6.7'
};

// Create UDP server
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    try {
        // Decode the incoming DNS query
        const query = dns.decode(msg);
        console.log(`Received query for: ${query.questions[0]?.name}`);
        
        // Get the question from the query
        if (!query.questions || query.questions.length === 0) {
            console.error('Invalid DNS query: no questions');
            return;
        }
        
        const question = query.questions[0];
        const domain = question.name;
        const ipAddress = db[domain];
        
        // Prepare response
        const response = dns.encode({
            id: query.id,
            type: 'response',
            flags: dns.RECURSION_DESIRED | dns.RECURSION_AVAILABLE,
            questions: [question],
            answers: ipAddress ? [
                {
                    name: domain,
                    type: 'A',
                    class: 'IN',
                    ttl: 300,
                    data: ipAddress
                }
            ] : []
        });
        
        // Send the response
        server.send(response, rinfo.port, rinfo.address, (err) => {
            if (err) {
                console.error('Error sending response:', err);
            } else {
                console.log(`DNS response sent to ${rinfo.address}:${rinfo.port} for ${domain}`);
            }
        });
    } catch (error) {
        console.error('Error processing DNS request:', error);
    }
});

server.on('error', (err) => {
    console.error('Server error:', err);
    server.close();
});

server.on('listening', () => {
    const { address, port } = server.address();
    console.log(`DNS server listening on ${address}:${port}`);
});

// DNS servers typically use port 53, but we use a non-privileged port for testing
const PORT = process.env.PORT || 5353;
server.bind(PORT);
