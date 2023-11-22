import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      // required: [true, "Please enter an amount"],
    },
    phoneNumber: {
      type: String,
      // required: [true, "Phone number is required"],
      trim: true,
    },
    paymentDetails: {
      type: Object,
    },
  },
  { timestamps: true }
);
export default mongoose.model("farid-payments", paymentSchema);
