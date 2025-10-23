import express from "express";
//import all controllers
import {
  registerUser
} from "../controller/auth.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
// router 
const userRouter = express.Router();
//isLoggedIn() executes and isLoggedIn is an event
//routes flow and setup 
//route -> controller
userRouter.post("/register", registerUser);
// userRouter.get("/verify/:token", verifyUser);
// userRouter.post("/login", login);
// //route -> middleware -> controller
// userRouter.get("/profile", isLoggedIn, getMe);
// userRouter.get("/logout", isLoggedIn, logoutUser);
// userRouter.post("/forgotpassword", forgotPassword);
// userRouter.post("/resetpassword/:token", forgotPassword);
//export router
export default userRouter;