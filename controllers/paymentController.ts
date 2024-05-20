import { Request, Response } from "express";
import Payment from "../models/payments";
import logger from "../helpers/logging";
import axios from "axios";
import { customAlphabet } from "nanoid/non-secure";

const apiKey = process.env.CHPTER_PUBLIC_KEY;
export const initiatePayment = async (req: Request, res: Response) => {
  const {
    customerName,
    location,
    phoneNumber,
    email,
    total,
    products,
    callback,
  } = req.body;

  if (!customerName || !location || !phoneNumber || !email || !total) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }
  try {
    const alphabet =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const generateNanoid = customAlphabet(alphabet, 10); // Generates IDs of length 10
    const transactionRef = generateNanoid();
    const response = await axios.post(
      "https://api.chpter.co/v1/initiate/mpesa-payment",
      {
        customer_details: {
          full_name: customerName,
          location,
          phone_number: phoneNumber,
          email,
        },
        products,
        amount: {
          currency: "KES",
          total,
        },
        callback_details: {
          transaction_reference: transactionRef,
          callback_url: callback,
        },
      },
      {
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "An error occured.", error });
  }
};

export async function handleCallback(req: Request, res: Response) {
  try {
    // Save the response data to your database (all responses, regardless of success)
    const paymentResponse = new Payment({
      data: req.body,
      timestamp: new Date(),
    });

    await paymentResponse.save();

    logger.info(`Payment response sent - ${paymentResponse.data.Message}`);

    // Respond with the saved payment response data
    res
      .status(200)
      .json({ message: "Callback response received", paymentResponse });
  } catch (error) {
    // Handle errors and send an appropriate response
    logger.error("Error occured while handling callback: ", error);
    res
      .status(400)
      .json({ message: "An error occurred while handling callback" });
  }
}

export async function getCallbackResponse(req: Request, res: Response) {
  try {
    const { transactionRef } = req.body;

    const response = await Payment.findOne({
      "data.transaction_reference": transactionRef,
    });

    if (!response) {
      logger.error(`No record found for transactionRef: ${transactionRef}`);
      return res
        .status(404)
        .json({ message: "No record found for transactionRef" });
    }
    const success = response.data.Success;
    res.status(200).json({ success });
    //   }
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ message: "An error occurred when fetching your response" });
  }
}

// export async function getPayoutResponse(req: Request, res: Response) {
//   try {
//     const { payoutRef, transactionType } = req.body;

//     const response = await Payment.findOne({
//       "data.payout_reference": payoutRef,
//     });
//     if (!response) {
//       logger.error(`No record found for payoutRef: ${payoutRef}`);
//       return res.status(404).json({ message: "No record found for payoutRef" });
//     }
//     response.transactionType = transactionType;
//     await response.save();

//     const success = response.data.success;
//     res.status(200).json({ success, response: response.data });
//   } catch (error) {
//     logger.error(error);
//     res
//       .status(400)
//       .json({ message: "An error occurred when fetching your response" });
//   }
// }

// export async function getPayouts(req: Request, res: Response) {
//   const vendorId = req.params.id;
//   if (!vendorId) {
//     return res.status(400).json({ error: "Vendor id is required" });
//   }
//   try {
//     const payouts = await Payment.find({ vendorId: vendorId });
//     res.status(200).json(payouts);
//   } catch (error) {
//     return res.status(400).json({ error: "An error occured" });
//   }
// }

//
