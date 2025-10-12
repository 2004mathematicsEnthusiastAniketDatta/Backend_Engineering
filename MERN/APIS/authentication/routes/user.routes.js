import express from "express";
import {
  login,
  registerUser,
  verifyUser,
  getMe,
  logoutUser,
} from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router = express.Router();
//isLoggedIn() executes and isLoggedIn is an event 
router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", login);
router.get("/profile", isLoggedIn, getMe);
router.get("/logout", isLoggedIn, logoutUser);

export default router;