import axios from "axios";
import { Request, Response, NextFunction } from "express";

//middleware to generate token
const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    console.log(response.data);
    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default generateToken;
