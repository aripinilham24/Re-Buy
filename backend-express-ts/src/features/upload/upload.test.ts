import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { clearTestDB, startTestDB, stopTestDB } from "../../test/db.js";
import { createTestUser, loginAgent } from "../../test/helpers.js";

vi.mock("../../common/storage.js", () => ({
  createPresignedUpload: vi.fn(async (key: string, contentType: string) => ({
    uploadUrl: `http://minio.local/upload?key=${key}`,
    key,
    publicUrl: `http://minio.local/${key}`,
    expiresIn: 300,
    contentType,
  })),
}));

const app = createApp();

beforeAll(startTestDB);
afterAll(stopTestDB);
beforeEach(clearTestDB);

describe("presigned uploads", () => {
  it("returns a presigned URL for an admin", async () => {
    const admin = await createTestUser("admin", "upload-admin@example.com");
    const agent = await loginAgent(app, admin.email);

    const response = await agent.post("/api/v1/uploads/presign").send({
      filename: "foto produk.jpg",
      contentType: "image/jpeg",
      folder: "products",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.key).toMatch(/^products\//);
    expect(response.body.data.key).toMatch(/\.jpg$/);
    expect(response.body.data.uploadUrl).toContain("http://minio.local");
  });

  it("rejects non-admin uploads", async () => {
    const user = await createTestUser("user", "upload-user@example.com");
    const agent = await loginAgent(app, user.email);

    const response = await agent.post("/api/v1/uploads/presign").send({
      filename: "foto.jpg",
      contentType: "image/jpeg",
    });

    expect(response.status).toBe(403);
  });

  it("rejects unsupported content types", async () => {
    const admin = await createTestUser("admin", "upload-type@example.com");
    const agent = await loginAgent(app, admin.email);

    const response = await agent.post("/api/v1/uploads/presign").send({
      filename: "script.js",
      contentType: "application/javascript",
    });

    expect(response.status).toBe(400);
  });
});
