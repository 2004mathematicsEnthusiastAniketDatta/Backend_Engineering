import express from "express";
//import all controllers
import {
  login,
  registerUser,
  verifyUser,
  getMe,
  logoutUser,
} from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
// router 
const router = express.Router();
//isLoggedIn() executes and isLoggedIn is an event
//routes flow and setup 
//route -> controller
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", login);
//route -> middleware -> controller
router.get("/profile", isLoggedIn, getMe);
router.get("/logout", isLoggedIn, logoutUser);
//export router
export default router;