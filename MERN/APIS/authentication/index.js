import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./utils/db.js";
import cookieParser from "cookie-parser";
//import all routes
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: 'http://friendly-space-invention-76gj6g6779v2wx9r-5000.app.github.dev',
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.send("api is running!");
});

app.get("/api/v1", (req, res) => {
  res.send("v1 is running!");
});
app.get("/api/v1/users", (req, res) => {
  res.send("users is running!");
});
//connect to db
db();

//user routes
// Mount user routes at /api/v1 to avoid duplicating "/users" if the router already includes that segment
app.use("/api/v1/users", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
