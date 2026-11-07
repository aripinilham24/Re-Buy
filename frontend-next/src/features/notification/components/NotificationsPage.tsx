"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";

export function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-white">Notifikasi</h1>
        <Button
          variant="outline"
          disabled={markAll.isPending || notifications.length === 0}
          onClick={() => markAll.mutate()}
        >
          Tandai semua dibaca
        </Button>
      </header>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : notifications.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification.notificationId}
              className={`rounded-xl border p-4 ${
                notification.isRead
                  ? "border-gray-800 bg-gray-900/40"
                  : "border-green-500/40 bg-green-500/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-300">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {notification.link ? (
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={notification.link}
                        onClick={() =>
                          markRead.mutate(notification.notificationId)
                        }
                      >
                        Buka
                      </Link>
                    </Button>
                  ) : null}
                  {!notification.isRead ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        markRead.mutate(notification.notificationId)
                      }
                    >
                      Tandai dibaca
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
