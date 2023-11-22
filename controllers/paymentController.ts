import payments from "../models/payments";
import logger from "../helpers/logging";
import axios from "axios";
import { Request, Response } from "express";

export const makePayment = async (req: Request, res: Response) => {
  const { amount, phoneNumber } = req.body;
  const sanitizedPhoneNumber = phoneNumber.replace(/^0|^(\+254)/, "254");
  // let token = req.token;
  let token = await generateToken();
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
  const headers = {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  };
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
    CallBackURL: `${process.env.SERVER_URL}/api/payment/callback`,
    AccountReference: "Test",
    TransactionDesc: "Test",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export async function handleCallback(req: Request, res: Response) {
  try {
    console.log(req.body);

    // Save the response data to your database (all responses, regardless of success)
    const paymentResponse = new payments({
      data: req.body,
      timestamp: new Date(),
    });

    await paymentResponse.save();

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

export async function getCallbackResponse(req: Request, res: Response) {
  try {
    // const { transactionRef } = req.body;

    const response = await payments.find();

    if (!response) {
      // logger.error(`No record found for transactionRef: ${transactionRef}`);
      return res.status(404).json({ message: "No records found" });
    }
    // const success = response.ccess;
    // res.status(200).json({ success });
    res.status(200).json(response);
    //   }
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ message: "An error occurred when fetching your response" });
  }
}

const generateToken = async () => {
  try {
    const key = process.env.CONSUMER_KEY;
    const secret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const headers = {
      Authorization: "Basic" + " " + auth,
      "Content-Type": "application/json",
    };
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers,
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.log(error);
  }
};
