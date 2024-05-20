import mongoose from "mongoose";
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URL || "");
    console.log("MongoDB connected successfully");
  } catch (err: any) {
    console.log(err.message);
    process.exit(1);
  }
}
