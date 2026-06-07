import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  try {
    const mongoUri = env.mongoUri?.trim();

    if (!mongoUri) {
      throw new Error("MONGO_URI is not configured");
    }

    if (
      mongoUri.startsWith("<") ||
      !/^mongodb(\+srv)?:\/\//.test(mongoUri)
    ) {
      throw new Error(
        "MONGO_URI must start with mongodb:// or mongodb+srv://"
      );
    }

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
