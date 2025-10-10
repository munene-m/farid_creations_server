import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { getUserById } from "../models/auth";
interface DecodedToken extends JwtPayload {
  id: string; // Adjust the structure as needed based on your token
}
const adminProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
        return res.status(401).json({ message: "Unauthorized attempt" });
      }

      req.user = { id: user._id, ...user };

      // Check if the user is an admin
      if (user.role === "admin") {
        next(); // Admin has unrestricted access
      } else {
        return res.status(403).json({ message: "Forbidden access" });
      }
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return res
          .status(401)
          .json({ error: "Login session has expired. Please log in again." });
      } else {
        return res.status(401).json({ error: "Invalid token" });
      }
    }
  } else {
    return res
      .status(401)
      .json({ message: "Unauthorized attempt. Token required." });
  }
};

export default adminProtect;
