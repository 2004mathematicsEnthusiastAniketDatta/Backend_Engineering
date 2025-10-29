import mongoose , {Schema} from "mongoose";

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
         type: Boolean,
         default: false,
     },
     forgotPasswordExpiry:{
       type: String,
       default:  
     }         
},{timestamps:true});


export const User = mongoose.model("User",userSchema);