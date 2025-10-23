import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
//import db from './utils/db.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 6000;

app.get('/', (req, res) => {
  res.status(200).json({ 
    success:true,
    message: "test checked" 
  });
});
app.get('/api', (req, res) => {
  res.status(200).json({ 
    success:true,
    message: "API test checked" 
  });
});
app.get('/api/v1/users', (req, res) => {
  res.status(200).json({ 
    success:true,
    message: "User route test checked" 
  });
});

//db();

// app.use('/api/v1/users', userRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});