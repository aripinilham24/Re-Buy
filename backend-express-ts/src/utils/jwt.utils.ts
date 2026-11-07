import jwt from "jsonwebtoken";
import type { UserDocument } from "../features/user/user.model.js";
import { env } from "../config/env.js";

export function generateToken(user: UserDocument) {
  const payload = {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role ?? "user",
  };

  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
}

export default generateToken;
