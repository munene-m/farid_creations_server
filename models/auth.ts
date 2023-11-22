import mongoose from "mongoose";
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
    isAdmin: {
      type: Boolean,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("farid-auth", authSchema);
