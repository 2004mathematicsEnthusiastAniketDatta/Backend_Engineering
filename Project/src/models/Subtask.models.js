import mongoose , {Schema} from "mongoose";

const subtaskSchema = new Schema({},{timestamps:true});


export const SubTask = mongoose.model("SubTask",subtaskSchema);