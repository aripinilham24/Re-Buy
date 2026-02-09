import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type user from "../models/user/user.type.js";

dotenv.config();

function generateToken(user: user) {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if(!accessTokenSecret || !refreshTokenSecret) {
    throw new Error("Token secrets are not defined in environment variables");
  }
  const accessToken = jwt.sign(payload, accessTokenSecret, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "7d",
  })

  return { accessToken, refreshToken };
}

export default generateToken;
