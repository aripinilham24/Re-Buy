import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? window.location.origin,
      {
        withCredentials: true,
        autoConnect: false,
        transports: ["websocket", "polling"],
      },
    );
  }

  return socket;
};
