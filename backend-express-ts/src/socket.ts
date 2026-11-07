import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";

interface SocketUser {
  userId: string;
  role: string;
}

let io: Server | null = null;

const parseCookies = (header?: string) => {
  const cookies: Record<string, string> = {};

  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    cookies[key] = decodeURIComponent(part.slice(index + 1).trim());
  }

  return cookies;
};

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.ORIGIN.split(",").map((origin) => origin.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET,
      ) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    socket.join(`user:${user.userId}`);
    if (user.role === "admin") {
      socket.join("admins");
    }
  });

  return io;
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown,
) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToAdmins = (event: string, payload: unknown) => {
  io?.to("admins").emit(event, payload);
};

export const closeSocket = () => {
  io?.close();
  io = null;
};
