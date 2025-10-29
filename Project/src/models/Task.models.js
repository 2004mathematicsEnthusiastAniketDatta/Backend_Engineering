import mongoose , {Schema} from "mongoose";

const taskSchema = new Schema({},{timestamps:true});


export const Task = mongoose.model("Task",taskSchema);

