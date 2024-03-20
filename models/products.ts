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
  deliveryFee: {
    type: String,
  },
  category: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
});

export const productModel = mongoose.model("farid-products", productSchema);
export const getProductById = (id: string) => productModel.findById(id);
export const getAllProducts = () => productModel.find();
export const deleteProductById = (id: string) =>
  productModel.findOneAndDelete({ _id: id });
