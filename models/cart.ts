import mongoose from "mongoose";
import { Schema } from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
    },
    customerId: {
      type: Schema.Types.ObjectId,
    },
    productId: {
      type: Schema.Types.ObjectId,
      // required: true
    },
    productName: {
      type: String,
    },
    productDescription: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    price: {
      type: String,
    },
    productImage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("farid-cart", cartSchema);
