import { PrismaClient } from "@prisma/client"; //User mongoose.model for the DB (like a row in SQL) here refers tpo mongodb document
import crypto from "crypto"; //crypto is a built-in module in nodejs to generate random bytes
import nodemailer from "nodemailer"; //nodemailer is a library to send emails
import bcrypt from "bcryptjs"; //bcryptjs is a library to hash passwords
import jwt from "jsonwebtoken";//jsonwebtoken is a library to generate and verify json web tokens
const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  // get data
  //validate
  // check if user already exists
  // create a user in database
  //create a verification token
  // save token in database
  // send token as email to user
  // send success status to user
  // data is always obtained from req.body , req.params and req.cookies in sixty percent scenarios
  //destructure name, email, password from req.body
  const { name, email, password } = req.body;
  //validate data - check if all fields are present otherwise return error
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
 // interacting with db means we should try catch and async await
 // db may be in another continent 
  try {
    // check if user already exists
    // findOne is a mongoose method to find a single document in the collection
    // if user exists, return error
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    // if user exists, return error
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
} catch (error){
    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};



