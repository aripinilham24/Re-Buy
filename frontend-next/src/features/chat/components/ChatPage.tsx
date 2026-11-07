"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import {
  useSendUserChatMessage,
  useUserChatMessages,
  useUserConversation,
} from "../hooks/useChat";

export function ChatPage() {
  const { data: conversation } = useUserConversation();
  const { data: messages, isLoading } = useUserChatMessages(
    conversation?.conversationId,
  );
  const send = useSendUserChatMessage(conversation?.conversationId);
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

  return (
    <main className="mx-auto flex h-[calc(100vh-160px)] w-full max-w-3xl flex-col px-4 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-white">Chat Admin</h1>
        <p className="text-sm text-gray-400">
          Tanyakan stok, kondisi barang, atau status pesanan.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        {isLoading ? (
          <p className="text-sm text-gray-400">Memuat pesan...</p>
        ) : !messages || messages.items.length === 0 ? (
          <p className="text-sm text-gray-400">
            Belum ada pesan. Mulai percakapan dengan admin.
          </p>
        ) : (
          messages.items.map((message) => {
            const own = message.senderRole === "user";
            return (
              <div
                key={message.messageId}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    own
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
          placeholder="Tulis pesan..."
        />
        <Button type="submit" disabled={send.isPending || !body.trim()}>
          {send.isPending ? "Mengirim..." : "Kirim"}
        </Button>
      </form>
    </main>
  );
}
