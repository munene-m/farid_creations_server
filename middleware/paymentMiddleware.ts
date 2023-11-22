import axios from "axios";
import { Request, Response, NextFunction } from "express";

//middleware to generate token
const generateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = process.env.CONSUMER_KEY;
  const secret = process.env.CONSUMER_SECRET;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  await axios
    .get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )
    .then((response) => {
      req.token = response.data.access_token;
      next();
    })
    .catch((err) => {
      console.log(err);
      // return
      // res.status(400).json(err.message)
    });
};
export default generateToken;
