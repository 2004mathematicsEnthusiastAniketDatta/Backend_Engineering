import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import cookieParser from "cookie-parser";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
const port = process.env.PORT || 4000; //can be in the form of arrays

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
