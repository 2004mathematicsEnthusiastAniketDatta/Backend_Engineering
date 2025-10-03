import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    isVerified : { type: Boolean, default: false },
    verificationToken: { type: String },
    PasswordResetToken: { type: String },
    PasswordResetExpires: { type: Date },
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
    // Add any other fields you need, e.g., profile picture, bio, etc.
    // Financial data is already handled in paise in India to avoid floating point issues
}, { timestamps: true });
const User= mongoose.model("User", userSchema);
export default User;
