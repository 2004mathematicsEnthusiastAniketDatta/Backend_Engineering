import express from 'express';
import { registerUser } from '../controller/user.controller.js';
const router = express.Router();
// Route for user registration
router.get('/register', registerUser);

export default router;