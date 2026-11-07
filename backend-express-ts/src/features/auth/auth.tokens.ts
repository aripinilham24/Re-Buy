import { createHash, randomBytes } from "node:crypto";

export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createOpaqueToken = () => {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
};

export const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000);
