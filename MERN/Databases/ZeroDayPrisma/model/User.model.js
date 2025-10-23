// model is the modelling of the database schema and the mongoose is the ORM
// mongoose is the library that connects to mongodb and provides methods to interact with db
import mongoose from "mongoose";
// read 
import bcrypt from "bcryptjs";
//bcrypt is a library to hash passwords
//setup of models
// schema
// remember
// access tokens are tokens 
/*Access tokens are a fundamental component of modern authentication and authorization systems, serving as credentials that grant temporary access to protected resources. They are typically short-lived, with lifespans ranging from 15 minutes to an hour, and are designed to minimize the risk associated with token compromise.
 These tokens are often implemented using the JSON Web Token (JWT) format, which encodes user information, an expiration timestamp, and a cryptographic signature for verification, allowing for stateless authentication that is scalable and well-suited for APIs and single-page applications (SPAs).

In the OAuth 2.0 framework, access tokens are issued to clients after successful authorization and represent specific scopes and durations of access granted by the resource owner.
 They are used by clients to access protected resources on the resource server. When an access token expires, a refresh token is typically used to obtain a new access token without requiring the user to re-authenticate, thereby maintaining a seamless user experience while enhancing security.
 Refresh tokens are longer-lived and are stored securely, often in HTTP-only cookies, to prevent exposure to cross-site scripting (XSS) attacks.

A critical security consideration is the potential for token reuse or replay attacks. If an access token is stolen, an attacker can use it as a "bearer bond" to gain unauthorized access to resources, especially if the token is not protected by mechanisms like Proof-of-Possession (PoP) or mutual TLS (mTLS).
 To mitigate this, best practices include implementing token rotation, where a new refresh token is issued each time an old one is used, thereby limiting the window of opportunity for an attacker.
 Additionally, continuous access evaluation is emerging as a security enhancement, allowing systems to dynamically assess the validity of a user's access based on current conditions, such as conditional access policies, even after a token has been issued.

In Windows environments, access tokens are securable objects that define the security context of processes and threads, including the user’s security identifier (SID), group memberships, and privileges.
 Adversaries often exploit these tokens through techniques like token impersonation or theft, where a process gains a handle to a more privileged token and applies it to a thread, enabling actions under a higher-privileged identity.
 However, collecting telemetry for such activities is challenging, as no vendor currently provides explicit, scalable data sources to definitively detect token impersonation at scale.

In some systems, such as Microsoft Entra ID, access tokens are also used in hybrid identity scenarios. For example, in pass-through authentication, an on-premises authentication agent acquires an access token to register with Microsoft Entra ID, using it to securely exchange a public key and a certificate signing request to establish a trusted identity.
 This demonstrates how access tokens are integral not only to user access but also to the secure configuration and trust establishment between on-premises and cloud systems.

Overall, while access tokens provide a flexible and scalable method for managing access, their security relies heavily on short lifetimes, secure storage, robust validation, and advanced mechanisms like token rotation and continuous evaluation to counteract evolving threats*/  
// data is also there along with jwt token 
//hex string tokens may not be along with data
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
// mongoose middleware that hashes if password is modified
// pre is a mongoose method that executes before saving the user
// next is a callback function that moves to the next middleware
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
// User is a mongoose.model 
const User = mongoose.model("User", userSchema);
export default User;