import mongoose, { Schema, Document, ObjectId } from "mongoose";
export interface IPayment extends Document {
  data: {
    Message: string;
    Success: boolean;
    success: boolean;
  };
  transactionRef: string;
  payoutRef: string;
  transactionType: string;
}
const paymentSchema: Schema = new Schema(
  {
    data: {
      type: Object,
    },
    transactionRef: {
      type: String,
    },
    payoutRef: {
      type: String,
    },
    transactionType: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("mobile-eat-payment", paymentSchema);
