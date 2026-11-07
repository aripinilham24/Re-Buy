import { createHash } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import PaymentModel from "./payment.model.js";
import ProductModel from "../product/product.model.js";
import { clearTestDB, startTestDB, stopTestDB } from "../../test/db.js";
import {
  createTestCategory,
  createTestProduct,
  createTestUser,
  loginAgent,
} from "../../test/helpers.js";

const app = createApp();
const serverKey = process.env.MIDTRANS_SERVER_KEY!;

beforeAll(startTestDB);
afterAll(stopTestDB);
beforeEach(clearTestDB);

const setupOrder = async () => {
  const admin = await createTestUser("admin", "pay-admin@example.com");
  const adminAgent = await loginAgent(app, admin.email);
  const category = await createTestCategory(adminAgent);
  const product = await createTestProduct(adminAgent, category.categoryId, {
    name: "Produk Bayar",
    price: 150_000,
    stock: 2,
  });

  const user = await createTestUser("user", "pay-buyer@example.com");
  const userAgent = await loginAgent(app, user.email);
  const address = await userAgent.post("/api/v1/users/me/addresses").send({
    label: "Rumah",
    recipientName: "Buyer",
    phone: "08123456789",
    street: "Jl. Bayar No. 1",
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
  const order = checkout.body.data.order;

  const payment = await PaymentModel.create({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    userId: user._id,
    status: "pending",
    grossAmount: order.grandTotal,
  });

  return { userAgent, product, order, payment };
};

const signatureFor = (orderNumber: string, grossAmount: string) =>
  createHash("sha512")
    .update(`${orderNumber}200${grossAmount}${serverKey}`)
    .digest("hex");

describe("midtrans notification", () => {
  it("marks the order paid and is idempotent", async () => {
    const { order } = await setupOrder();
    const grossAmount = `${order.grandTotal}.00`;
    const payload = {
      order_id: order.orderNumber,
      status_code: "200",
      gross_amount: grossAmount,
      signature_key: signatureFor(order.orderNumber, grossAmount),
      transaction_status: "settlement",
      transaction_id: "tx-paid-1",
    };

    const first = await request(app)
      .post("/api/v1/payments/midtrans/notification")
      .send(payload);
    expect(first.status).toBe(200);

    const payment = await PaymentModel.findOne({
      orderNumber: order.orderNumber,
    });
    expect(payment!.status).toBe("paid");
    expect(payment!.paidAt).toBeInstanceOf(Date);

    const second = await request(app)
      .post("/api/v1/payments/midtrans/notification")
      .send(payload);
    expect(second.status).toBe(200);
  });

  it("rejects invalid signatures and mismatched amounts", async () => {
    const { order } = await setupOrder();

    const invalid = await request(app)
      .post("/api/v1/payments/midtrans/notification")
      .send({
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: `${order.grandTotal}.00`,
        signature_key: "invalid",
        transaction_status: "settlement",
      });
    expect(invalid.status).toBe(400);

    const grossAmount = `${order.grandTotal + 1}.00`;
    const mismatch = await request(app)
      .post("/api/v1/payments/midtrans/notification")
      .send({
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: grossAmount,
        signature_key: signatureFor(order.orderNumber, grossAmount),
        transaction_status: "settlement",
      });
    expect(mismatch.status).toBe(400);
  });

  it("restores stock when payment expires", async () => {
    const { order, product } = await setupOrder();
    const grossAmount = `${order.grandTotal}.00`;

    const response = await request(app)
      .post("/api/v1/payments/midtrans/notification")
      .send({
        order_id: order.orderNumber,
        status_code: "200",
        gross_amount: grossAmount,
        signature_key: signatureFor(order.orderNumber, grossAmount),
        transaction_status: "expire",
      });
    expect(response.status).toBe(200);

    const restored = await ProductModel.findById(product.productId);
    expect(restored!.stock).toBe(2);
  });
});

describe("create payment", () => {
  it("creates a Snap transaction for the order owner", async () => {
    const { userAgent, order } = await setupOrder();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "snap-token-123",
        redirect_url: "https://snap.example/redirect",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      const response = await userAgent.post(
        `/api/v1/payments/${order.orderId}`,
      );
      expect(response.status).toBe(201);
      expect(response.body.data.snapToken).toBe("snap-token-123");
      expect(response.body.data.redirectUrl).toBe(
        "https://snap.example/redirect",
      );
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
