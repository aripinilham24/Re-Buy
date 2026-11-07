import bcrypt from "bcrypt";
import request from "supertest";
import type { Express } from "express";
import UserModel from "../features/user/user.model.js";

export const TEST_PASSWORD = "Password123!";

export const createTestUser = async (
  role: "user" | "admin" = "user",
  email = `${role}-${Date.now()}-${Math.random()}@example.com`,
) =>
  UserModel.create({
    username: `Test ${role}`,
    email,
    password: await bcrypt.hash(TEST_PASSWORD, 4),
    role,
  });

export const loginAgent = async (
  app: Express,
  email: string,
  password = TEST_PASSWORD,
) => {
  const agent = request.agent(app);
  const response = await agent
    .post("/api/v1/auth/login")
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
  }

  return agent;
};

export const createTestCategory = async (
  agent: ReturnType<typeof request.agent>,
  name = "Elektronik",
) => {
  const response = await agent
    .post("/api/v1/admin/categories")
    .send({ name });

  if (response.status !== 201) {
    throw new Error(`Category failed: ${JSON.stringify(response.body)}`);
  }

  return response.body.data as { categoryId: string; slug: string };
};

export const createTestProduct = async (
  agent: ReturnType<typeof request.agent>,
  categoryId: string,
  overrides: Record<string, unknown> = {},
) => {
  const response = await agent.post("/api/v1/admin/products").send({
    name: `Produk Uji ${Date.now()}`,
    description: "Deskripsi produk uji yang cukup panjang untuk validasi.",
    categoryId,
    condition: "good",
    price: 100_000,
    stock: 1,
    images: [{ key: `products/test-${Date.now()}.jpg`, alt: "Produk uji" }],
    status: "active",
    ...overrides,
  });

  if (response.status !== 201) {
    throw new Error(`Product failed: ${JSON.stringify(response.body)}`);
  }

  return response.body.data;
};
