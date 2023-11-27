import express from "express";
const router = express.Router();
import {
  createUser,
  loginUser,
  registerAdmin,
  loginAdmin,
  getUser,
  getUsers,
} from "../controllers/authController";
router.route("/register").post(createUser);
router.route("/login").post(loginUser);
router.route("/register-admin").post(registerAdmin);
router.route("/login-admin").post(loginAdmin);
router.route("/:id").get(getUser);
router.route("/").get(getUsers);

export default router;
