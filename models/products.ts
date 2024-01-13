import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  deliveryFee: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
});

export default mongoose.model("farid-products", productSchema);
