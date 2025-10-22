import User from "../model/User.model.js"; //User mongoose.model for the DB (like a row in SQL) here refers tpo mongodb document
import crypto from "crypto"; //crypto is a built-in module in nodejs to generate random bytes
import nodemailer from "nodemailer"; //nodemailer is a library to send emails
import bcrypt from "bcryptjs"; //bcryptjs is a library to hash passwords
import jwt from "jsonwebtoken";//jsonwebtoken is a library to generate and verify json web tokens
const registerUser = async (req, res) => {
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
    const existingUser = await User.findOne({ email });
    // if user exists, return error
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
   // create a user in database
    const user = await User.create({
      name,
      email,
      password,
    });
    //log the user created
    console.log(user);
    //if user not found , return 400 status code with json message
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }
   // create a verification token -> here 32 bytes random hex string
    const token = crypto.randomBytes(32).toString("hex");
   // print the token
    console.log(token);
    // save token in database
    user.verificationToken = token;
   // save the user with the verification token
    await user.save();

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
   // design from , to subject text and url
    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email", // Subject line
      text: `Please click on the following link:
      ${process.env.BASE_URL}/api/v1/users/verify/${token}
      `,
    };
    //wait for the transporter to complete the mail related task
    // send mail with defined transport object
    await transporter.sendMail(mailOption);
   // send success status to user
    res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    // if error in try block, catch this and return error
    res.status(400).json({
      message: "User not registered ",
      error,
      success: false,
    });
  }
};
// verify user
const verifyUser = async (req, res) => {
  //get token from url
  //validate
  // find user based on token
  //if not
  // set isVerified field to true
  // remove verification token
  // save
  //return response
//destructure token from req.params
  const { token } = req.params;
  // print the token collected from the params of the request being sent to verify user api
  // ${process.env.BASE_URL}/api/v1/users/verify/${token} ${token} is the present in the params of the request
  //console.log the token
  // if no token, return error
  console.log(token);
  // if token not present, return error
  if (!token) {
    //400 bad request status code for invalid token
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  // db interaction
  try {
    console.log("verification started");
    console.log("verification token: ", token);
    // find user based on token
    const user = await User.findOne({ verificationToken: token });
   // if no user found, return error
    if (!user) {
      //400 status code for invalid token
      return res.status(400).json({
        message: "Invalid token",
      });
    }
    // set isVerified field to true once user is found
    user.isVerified = true;
    // remove verification token
    user.verificationToken = undefined;
    // save the user
    await user.save();
   // return success response
    res.status(200).json({
      message: "User verified successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "User not verified",
      error,
      success: false,
    });
  }
};

const login = async (req, res) => {
  // get email , password from req.body
  
  const { email, password } = req.body;
  // if not present return error
  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  // mongoose model interacts with db in another continent 
  try {
    // find user based on email
    const user = await User.findOne({ email });
    // if no user found, return error
    if (!user) {
      // 400 status code for bad request
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // compare password in the req.body  with hashed password from the mongoose.model schema in db
    const isMatch = await bcrypt.compare(password, user.password);
   // print whether password matches or not
    console.log(isMatch);
   // if password does not match, return error
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Decode, verify, and generate JSON Web Tokens, which are an open, industry standard RFC 7519 method for representing claims 
    // securely between two parties.
    // JWT signing and generation
    const token = jwt.sign(
      { id: user._id, role: user.role },

      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    // options for cookie
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    // set cookie in the response
    res.cookie("token", token, cookieOptions);
   // success response with token and user details except password
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
// controller for getting profile based on req.user.id set in the auth middleware
const getMe = async (req, res) => {
  // get user from req.user.id
  // find user based on id
  // if not found return error
  try {
    // find user based on id and exclude password field with select("-password")
    // req.user is set in the auth middleware after verifying the token and extracting the payload from the token
    // req.user.id is the id of the user extracted from the token payload
    // select("-password") excludes the password field from the user object
    // print the user found
    const user = await User.findById(req.user.id).select("-password");
    console.log(user);
   // if no user found, return error
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
   // success response with user details except password
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // if error in try block, catch this and return error
    console.log("Error in get me", error);
  }
};
const logoutUser = async (req, res) => {
  try {
    // clear cookie
    res.cookie("token", "", {});
    // success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
    // if error in try block, catch this and return error
  } catch (error) {}
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    // find user based on email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User with this email does not exist",
      });
    }

    // generate reset token and expiry (10 minutes)
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // send reset email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Reset your password",
      text: `You requested a password reset. Please click the link below to reset your password:
${process.env.BASE_URL}/api/v1/users/reset-password/${token}
If you did not request this, please ignore this email. This link will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOption);

    res.status(200).json({
      message: "Password reset email sent",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error sending password reset email",
      error,
      success: false,
    });
  }
};
const resetPassword = async (req, res) => {
  // collect token from params and passwords from body
  const { token } = req.params;
  const { password, confPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Invalid or missing token" });
  }

  if (!password || !confPassword) {
    return res.status(400).json({ message: "Password and confirmation are required" });
  }

  if (password !== confPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    // find user with valid (non-expired) reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token" });
    }

    // hash the new password and update user record
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
};

export {
  registerUser,
  verifyUser,
  login,
  getMe,
  logoutUser,
  resetPassword,
  forgotPassword,
};
