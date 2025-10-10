import express from "express";
const router = express.Router();
import userProtect from "../middleware/authMiddleware";

import {
  handleCallback,
  getCallbackResponse,
  initiatePayment,
} from "../controllers/paymentController";

router.route("/callback").post(handleCallback);
router.route("/response").post(getCallbackResponse);
router.route("/initiate-payment").post(userProtect, initiatePayment);

export default router;
