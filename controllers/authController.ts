import Auth from "../models/auth";
import { Request, Response } from "express";
import logger from "../helpers/logging";
import {
  validateUserFields,
  validateLoginFields,
  validateAdminRegistration,
} from "../utils/validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

const bcryptSalt = process.env.BCRYPT_SALT;

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
    const token = generateToken(user.id, user.role);
    res.status(200).json({
      _id: user.id,
      email: user.email,
      role: user.role,
      token,
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

const generateToken = (id: ObjectId, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "", {
    expiresIn: "1d",
  });
};
