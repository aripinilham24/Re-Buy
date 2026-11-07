import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../common/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URL);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error({ error }, "MongoDB connection failed");
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
};
