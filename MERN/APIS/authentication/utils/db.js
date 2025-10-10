import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}
export default connectDB;
//export default exports single file
// see 
// database creation 
// ip whitelisting in mongoDB in testing and server's ip in production
//database is always in another continent