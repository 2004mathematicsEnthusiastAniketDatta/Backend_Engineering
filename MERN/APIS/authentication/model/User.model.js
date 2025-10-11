import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
//hooks 
//pre-save hook to hash password before saving
// arrow function does not bind 'this', so we use function keyword with next keyword and next() is called to proceed to the next middleware or save operation
//I forcefully bring the hook with some business logic next() gives signal that my business logic work is done
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    //Hash Function: A deterministic algorithm 
    //that maps arbitrary-size input data to a fixed-size output ,  hash/digest through mathematical transformations.
    // Encryption,Decryption : reversible process , Hashing is not reversible and hash value can be same for same input and cannot be
    // converted back to original input
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;

