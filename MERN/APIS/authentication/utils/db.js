// model is the modelling of the database schema and the mongoose is the ORM
// mongoose is the library that connects to mongodb and provides methods to interact with db
import mongoose from "mongoose";
//understand 
import dotenv from "dotenv";
dotenv.config();
//remember 
// export a function that connects to db
// mongoose.connect returns a promise
// db connection
const db = () => {
  //mongoose connection to mongodb with the MONGO_URL from .env
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      //log success message
      console.log("connected to mongodb");
    })
    .catch((err) => {
      //log error message
      console.log("Error connecting to mongodb");
    });
};
//deafult export for only one function 
export default db;
//export default exports single file
// see 
// database creation 
// ip whitelisting in mongoDB in testing and server's ip in production
//Assume , database is always in another continent