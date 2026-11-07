"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

const links = [
  { href: "/orders", label: "Pesanan", description: "Lihat status belanja" },
  {
    href: "/wishlist",
    label: "Wishlist",
    description: "Produk yang kamu simpan",
  },
  { href: "/cart", label: "Keranjang", description: "Lanjutkan checkout" },
  { href: "/chat", label: "Chat", description: "Tanya admin" },
  { href: "/profile", label: "Profil", description: "Alamat dan akun" },
];

export function DashboardComponent() {
  const user = useAuthStore((s) => s.user);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300">
          {user ? `Halo, ${user.username}!` : "Halo, welcome to Re:Buy"}
        </p>
        {user && !user.emailVerified ? (
          <p className="text-sm text-yellow-300">
            Email belum terverifikasi. Cek inbox untuk tautan verifikasi.
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 transition hover:border-green-500/50"
          >
            <p className="font-semibold text-white">{link.label}</p>
            <p className="text-sm text-gray-400">{link.description}</p>
          </Link>
        ))}

        {user?.role === "admin" ? (
          <Link
            href="/admin"
            className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 transition hover:border-green-500/60"
          >
            <p className="font-semibold text-green-300">Admin</p>
            <p className="text-sm text-green-200/70">
              Kelola produk, pesanan, dan toko
            </p>
          </Link>
        ) : null}
      </div>
    </main>
  );
}
