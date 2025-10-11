import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const registerUser = async (req, res) => {
  //get data from req.body
  // Destructure the data from req.body
  const { name, email, password } = req.body;
  // Validate the data
  if (!name || !email || !password) {
   // empty fields
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  // Check if user already exists
  //existingUser -> variable ,User (documents) mongoose model ()  or Row in SQL database
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
// Create a user in database
//database is assumed to be in another continent
    const user = await User.create({
      name,
      email,
      password,
    });
    console.log(user);
//if user not registered , create a new user 
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }
//create a verification token
    const token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    user.verificationToken = token;
  // save token in database
    await user.save();
  // send token as email to user
  //send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
// what to send email from 
    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email", // Subject line
      text: `Please click on the following link:
      ${process.env.BASE_URL}/api/v1/users/verify/${token}
      `,
    };
    await transporter.sendMail(mailOption);
  // send success status to user
    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "User not registered ",
      error,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  //get token from url
  const { token } = req.params;
  console.log(token);
   //validate
  if (!token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  // find user based on token
  const user = await User.findOne({ verificationToken: token });
  //if not
  //if bad request then invalid token
  if (!user) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  // set isVerified field to true
  user.isVerified = true;
  // remove verification token
  user.verificationToken = undefined;
  // save the user
  await user.save();
};

const login = async (req, res) => {
// destructure email and password from the req.body
  const { email, password } = req.body;
// validate the email or password , if not there, send bad request
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
// check if user exists
  try {
    const user = await User.findOne({ email });
// if not send bad request
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
// compares the plain text password in the request body with the hashed password stored in the database
    // bcrypt.compare() is an asynchronous function that returns a promise, so we use await to wait for the result.
    // isMatch will be true if the passwords match, otherwise false. 
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);
// if not matching send bad request
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // JWT: an open, industry standard RFC 7519 method for representing claims securely between two parties.
    //JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting 
    // information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.
    //JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.

// Although JWTs can be encrypted to also provide secrecy between parties, we will focus on signed tokens. Signed tokens can verify the integrity of the claims contained within it, while encrypted tokens hide those claims from other parties. When tokens are signed using public/private key pairs, the signature also certifies that only the party holding the private key is the one that signed it.
    const token = jwt.sign(
      { id: user._id, role: user.role },

      "shhhhh",
      {
        expiresIn: "24h",
      }
    );
    // A cookie (also known as a web cookie or browser cookie) is a small piece of data a server sends to a user's web browser. 
    // The browser may store cookies, create new cookies, modify existing ones, and send them back to the same server with later requests. 
    // Cookies enable web applications to store limited amounts of data and remember state information; 
    // by default the HTTP protocol is 
    // stateless.
    //cookieOptions contain httpOnly, secure, maxAge properties
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    // set cookie in the response
    res.cookie("token", token, cookieOptions);
    // send success response to user
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {}
};

export { registerUser, verifyUser, login };
