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
import userProtect from "../middleware/authMiddleware";
router.route("/register").post(createUser);
router.route("/login").post(loginUser);
router.route("/register-admin").post(registerAdmin);
router.route("/login-admin").post(loginAdmin);
router.route("/:id").get(userProtect, getUser);
router.route("/").get(userProtect, getUsers);

export default router;
