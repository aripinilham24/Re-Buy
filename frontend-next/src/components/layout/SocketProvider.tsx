"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { getSocket } from "@/lib/socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    if (!user) {
      socket.disconnect();
      return;
    }

    socket.connect();

    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    };

    const handleChat = () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversation"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-chat-conversations"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-messages"] });
    };

    socket.on("notification:new", handleNotification);
    socket.on("chat:message", handleChat);

    return () => {
      socket.off("notification:new", handleNotification);
      socket.off("chat:message", handleChat);
      socket.disconnect();
    };
  }, [user, queryClient]);

  return <>{children}</>;
}
