import UserModel from "../models/user/user.model.js";
import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/database.js";
import { logger } from "../common/logger.js";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
  const email = env.ADMIN_EMAIL ?? "admin@rebuy.local";
  const password = env.ADMIN_PASSWORD ?? "Admin123!";
  const username = env.ADMIN_USERNAME ?? "admin";

  const existing = await UserModel.findOne({ email });
  if (existing) {
    logger.info({ email }, "Admin already exists, skipping");
    return;
  }

  await UserModel.create({
    username,
    email,
    password: await bcrypt.hash(password, env.BCRYPT_SALT),
    role: "admin",
  });

  logger.info({ email }, "Admin user seeded");
};

const run = async () => {
  await connectDB();
  await seedAdmin();
  await disconnectDB();
};

run().catch(async (error) => {
  logger.error({ error }, "Seed failed");
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
