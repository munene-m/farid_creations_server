import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JwtPayload } from "jsonwebtoken";
import { getUserById } from "../models/auth";
import rateLimit from "express-rate-limit";

interface DecodedToken extends JwtPayload {
  id: string; // Adjust the structure as needed based on your token
}

// Define a rate limit middleware for authenticated users
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Maximum requests per windowMs per user
  keyGenerator: (req) => {
    // Generate a unique key based on the user's identifier (e.g., user ID)
    if (req.user) {
      return req.user.id.toString();
    }
    // Return a default key for unauthenticated users
    return "unauthenticated";
  },
  message: "Too many requests from this user, please try again later.",
});

const userProtect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || ""
      ) as DecodedToken;

      const user = await getUserById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ error: "Unauthorized attempt" });
      }

      req.user = { id: user._id, ...user };

      // Check the role and grant or deny access
      if (user.role === "admin") {
        // Admin has unrestricted access
        next();
      } else {
        // Regular users have restricted access
        // Modify this based on your route requirements
        // For example, you can check if the user has permission to access a specific route
        if (
          req.params.customerId &&
          req.params.customerId !== user.id.toString()
        ) {
          return res.status(403).json({ error: "Forbidden" });
        }
        // Apply rate limiting for authenticated users
        authLimiter(req, res, (err: any) => {
          if (err) {
            return res
              .status(429)
              .json({ error: "Rate limit exceeded. Try again later." });
          }
          next();
        });
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return res
          .status(401)
          .json({ error: "Token has expired. Please log in again" });
      } else {
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } else {
    return res
      .status(401)
      .json({ error: "Unauthorized attempt. Token required." });
  }
};

export default userProtect;
