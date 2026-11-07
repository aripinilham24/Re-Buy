"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import {
  useAdminChatMessages,
  useAdminConversations,
  useSendAdminChatMessage,
} from "../hooks/useChat";

export function AdminChatPage() {
  const { data: conversations = [], isLoading } = useAdminConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveId = selectedId ?? conversations[0]?.conversationId;
  const { data: messages } = useAdminChatMessages(effectiveId);
  const send = useSendAdminChatMessage(effectiveId);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.items.length]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;

    try {
      await send.mutateAsync(body.trim());
      setBody("");
    } catch {
      // The mutation already surfaces a toast.
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Memuat percakapan...</p>;
  }

  if (conversations.length === 0) {
    return <EmptyState title="Belum ada percakapan" />;
  }

  return (
    <section className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.conversationId}
            type="button"
            onClick={() => setSelectedId(conversation.conversationId)}
            className={`w-full rounded-xl border p-3 text-left text-sm ${
              effectiveId === conversation.conversationId
                ? "border-green-500/50 bg-green-500/10"
                : "border-gray-800 bg-gray-900/60"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-white">
                {conversation.userName}
              </span>
              {conversation.unreadCount > 0 ? (
                <span className="rounded-full bg-red-500 px-1.5 text-xs text-white">
                  {conversation.unreadCount}
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-gray-400">
              {conversation.lastMessage ?? conversation.userEmail}
            </p>
          </button>
        ))}
      </aside>

      <div className="flex h-[calc(100vh-220px)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          {!messages || messages.items.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada pesan.</p>
          ) : (
            messages.items.map((message) => {
              const admin = message.senderRole === "admin";
              return (
                <div
                  key={message.messageId}
                  className={`flex ${admin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                      admin
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    <p>{message.body}</p>
                    <p className="mt-1 text-[10px] opacity-70">
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="mt-3 flex gap-2">
          <Input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Balas pesan..."
          />
          <Button type="submit" disabled={send.isPending || !body.trim()}>
            {send.isPending ? "Mengirim..." : "Kirim"}
          </Button>
        </form>
      </div>
    </section>
  );
}
