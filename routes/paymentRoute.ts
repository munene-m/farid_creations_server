import express from "express";
const router = express.Router();

import {
  handleCallback,
  getCallbackResponse,
  // getPayoutResponse,
  // getPayouts,
} from "../controllers/paymentController";

router.route("/callback").post(handleCallback);
router.route("/response").post(getCallbackResponse);
// router.route("/payout-response").post(getPayoutResponse);
// router.route("/:id").get(getPayouts);

export default router;
