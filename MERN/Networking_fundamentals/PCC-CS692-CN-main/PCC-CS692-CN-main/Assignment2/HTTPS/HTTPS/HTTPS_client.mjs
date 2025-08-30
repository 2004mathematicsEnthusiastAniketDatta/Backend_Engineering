const http = require("node:https"); //module that know to do https
const req = http.request("https://example.com",{"method":"GET"}); //https scheme
// response res is decrypted before we get there

req.on("response", res =>{
    console.log(res.headers)
    console.log(res.statusCode)
    //set the encoding
    res.setEncoding("utf-8");
    res.on("data", data => console.log("some data" + data))
})
req.end(); //end the request
//end the stream
let x = req.getHeaders();
console.log(x);
