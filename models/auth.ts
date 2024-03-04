import mongoose, { ObjectId } from "mongoose";
const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: true,
    },
    passResetToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("farid-auth", authSchema);

export const getAllUsers = () => userModel.find();
export const getUserById = (id: string) => userModel.findById(id);
export const createUser = (values: Record<string, any>) =>
  new userModel(values).save().then((user) => user.toObject());
export const getUserByEmail = (email: string) => userModel.findOne({ email });
export const deleteUserByID = (id: string) =>
  userModel.findOneAndDelete({ _id: id });
