import payments from "../models/payments";
import logger from "../helpers/logging";
import axios from "axios";
import { Request, Response } from "express";

interface accessToken {
  access_token: string;
  expires_in: string;
}

export const makePayment = async (req: Request, res: Response) => {
  const { amount, phoneNumber } = req.body;
  const sanitizedPhoneNumber = phoneNumber.replace(/^0|^(\+254)/, "254");
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
    CallBackURL: `${process.env.SERVER_URL}/api/v1/payment/callback`,
    AccountReference: "Test",
    TransactionDesc: "Test",
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return;
  }
};

export async function handleCallback(req: Request, res: Response) {
  const callbackData = req.body;
  // Check the result code
  const result_code = callbackData.Body.stkCallback.ResultCode;
  if (result_code !== 0) {
    // If the result code is not 0, there was an error
    const error_message = callbackData.Body.stkCallback.ResultDesc;
    const response_data = {
      ResultCode: result_code,
      ResultDesc: error_message,
    };
    return res.json(response_data);
  }
  try {
    const paymentResponse = new payments({
      paymentDetails: req.body.Body.stkCallback,
    });

    await paymentResponse.save();
    // console.log(paymentResponse.paymentDetails);
    res.status(200).json("success");
  } catch (err) {
    console.log(err);
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

const generateToken = async (): Promise<string | undefined> => {
  try {
    const key = process.env.CONSUMER_KEY;
    const secret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const headers = {
      Authorization: "Basic " + auth,
      "Content-Type": "application/json",
    };
    const response = await axios.get<accessToken>(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers,
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.log(error);
    return;
  }
};
