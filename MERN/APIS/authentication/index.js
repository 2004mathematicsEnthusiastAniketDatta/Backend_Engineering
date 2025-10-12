//express is a LAYERED MIDDLEWARE PIPELINE built on top of Node's HTTP server
//  backend web framework for nodejs to build web applications and APIs
//express is a request handler framework
//read and understand
//Router + Middleware Stack + Request/Response Enhancement
//method routing 
//read
import express from "express";
// read
// environment variables from .env file into process.env
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";
import cookieParser from "cookie-parser";
//import all routes
import userRoutes from "./routes/user.routes.js";
//configure environment variables
dotenv.config();
// When you call express(), you're creating an application instance
const app = express();
// middleware like request handlers that does cross-origin resource sharing
app.use(
  //cors is a middleware that allows cross-origin requests
  // origin is the frontend url that is allowed to access the backend
  // credentials is true to allow cookies to be sent
  // methods is the allowed http methods
  // allowedHeaders is the allowed headers
  //credentials:include allows cookies to be sent
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// built-in middleware to parse json and urlencoded data and cookie parser middleware
app.use(express.json());
// extended:true allows to parse nested objects
app.use(express.urlencoded({ extended: true }));
// cookie parser middleware to parse cookies from the request headers
app.use(cookieParser());
//port
const port = process.env.PORT || 4000;
//routes set up for http methods
app.get("/", (req, res) => {
  res.send("Cohort!");
});

app.get("/hitesh", (req, res) => {
  res.send("Hitesh");
});

app.get("/piyush", (req, res) => {
  res.send("Piyush!");
});

//connect to db
db();

//user routes
app.use("/api/v1/users", userRoutes);
//port listening
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
