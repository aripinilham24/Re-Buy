import { randomBytes } from "node:crypto";

export const generateOrderNumber = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const suffix = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `RB-${date}-${suffix}`;
};
