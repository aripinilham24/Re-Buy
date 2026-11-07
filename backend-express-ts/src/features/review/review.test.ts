import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { clearTestDB, startTestDB, stopTestDB } from "../../test/db.js";
import {
  createTestCategory,
  createTestProduct,
  createTestUser,
  loginAgent,
} from "../../test/helpers.js";

const app = createApp();

beforeAll(startTestDB);
afterAll(stopTestDB);
beforeEach(clearTestDB);

const setupCompletedOrder = async () => {
  const admin = await createTestUser("admin", "review-admin@example.com");
  const adminAgent = await loginAgent(app, admin.email);
  const category = await createTestCategory(adminAgent);
  const product = await createTestProduct(adminAgent, category.categoryId, {
    name: "Produk Review",
    price: 100_000,
    stock: 1,
  });

  const user = await createTestUser("user", "review-buyer@example.com");
  const userAgent = await loginAgent(app, user.email);
  const address = await userAgent.post("/api/v1/users/me/addresses").send({
    label: "Rumah",
    recipientName: "Reviewer",
    phone: "08123456789",
    street: "Jl. Review No. 1",
    city: "Bandung",
    province: "Jawa Barat",
    postalCode: "40111",
    isDefault: true,
  });

  await userAgent.post("/api/v1/cart/items").send({
    productId: product.productId,
    quantity: 1,
  });

  const checkout = await userAgent.post("/api/v1/orders/checkout").send({
    addressId: address.body.data.addressId,
  });
  const orderId = checkout.body.data.order.orderId as string;

  for (const status of [
    "paid",
    "processing",
    "shipped",
    "delivered",
    "completed",
  ]) {
    const response = await adminAgent
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .send({ status });
    expect(response.status).toBe(200);
  }

  return { userAgent, adminAgent, product, orderId };
};

describe("reviews", () => {
  it("creates a review after a completed order and updates product rating", async () => {
    const { userAgent, product, orderId } = await setupCompletedOrder();

    const eligibility = await userAgent.get(
      `/api/v1/reviews/eligibility/${product.productId}`,
    );
    expect(eligibility.status).toBe(200);
    expect(eligibility.body.data.canReview).toBe(true);
    expect(eligibility.body.data.orderId).toBe(orderId);

    const review = await userAgent.post("/api/v1/reviews").send({
      orderId,
      productId: product.productId,
      rating: 5,
      comment: "Barang sesuai deskripsi",
    });
    expect(review.status).toBe(201);
    expect(review.body.data.rating).toBe(5);

    const productResponse = await request(app).get(
      `/api/v1/products/${product.slug}`,
    );
    expect(productResponse.body.data.ratingAvg).toBe(5);
    expect(productResponse.body.data.ratingCount).toBe(1);

    const duplicate = await userAgent.post("/api/v1/reviews").send({
      orderId,
      productId: product.productId,
      rating: 4,
      comment: "Review kedua",
    });
    expect(duplicate.status).toBe(409);
  });

  it("prevents reviews before completion and from other users", async () => {
    const { userAgent, product, orderId } = await setupCompletedOrder();

    const other = await createTestUser("user", "review-other@example.com");
    const otherAgent = await loginAgent(app, other.email);
    const eligibility = await otherAgent.get(
      `/api/v1/reviews/eligibility/${product.productId}`,
    );
    expect(eligibility.body.data.canReview).toBe(false);

    const forbidden = await otherAgent.post("/api/v1/reviews").send({
      orderId,
      productId: product.productId,
      rating: 5,
      comment: "Bukan pesanan saya",
    });
    expect(forbidden.status).toBe(404);

    void userAgent;
  });
});
