import payments from "../models/payments";
import logger from "../helpers/logging";
import axios from "axios";
import { Request, Response } from "express";

export const makePayment = async (req: Request, res: Response) => {
  const { amount, phoneNumber } = req.body;
  const sanitizedPhoneNumber = phoneNumber.replace(/^0|^(\+254)/, "254");
  let { token } = req.params;
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const shortcode = process.env.MPESA_PAYBILL;
  const passkey = process.env.MPESA_PASSKEY;

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );
  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
  const payload = {
    BusinessShortCode: 174379,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: sanitizedPhoneNumber,
    PartyB: 174379,
    PhoneNumber: sanitizedPhoneNumber,
    // CallBackURL: "https://1623-41-90-177-141.in.ngrok.io/payment/stk",
    CallBackURL:
      "https://farid-creations-server.onrender.com/api/paymentt/callback",
    AccountReference: "Test",
    TransactionDesc: "Test",
  };

  await axios
    .post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      res.status(200);
    })
    .catch((err) => {
      console.log(err);
      res.status(err.response.status).json(err.message);
    });
  const payment = await payments.create({
    amount,
    sanitizedPhoneNumber,
  });
  if (payment) {
    return res.status(200).json({
      _id: payment.id,
      phone: payment.phoneNumber,
    });
  }
};

export async function handleCallback(req: Request, res: Response) {
  try {
    // Save the response data to your database (all responses, regardless of success)
    const paymentResponse = new payments({
      data: req.body,
      timestamp: new Date(),
    });

    await paymentResponse.save();

    // logger.info(`Payment response sent - ${paymentResponse}`);
    console.log(paymentResponse);

    // Respond with the saved payment response data
    res
      .status(200)
      .json({ message: "Callback response received", paymentResponse });
  } catch (error) {
    // Handle errors and send an appropriate response
    logger.error("Error occured while handling callback: ", error);
    res
      .status(500)
      .json({ message: "An error occurred while handling callback" });
  }
}
