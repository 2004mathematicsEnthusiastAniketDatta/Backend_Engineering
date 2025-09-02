import Express = require("express");
import Redis from "ioredis";
const axios = require("axios");
const app = Express();
const PORT = process.env.PORT || 8000;
interface CacheStore {
    totalPageCount: number;
}
const cacheStore: CacheStore = {
     // Clear , Least Recently Used , Server Crash , Time To Live , New set of Problems
    totalPageCount: 0
};
const redis = new Redis({host: 'localhost', port: Number(6380)});
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
app.get('/books/total', async(req,res)=>{
    try {
        // Check if the totalPageCount is already cached : cache hit 
        if(await redis.get('totalPageCount')) {
            return res.json({ totalPageCount: Number(await redis.get('totalPageCount')) });
        }
    const response = await axios.get("https://api.freeapi.app/api/v1/public/books?page=1&limit=10&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=tech");
    const totalPageCount = response?.data?.data?.data?.reduce((acc: number , curr:{volumeInfo?: {pageCount?: number}}) => curr.volumeInfo?.pageCount ? curr.volumeInfo.pageCount + acc : acc, 0);
   // set the cache
    cacheStore.totalPageCount = Number(totalPageCount);
    return res.json({ totalPageCount });
    console.log('Cache Miss');
    
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
