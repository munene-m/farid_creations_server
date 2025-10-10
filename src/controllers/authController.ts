import nodemailer from "nodemailer";
import { Request, Response } from "express";
import logger from "../helpers/logging";
import { validateUserSchema, validateLoginSchema } from "../utils/validation";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { db } from "../../db"
import { ZodIssue } from "zod";
import { userTable } from "../../db/schema";
import { eq } from "drizzle-orm";
const bcryptSalt = process.env.BCRYPT_SALT;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface DecodedToken extends JwtPayload {
  userId: string; // Adjust the structure as needed based on your token
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    const validationError = validateUserSchema.safeParse({ email, password });
    const { error } = validationError;
    const errorLists = error?.issues.map((err: ZodIssue) => err.message)

    if (!validationError.success) {
      res.status(400).send({
        status: "error",
        message: "Validation failed",
        errorData: errorLists,
      })
    }

    const userExists = await db.select().from(userTable).where(eq(userTable.email, email));
    if (userExists) {
      return res.status(403).json({ message: "Forbiden. User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, Number(bcryptSalt));

    const isAdmin = email === process.env.ADMIN_EMAIL;

    const user = await db.insert(userTable).values({
      username,
      email,
      password: hashedPassword,
      role: isAdmin ? "admin" : "customer",
    }).returning();
    if(!user){
      return res.status(400).json({ message: "Failed to create user" });
    }
    res.status(201).json({
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      token: generateToken(user[0].id, user[0].role),
    });
  } catch (error) {
    logger.error("Error occurred when creating account: ", error);
    return res.status(400).json(error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginSchema.safeParse({ email, password });
    if (!validationError.success) {
      return res.status(400).json({ error: validationError.error.issues });
    }
    const user = await db.select().from(userTable).where(eq(userTable.email, email));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user[0].password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }
    res.status(200).json({
      _id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      role: user[0].role,
      token: generateToken(user[0].id, user[0].role),
    });
    logger.info(`Successful login by ${user[0].email}`);
  } catch (error) {
    res.status(400).json({ message: "An error occurred." });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await db.select().from(userTable).where(eq(userTable.id, parseInt(req.params.id)));
    if (!user) {
      return res.status(404).json({ error: "This user does not exist" });
    } else {
      res.status(200).json(user[0]);
    }
  } catch (error) {
    logger.error(`User does not exist`);
    res.status(400).json({ message: "This user does not exist" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await db.select().from(userTable);

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
  const user = await db.select().from(userTable).where(eq(userTable.email, email));

  if (!user) {
    return res.status(404).json({ error: "Email does not exist" });
  }
  const userId = user[0].id;
  const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET || "", {
    expiresIn: "1h",
  });
  user[0].passResetToken = resetToken;
  await db.update(userTable).set({ passResetToken: resetToken }).where(eq(userTable.id, user[0].id));

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Farid-creations Password Reset",
    html: `
      <p>Hi ${user[0].username},</p>
      <p>We received a request to change your password. You can click the button below to proceed with creating a new password.</p>
      <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}/" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 10px">If you ignore this email, your password will not be changed. This link expires in 1 hour.</p>      
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to send reset email" });
    }

    console.log("Email sent: " + info.response);
    res.status(200).json({ message: "Password reset email sent." });
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
    ) as DecodedToken;
    const userId = parseInt(decodedToken.userId);

    const user = await db.select().from(userTable).where(eq(userTable.passResetToken, token));
    if(!user){
      return res.status(400).json({ message: "The token is invalid" });
    }
    if(user[0].id !== userId){
      return res.status(401).json({ message: "Invalid token for this user" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(userTable).set({ password: hashedPassword, passResetToken: null }).where(eq(userTable.id, user[0].id));
  } catch (error) {
    res.status(400).json({ message: "Failed to change password for user" });
  }
  res.status(200).json({ message: "Password changed successfully." });
};

export async function deleteUser(req: Request, res: Response) {
  try {
    await db.delete(userTable).where(eq(userTable.id, parseInt(req.params.customerId)));

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("An error occured deleting user.", error);
    res.status(400).json(error);
  }
}

const generateToken = (id: number, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "", {
    expiresIn: "1d",
  });
};
