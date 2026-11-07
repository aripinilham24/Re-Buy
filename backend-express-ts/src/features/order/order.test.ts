import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import ProductModel from "../product/product.model.js";
import CouponModel from "../coupon/coupon.model.js";
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

const addressPayload = {
  label: "Rumah",
  recipientName: "Test User",
  phone: "08123456789",
  street: "Jl. Test No. 1",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40111",
  isDefault: true,
};

const setup = async (productOverrides: Record<string, unknown> = {}) => {
  const admin = await createTestUser("admin", "admin-order@example.com");
  const adminAgent = await loginAgent(app, admin.email);
  const category = await createTestCategory(adminAgent);
  const product = await createTestProduct(adminAgent, category.categoryId, {
    name: "Produk Checkout",
    price: 100_000,
    stock: 2,
    ...productOverrides,
  });

  const user = await createTestUser("user", "buyer@example.com");
  const userAgent = await loginAgent(app, user.email);
  const addressResponse = await userAgent
    .post("/api/v1/users/me/addresses")
    .send(addressPayload);

  return {
    adminAgent,
    userAgent,
    product,
    addressId: addressResponse.body.data.addressId as string,
  };
};

describe("cart and checkout", () => {
  it("validates a coupon and checks out atomically", async () => {
    const { adminAgent, userAgent, product, addressId } = await setup();

    const coupon = await adminAgent.post("/api/v1/admin/coupons").send({
      code: "DISC10",
      type: "percent",
      value: 10,
      minSpend: 0,
      perUserLimit: 1,
    });
    expect(coupon.status).toBe(201);

    const cart = await userAgent.post("/api/v1/cart/items").send({
      productId: product.productId,
      quantity: 2,
    });
    expect(cart.status).toBe(201);
    expect(cart.body.data.subtotal).toBe(200_000);

    const quote = await userAgent.get(
      "/api/v1/orders/quote?couponCode=DISC10",
    );
    expect(quote.status).toBe(200);
    expect(quote.body.data.discount).toBe(20_000);
    expect(quote.body.data.grandTotal).toBe(195_000);

    const checkout = await userAgent.post("/api/v1/orders/checkout").send({
      addressId,
      couponCode: "DISC10",
      notes: "Test order",
    });
    expect(checkout.status).toBe(201);
    expect(checkout.body.data.order.status).toBe("pending_payment");
    expect(checkout.body.data.order.grandTotal).toBe(195_000);

    const updatedProduct = await ProductModel.findById(product.productId);
    expect(updatedProduct!.stock).toBe(0);

    const updatedCoupon = await CouponModel.findOne({ code: "DISC10" });
    expect(updatedCoupon!.usedCount).toBe(1);

    const emptyCart = await userAgent.get("/api/v1/cart");
    expect(emptyCart.body.data.items).toHaveLength(0);
  });

  it("rejects checkout when stock is insufficient", async () => {
    const { adminAgent, userAgent, product, addressId } = await setup();

    await userAgent.post("/api/v1/cart/items").send({
      productId: product.productId,
      quantity: 1,
    });
    await adminAgent
      .patch(`/api/v1/admin/products/${product.productId}`)
      .send({ stock: 0 });

    const checkout = await userAgent.post("/api/v1/orders/checkout").send({
      addressId,
    });
    expect(checkout.status).toBe(409);

    const cart = await userAgent.get("/api/v1/cart");
    expect(cart.body.data.items).toHaveLength(1);
  });

  it("restores stock and coupon usage when cancelled", async () => {
    const { adminAgent, userAgent, product, addressId } = await setup();

    await adminAgent.post("/api/v1/admin/coupons").send({
      code: "SAVE10",
      type: "fixed",
      value: 10_000,
      perUserLimit: 1,
    });

    await userAgent.post("/api/v1/cart/items").send({
      productId: product.productId,
      quantity: 1,
    });

    const checkout = await userAgent.post("/api/v1/orders/checkout").send({
      addressId,
      couponCode: "SAVE10",
    });
    expect(checkout.status).toBe(201);
    const orderId = checkout.body.data.order.orderId as string;

    const cancel = await userAgent.post(
      `/api/v1/orders/${orderId}/cancel`,
    );
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.status).toBe("cancelled");

    const restoredProduct = await ProductModel.findById(product.productId);
    expect(restoredProduct!.stock).toBe(2);

    const restoredCoupon = await CouponModel.findOne({ code: "SAVE10" });
    expect(restoredCoupon!.usedCount).toBe(0);
  });

  it("enforces order ownership and status transitions", async () => {
    const { adminAgent, userAgent, product, addressId } = await setup();

    await userAgent.post("/api/v1/cart/items").send({
      productId: product.productId,
      quantity: 1,
    });
    const checkout = await userAgent.post("/api/v1/orders/checkout").send({
      addressId,
    });
    const orderId = checkout.body.data.order.orderId as string;

    const other = await createTestUser("user", "other@example.com");
    const otherAgent = await loginAgent(app, other.email);
    const forbidden = await otherAgent.get(`/api/v1/orders/${orderId}`);
    expect(forbidden.status).toBe(404);

    const invalid = await adminAgent
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .send({ status: "shipped" });
    expect(invalid.status).toBe(400);

    const paid = await adminAgent
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .send({ status: "paid" });
    expect(paid.status).toBe(200);

    const processing = await adminAgent
      .patch(`/api/v1/admin/orders/${orderId}/status`)
      .send({ status: "processing", note: "Sedang dikemas" });
    expect(processing.status).toBe(200);
    expect(processing.body.data.status).toBe("processing");
  });
});
