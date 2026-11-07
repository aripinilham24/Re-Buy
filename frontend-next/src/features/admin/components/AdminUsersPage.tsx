"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth.store";
import {
  listAdminUsersService,
  updateAdminUserService,
} from "../services/adminServices";

export function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () =>
      listAdminUsersService({ limit: 50, q: search || undefined }),
  });

  const update = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: { isBlocked?: boolean; role?: "user" | "admin" };
    }) => updateAdminUserService(userId, data),
    onSuccess: () => {
      toast.success("User diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui user")),
  });

  const users = data?.items ?? [];

  return (
    <section className="space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearch(q.trim());
        }}
        className="flex gap-2"
      >
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Cari username atau email"
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          Cari
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="User tidak ditemukan" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {users.map((user) => {
                const isSelf = currentUser?.userId === user.userId;
                return (
                  <tr key={user.userId}>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? "Diblokir" : "Aktif"}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf || update.isPending}
                          onClick={() =>
                            update.mutate({
                              userId: user.userId,
                              data: { isBlocked: !user.isBlocked },
                            })
                          }
                        >
                          {user.isBlocked ? "Buka blokir" : "Blokir"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSelf || update.isPending}
                          onClick={() =>
                            update.mutate({
                              userId: user.userId,
                              data: {
                                role:
                                  user.role === "admin" ? "user" : "admin",
                              },
                            })
                          }
                        >
                          {user.role === "admin"
                            ? "Jadikan user"
                            : "Jadikan admin"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
