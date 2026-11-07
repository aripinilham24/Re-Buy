import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import type { UserDocument } from "../user/user.model.js";
import { env } from "../../config/env.js";
import * as authRepository from "./auth.repository.js";

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createOpaqueToken = () => {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
};

export const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);

export const issueTokens = async (user: UserDocument) => {
  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role ?? "user",
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );

  const { raw: refreshToken, hash } = createOpaqueToken();
  await authRepository.createAuthToken({
    userId: user._id,
    type: "refresh",
    tokenHash: hash,
    expiresAt: hoursFromNow(7 * 24),
  });

  return { accessToken, refreshToken };
};
