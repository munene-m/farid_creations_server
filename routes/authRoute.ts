import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  getUser,
  getUsers,
} from "../controllers/authController";
import userProtect from "../middleware/authMiddleware";
import adminProtect from "../middleware/adminMiddleware";
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/:customerId").get(userProtect, getUser);
router.route("/").get(adminProtect, getUsers);

export default router;
