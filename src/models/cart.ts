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

export const cartModel = mongoose.model("farid-cart", cartSchema);

export const getCart = (customerId: string) => cartModel.find({ customerId });
export const getCartItemById = (id: string) => cartModel.findById(id);
export const deleteAllItems = (customerId: string) =>
  cartModel.deleteMany({ customerId });
export const deleteItemById = (id: string) =>
  cartModel.findOneAndDelete({ _id: id });
export const findExisting = (customerId: string, productId: string) =>
  cartModel.findOne({
    customerId,
    productId,
  });
export const updateCartById = (id: string, values: Record<string, any>) =>
  cartModel.findByIdAndUpdate(id, values, { new: true });
