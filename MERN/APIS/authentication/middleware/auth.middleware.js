import jwt from "jsonwebtoken";

export const isLoggedIn = async (req, res, next) => {
 // how  
 // check if cookies are present
 //check if token is present in cookies 
    try {
    console.log(req.cookies);
    let token = req.cookies?.token;
  //Print whether token is found or not
    console.log("Token Found: ", token ? "YES" : "NO");
  // if no token, return error
//read -> validate
  if (!token) {
      console.log("NO token");
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
  // if token is present, verify the token 
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    //log on console the decoded data
    console.log("decoded data: ", decoded);
  // if token is valid, attach user to req object user attribute
    req.user = decoded;
  // call next middleware
    next();
  // if error in try block, catch this and return error
  } catch (error) {
    console.log("Auth middleware failure");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
