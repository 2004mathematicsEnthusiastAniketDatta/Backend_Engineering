// model is the modelling of the database schema and the mongoose is the ORM
// mongoose is the library that connects to mongodb and provides methods to interact with db
import mongoose from "mongoose";
// read 
import bcrypt from "bcryptjs";
//bcrypt is a library to hash passwords
//setup of models
// schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
// mongoose middleware that hashes if password is modified
// pre is a mongoose method that executes before saving the user
// next is a callback function that moves to the next middleware
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
// User is a mongoose.model 
const User = mongoose.model("User", userSchema);
export default User;
