import dotenv from "dotenv";

export const envConfig = dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});
