import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import NotificationModel from "../notification/notification.model.js";
import { clearTestDB, startTestDB, stopTestDB } from "../../test/db.js";
import { createTestUser, loginAgent } from "../../test/helpers.js";

const app = createApp();

beforeAll(startTestDB);
afterAll(stopTestDB);
beforeEach(clearTestDB);

describe("chat", () => {
  it("supports user messages, admin replies, and notifications", async () => {
    const user = await createTestUser("user", "chat-user@example.com");
    const userAgent = await loginAgent(app, user.email);
    const admin = await createTestUser("admin", "chat-admin@example.com");
    const adminAgent = await loginAgent(app, admin.email);

    const conversation = await userAgent.get("/api/v1/chat/conversation");
    expect(conversation.status).toBe(200);
    const conversationId = conversation.body.data.conversationId as string;

    const sent = await userAgent.post("/api/v1/chat/messages").send({
      body: "Halo admin, stok masih ada?",
    });
    expect(sent.status).toBe(201);

    const adminConversations = await adminAgent.get(
      "/api/v1/admin/chat/conversations",
    );
    expect(adminConversations.status).toBe(200);
    expect(adminConversations.body.data).toHaveLength(1);
    expect(adminConversations.body.data[0].unreadCount).toBe(1);

    const adminMessages = await adminAgent.get(
      `/api/v1/admin/chat/conversations/${conversationId}/messages`,
    );
    expect(adminMessages.status).toBe(200);
    expect(adminMessages.body.data[0].body).toBe(
      "Halo admin, stok masih ada?",
    );

    const reply = await adminAgent
      .post(`/api/v1/admin/chat/conversations/${conversationId}/messages`)
      .send({ body: "Masih ada kak" });
    expect(reply.status).toBe(201);

    const userMessages = await userAgent.get("/api/v1/chat/messages");
    expect(userMessages.status).toBe(200);
    expect(userMessages.body.data).toHaveLength(2);
    expect(userMessages.body.data[1].senderRole).toBe("admin");

    const notifications = await userAgent.get("/api/v1/notifications");
    expect(notifications.status).toBe(200);
    expect(
      notifications.body.data.some(
        (item: { type: string }) => item.type === "chat",
      ),
    ).toBe(true);
  });
});

describe("notifications", () => {
  it("tracks unread notifications and marks them read", async () => {
    const user = await createTestUser("user", "notif-user@example.com");
    const userAgent = await loginAgent(app, user.email);

    await NotificationModel.create({
      userId: user._id,
      type: "system",
      title: "Selamat datang",
      message: "Selamat bergabung di Re:Buy",
    });
    await NotificationModel.create({
      userId: user._id,
      type: "system",
      title: "Info",
      message: "Promo minggu ini",
    });

    const unread = await userAgent.get(
      "/api/v1/notifications/unread-count",
    );
    expect(unread.body.data.count).toBe(2);

    const list = await userAgent.get("/api/v1/notifications");
    expect(list.body.data).toHaveLength(2);
    const notificationId = list.body.data[0].notificationId as string;

    const markRead = await userAgent.patch(
      `/api/v1/notifications/${notificationId}/read`,
    );
    expect(markRead.status).toBe(200);

    const afterRead = await userAgent.get(
      "/api/v1/notifications/unread-count",
    );
    expect(afterRead.body.data.count).toBe(1);

    const markAll = await userAgent.patch("/api/v1/notifications/read-all");
    expect(markAll.status).toBe(200);

    const afterAll = await userAgent.get(
      "/api/v1/notifications/unread-count",
    );
    expect(afterAll.body.data.count).toBe(0);
  });
});
