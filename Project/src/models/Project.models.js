import mongoose , {Schema} from "mongoose";

const projectSchema = new Schema({
    
},{timestamps:true});


export const Project = mongoose.model("Project",projectSchema);