import Auth from "../models/auth";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import logger from "../helpers/logging";
import { validateUserFields, validateLoginFields } from "../utils/validation";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ObjectId } from "mongoose";

const bcryptSalt = process.env.BCRYPT_SALT;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    const validationError = validateUserFields(email, password);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const userExists = await Auth.findOne({ email });
    if (userExists) {
      return res.status(403).json({ message: "Forbiden. User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(bcryptSalt));

    const isAdmin = email === process.env.ADMIN_EMAIL;

    const user = await Auth.create({
      username,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : "customer",
    });
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
      logger.info(`User - ${email} account created successfully`);
    }
  } catch (error) {
    logger.error("Error occurred when creating account: ", error);
    return res.status(400).json(error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginFields(email, password);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
    logger.info(`Successful login by ${user.email}`);
  } catch (error) {
    res.status(400).json({ message: "An error occurred." });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await Auth.findById(req.params.customerId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "This user does not exist" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    logger.error(`User does not exist`);
    res.status(400).json({ message: "This user does not exist" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await Auth.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    logger.error("There are no users found");
    res.status(400).json({ message: "An error occured" });
  }
}

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Please provide an email address" });
  }
  const user = await Auth.findOne({ email });

  if (!user) {
    return res.status(404).json({ error: "Email does not exist" });
  }
  const userId = user._id;
  const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });
  user.passResetToken = resetToken;
  await user.save();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Farid-creations Password Reset",
    html: `
      <p>Hi ${user.username},</p>
      <p>We received a request to change your password. You can click the button below to proceed with creating a new password.</p>
      <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 10px">If you ignore this email, your password will not be changed. This link expires in 1 hour.</p>      
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to send reset email" });
    }

    console.log("Email sent: " + info.response);
    res.status(200).json({ message: "Password reset email sent" });
  });
};

export const changeUserPassword = async (req: Request, res: Response) => {
  const { password, token } = req.body;
  if (!password || !token) {
    return res
      .status(400)
      .json({ message: "Please enter all the required fields" });
  }
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JwtPayload;
    const userId = decodedToken.userId;

    Auth.findOne({ passResetToken: token })
      .then(async (user) => {
        if (!user) {
          return res.status(400).json({ error: "The token is invalid" });
        }

        // Verify that the token's user ID matches the user's ID
        if (user._id.toString() !== userId) {
          return res.status(401).json({ error: "Invalid token for this user" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        await Auth.findByIdAndUpdate(
          user._id,
          { password: hashedPassword },
          { new: true }
        );
        user.passResetToken = undefined;
        await user.save();
        res.status(200).json({ message: "Password changed successfully." });
      })
      .catch((err) => {
        res.status(400).json({ error: "Failed to change password", err });
      });
  } catch (err) {
    res.status(400).json({ error: "Failed to change password for user" });
  }
};

export async function deleteUser(req: Request, res: Response) {
  try {
    const user = await Auth.findById(req.params.customerId);
    if (!user) {
      return res
        .status(404)
        .json({ error: "The user you tried to delete no longer exists." });
    } else {
      await Auth.findByIdAndDelete(req.params.customerId);
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    logger.error("An error occured deleting user.", error);
    res.status(400).json({ message: "An error occured" });
  }
}

const generateToken = (id: ObjectId, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "", {
    expiresIn: "1d",
  });
};
