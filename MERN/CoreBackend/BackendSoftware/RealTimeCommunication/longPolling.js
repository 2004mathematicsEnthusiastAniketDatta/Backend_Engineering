import http from 'http';



const server = http.createServer((req,res) =>{
    if(req.url === '/poll'){
        setTimeout(() => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({message: 'Hello from the server!'}));          
        },3000);
    }
    else{
    // `req.url` is not `/poll`, so we can send a different response
        // For example, we can send a simple text response
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Server is up');
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
}
);