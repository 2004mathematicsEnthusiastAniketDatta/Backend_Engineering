import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.routes.js';
// import cookieParser from 'cookie-parser';
import cors from 'cors';
//models

// Load environment variables from .env file
dotenv.config();
// Port from environment variables or default to 5000
const app = express();
//Saying no to SameOrigin Policy 
// DeepSearch about the code
//Mongoose connection to mongoDB
import connectDB from './utils/db.js';
app.use(cors(
    {
    origin:'https://friendly-space-invention-76gj6g6779v2wx9r-5000.app.github.dev/',
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:['Content-Type','Authorization'],
    credentials:true,
    optionsSuccessStatus:200,
    preflightContinue:false
} 
));
// accept json data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to accept urlencoded data

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working!" });
});
app.get("/api/users", (req, res) => {
  res.json({ users: ["user1", "user2", "user3"] });
});
app.get("/api/products", (req, res) => {
  res.json({ products: ["product1", "product2", "product3"] });
});
//db
// connect to db
connectDB();
//routes
app.use('/api/v1/users', userRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
