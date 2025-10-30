import mongoose , {Schema} from "mongoose";
import {} from "bcrypt";
const userSchema = new Schema({
   avatar: {
       type: {
           url: String,
           localpath: String
       },
       default:{
        url:`https://placehold.co/600x400`,
        localpath:""
       }
   },
   username:{
      type: String,
      required: true,
      unique: true,
      lowercase:true,
      trim:true,
      index:true
   },
   email:{
      type: String,
      required: true,
      unique: true,
      lowercase:true,
      trim:true,
      index:true
   },
   fullname:{
      type: String,
      required: true,
      unique: true,
      lowercase:true,
      trim:true,
   },
   password:{
      type: String,
      required: [true,"Password is required"],
   },
   isEmailVerified:{
      type: Boolean,
      default: false,
   },
   forgotPasswordToken:{
       type: String,
   },
   forgotPasswordExpiry:{
     type: Date,
   },
   refreshToken:{
      type: String,
   },
   emailVerificationToken:{
       type: String,
   },
   emailVerificationExpiry:{
      type: Date,
   }

},{timestamps:true});
userSchema.pre("save",async function(next))

export const User = mongoose.model("User",userSchema);