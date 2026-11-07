"use client";

import { useAuthStore } from "@/store/auth.store";
import { AddressManager } from "@/features/address/components/AddressManager";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h1 className="text-2xl font-bold text-white">Profil</h1>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-gray-400">Username</dt>
            <dd className="text-white">{user.username}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Email</dt>
            <dd className="text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Status email</dt>
            <dd className="text-white">
              {user.emailVerified ? "Terverifikasi" : "Belum terverifikasi"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Role</dt>
            <dd className="text-white">{user.role}</dd>
          </div>
        </dl>
      </section>

      <AddressManager />
    </main>
  );
}
