import mongoose , {Schema} from "mongoose";

const projectMemberSchema = new Schema({},{timestamps:true});


export const ProjectMember = mongoose.model("ProjectMember",projectMemberSchema);