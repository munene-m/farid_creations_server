import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      admin: {};
      token: string;
    }
  }
}

export {};
