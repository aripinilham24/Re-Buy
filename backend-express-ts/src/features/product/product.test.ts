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

const setupAdmin = async () => {
  const admin = await createTestUser("admin", "admin@example.com");
  const agent = await loginAgent(app, admin.email);
  const category = await createTestCategory(agent);
  return { agent, category };
};

describe("catalog admin", () => {
  it("creates a product and exposes it publicly", async () => {
    const { agent, category } = await setupAdmin();
    const product = await createTestProduct(agent, category.categoryId);

    expect(product.status).toBe("active");

    const detail = await request(app).get(`/api/v1/products/${product.slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.productId).toBe(product.productId);

    const list = await request(app).get("/api/v1/products");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
  });

  it("hides draft products from the public list", async () => {
    const { agent, category } = await setupAdmin();
    await createTestProduct(agent, category.categoryId, {
      name: "Draft Product",
      status: "draft",
    });
    await createTestProduct(agent, category.categoryId, {
      name: "Active Product",
      status: "active",
    });

    const publicList = await request(app).get("/api/v1/products");
    expect(publicList.body.data).toHaveLength(1);
    expect(publicList.body.data[0].name).toBe("Active Product");

    const adminList = await agent.get("/api/v1/admin/products");
    expect(adminList.status).toBe(200);
    expect(adminList.body.data).toHaveLength(2);
  });

  it("filters, searches, sorts, and paginates", async () => {
    const { agent, category } = await setupAdmin();
    await createTestProduct(agent, category.categoryId, {
      name: "Laptop Lama",
      price: 3_000_000,
    });
    await createTestProduct(agent, category.categoryId, {
      name: "Mouse Bekas",
      price: 100_000,
      condition: "fair",
    });
    await createTestProduct(agent, category.categoryId, {
      name: "Monitor Bagus",
      price: 1_500_000,
      condition: "like_new",
    });

    const firstPage = await request(app).get("/api/v1/products?limit=2");
    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data).toHaveLength(2);
    expect(firstPage.body.meta.hasMore).toBe(true);
    expect(firstPage.body.meta.nextCursor).toBeTruthy();

    const secondPage = await request(app).get(
      `/api/v1/products?limit=2&cursor=${firstPage.body.meta.nextCursor}`,
    );
    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data).toHaveLength(1);

    const search = await request(app).get("/api/v1/products?q=mouse");
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].name).toBe("Mouse Bekas");

    const filtered = await request(app).get(
      `/api/v1/products?condition=fair&maxPrice=200000`,
    );
    expect(filtered.body.data).toHaveLength(1);

    const sorted = await request(app).get(
      "/api/v1/products?sort=price_asc",
    );
    expect(sorted.body.data.map((item: { price: number }) => item.price)).toEqual(
      [100_000, 1_500_000, 3_000_000],
    );
  });

  it("forbids non-admin product creation", async () => {
    const user = await createTestUser("user", "user@example.com");
    const agent = await loginAgent(app, user.email);

    const response = await agent.post("/api/v1/admin/products").send({
      name: "Nope",
      description: "This should not be allowed to be created.",
      categoryId: "000000000000000000000000",
      condition: "good",
      price: 1000,
      stock: 1,
      images: [{ key: "products/nope.jpg" }],
      status: "active",
    });

    expect(response.status).toBe(403);
  });

  it("blocks deleting a category that still has products", async () => {
    const { agent, category } = await setupAdmin();
    await createTestProduct(agent, category.categoryId);

    const response = await agent.delete(
      `/api/v1/admin/categories/${category.categoryId}`,
    );
    expect(response.status).toBe(409);
  });
});

describe("wishlist", () => {
  it("adds, lists, and removes a product", async () => {
    const { agent: admin, category } = await setupAdmin();
    const product = await createTestProduct(admin, category.categoryId);

    const user = await createTestUser("user", "wishlist@example.com");
    const agent = await loginAgent(app, user.email);

    const added = await agent.post(`/api/v1/wishlist/${product.productId}`);
    expect(added.status).toBe(201);

    const list = await agent.get("/api/v1/wishlist");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].product.productId).toBe(product.productId);

    const duplicate = await agent.post(`/api/v1/wishlist/${product.productId}`);
    expect(duplicate.status).toBe(201);
    expect((await agent.get("/api/v1/wishlist")).body.data).toHaveLength(1);

    const removed = await agent.delete(
      `/api/v1/wishlist/${product.productId}`,
    );
    expect(removed.status).toBe(200);
    expect((await agent.get("/api/v1/wishlist")).body.data).toHaveLength(0);
  });
});
