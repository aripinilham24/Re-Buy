import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import UserModel from "../user/user.model.js";
import AuthTokenModel from "./auth-token.model.js";
import { hashToken, hoursFromNow } from "./auth.tokens.js";
import { clearTestDB, startTestDB, stopTestDB } from "../../test/db.js";

const app = createApp();

const password = "Password123!";

const createUser = async (email: string) =>
  UserModel.create({
    username: "Test User",
    email,
    password: await bcrypt.hash(password, 4),
  });

beforeAll(startTestDB);
afterAll(stopTestDB);
beforeEach(clearTestDB);

describe("auth registration", () => {
  it("registers a user and creates a verification token", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      username: "Test User",
      email: "register@example.com",
      password,
    });

    expect(response.status).toBe(201);

    const user = await UserModel.findOne({ email: "register@example.com" });
    expect(user).toBeTruthy();
    expect(user!.emailVerifiedAt).toBeNull();

    const token = await AuthTokenModel.findOne({
      userId: user!._id,
      type: "verify_email",
    });
    expect(token).toBeTruthy();
  });

  it("rejects a duplicate email", async () => {
    await createUser("duplicate@example.com");

    const response = await request(app).post("/api/v1/auth/register").send({
      username: "Another User",
      email: "duplicate@example.com",
      password,
    });

    expect(response.status).toBe(409);
  });

  it("verifies an email exactly once", async () => {
    const user = await createUser("verify@example.com");
    const rawToken = "a".repeat(32);

    await AuthTokenModel.create({
      userId: user._id,
      type: "verify_email",
      tokenHash: hashToken(rawToken),
      expiresAt: hoursFromNow(1),
    });

    const first = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: rawToken });
    expect(first.status).toBe(200);

    const updated = await UserModel.findById(user._id);
    expect(updated!.emailVerifiedAt).toBeInstanceOf(Date);

    const second = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: rawToken });
    expect(second.status).toBe(400);
  });
});

describe("auth session", () => {
  it("logs in, reads the session, and rotates refresh tokens", async () => {
    await createUser("session@example.com");
    const agent = request.agent(app);

    const login = await agent.post("/api/v1/auth/login").send({
      email: "session@example.com",
      password,
    });

    expect(login.status).toBe(200);
    expect(login.body.data.user.email).toBe("session@example.com");

    const cookies = login.headers["set-cookie"] as unknown as string[];
    expect(cookies.join(";")).toContain("token=");
    expect(cookies.join(";")).toContain("refreshToken=");

    const me = await agent.get("/api/v1/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe("session@example.com");

    const refreshCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken="),
    );
    expect(refreshCookie).toBeTruthy();

    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie!);
    expect(refreshed.status).toBe(200);

    const reused = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie!);
    expect(reused.status).toBe(401);
  });

  it("rejects blocked users and invalid passwords", async () => {
    const user = await createUser("blocked@example.com");
    await UserModel.findByIdAndUpdate(user._id, { isBlocked: true });

    const blocked = await request(app).post("/api/v1/auth/login").send({
      email: "blocked@example.com",
      password,
    });
    expect(blocked.status).toBe(403);

    const invalid = await request(app).post("/api/v1/auth/login").send({
      email: "blocked@example.com",
      password: "wrong-password",
    });
    expect(invalid.status).toBe(401);
  });
});

describe("password recovery", () => {
  it("resets a password and rejects the old one", async () => {
    const user = await createUser("reset@example.com");
    const rawToken = "b".repeat(32);

    await AuthTokenModel.create({
      userId: user._id,
      type: "reset_password",
      tokenHash: hashToken(rawToken),
      expiresAt: hoursFromNow(1),
    });

    const reset = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: rawToken, password: "NewPassword123!" });
    expect(reset.status).toBe(200);

    const oldLogin = await request(app).post("/api/v1/auth/login").send({
      email: "reset@example.com",
      password,
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/v1/auth/login").send({
      email: "reset@example.com",
      password: "NewPassword123!",
    });
    expect(newLogin.status).toBe(200);
  });

  it("changes password for the logged-in user", async () => {
    await createUser("change@example.com");
    const agent = request.agent(app);

    await agent
      .post("/api/v1/auth/login")
      .send({ email: "change@example.com", password })
      .expect(200);

    const change = await agent
      .patch("/api/v1/auth/password")
      .send({ currentPassword: password, newPassword: "NewPassword123!" });
    expect(change.status).toBe(200);

    const oldLogin = await request(app).post("/api/v1/auth/login").send({
      email: "change@example.com",
      password,
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/v1/auth/login").send({
      email: "change@example.com",
      password: "NewPassword123!",
    });
    expect(newLogin.status).toBe(200);
  });
});
