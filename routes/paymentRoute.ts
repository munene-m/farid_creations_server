import express from "express";
const router = express.Router();
// const { protect, mpesaProtect } = require('../middleware/authMiddleware')
import {
  makePayment,
  handleCallback,
  getCallbackResponse,
} from "../controllers/paymentController";
import generateToken from "../middleware/paymentMiddleware";

router.route("/stk").post(generateToken, makePayment);
router.route("/callback").post(handleCallback);
router.route("/getPayments").get(getCallbackResponse);

export default router;
