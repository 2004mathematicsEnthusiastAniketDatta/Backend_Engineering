import http from 'http';



const server = http.createServer((req, res) => {
    if (req.url === '/events') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Send a message every second
        const intervalId = setInterval(() => {
            res.write(`data: ${JSON.stringify({ message: 'Hello from the server!' })}\n\n`);
        }, 1000);

        // Clear the interval when the connection is closed
        req.on('close', () => {
            clearInterval(intervalId);
            res.end();
        });
    } else {
        // Handle other routes or send a default response
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});


