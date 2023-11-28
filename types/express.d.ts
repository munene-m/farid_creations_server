import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      admin: {};
      token: { token: string };
      user: {
        id: ObjectId;
      };
    }
  }
}

export {};
