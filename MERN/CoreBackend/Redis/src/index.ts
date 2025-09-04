import Express = require("express");
import Redis from "ioredis";
const http = require('http'); 
const axios = require("axios"); 
const server =require('socket.io'); //http server
const app = Express(); //Express Server for app
const http_server=http.createServer(app); //wrapper of http server on express app
const io = new server.Server(http_server,{
    cors:{
        origin:"*",
        methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD","CONNECT","TRACE"],
        allowedHeaders:["Content-Type","Authorization"]
    }
});//socket server
io.attach(http_server); //attach socket server to http server
io.on(
  "connection", (socket:any) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.id);
    });
  }
);
const PORT = process.env.PORT || 8000;
// interface CacheStore {
//     totalPageCount: number;
// }
// const cacheStore: CacheStore = {
//      // Clear , Least Recently Used , Server Crash , Time To Live , New set of Problems
//     totalPageCount: 0
// };
const redis = new Redis({  host: 'localhost',
  port: 6379,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  // Add connection timeout
  connectTimeout: 10000,
  commandTimeout: 5000});
app.use(Express.static('./public'));
app.use(async function(req, res, next){
  const key='rate-limit:{_id}'+req.ip;
  const value = await redis.get(key); // 127.0.0.1:6380 > get key o / p:nil
  if(value == null){
    await redis.set(key,0); // 127.0.0.1:6380 > set key 0
    await redis.expire(key, 60); // 127.0.0.1:6380 > expire key 60
  }
  if (Number(value)>=10) {
    return res.status(429).json({message: "Too many requests"});
  }
  await redis.incrby(key,1); // 127.0.0.1:6380 > incrby key 1
  next();
})  
app.get("/", (req, res) => {
 return res.json({message: "success"});
});
app.get("/books", async (req, res) => {
  try {
    const response = await axios.get("https://api.freeapi.app/api/v1/public/books?page=1&limit=10&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=tech");
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  // Don't let unhandled errors crash the app
});
redis.on('connect', () => {
  console.log('Connected to Redis');
});
redis.on('ready', () => {
  console.log('Redis ready');
});
redis.on('close', () => {
  console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting');
});
app.get('/books/total', async(req,res)=>{
    try {
        // Check if the totalPageCount is already cached : cache hit 
        const cachedValue = await redis.get('totalPageCount');
        if(cachedValue) {
          console.log('Cache Hit');
          return res.json({ totalPageCount: Number(await redis.get('totalPageCount')) });
        }
    const response = await axios.get("https://api.freeapi.app/api/v1/public/books?page=1&limit=10&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=tech");
    const totalPageCount = response?.data?.data?.data?.reduce((acc: number , curr:{volumeInfo?: {pageCount?: number}}) => curr.volumeInfo?.pageCount ? curr.volumeInfo.pageCount + acc : acc, 0);
   // set the cache
    // cacheStore.totalPageCount = Number(totalPageCount);
    await redis.set('totalPageCount', String(totalPageCount), 'EX', 60); // Expires in 60 seconds -> TTL Expires for the key
    console.log('Cache Miss');
    return res.json({ totalPageCount });
    
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

http_server.listen(PORT,()=>{
    console.log(`httpServer is running on port ${PORT}`);
});