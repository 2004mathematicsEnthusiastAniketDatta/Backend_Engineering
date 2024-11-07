
// const  catMe = require('cat-me');
// console.log(catMe());

// Hello World with HTTP server

const http=require('http');

const server=http.createServer((req,res)=>{
    console.log(req.url)
    if(req.url == "/about"){
        res.end("The about page");
    }
    if(req.url == "/profile"){
        res.end("The profile page");
    }
    res.end('Hello World');
});
server.listen(8888)

