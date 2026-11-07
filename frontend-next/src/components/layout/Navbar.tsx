"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useUnreadNotificationCount } from "@/features/notification/hooks/useNotifications";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const { logout, loading } = useLogout();
  const { data: unread } = useUnreadNotificationCount(Boolean(user));

  return (
    <nav className="flex flex-wrap justify-between items-center gap-3 p-5 bg-gray-800">
      <Link href="/" className="text-2xl font-bold text-white">
        Re:Buy
      </Link>
      <div className="flex flex-wrap justify-center items-center gap-5">
        <Link href="/products" className="text-white">
          Katalog
        </Link>

        {user ? (
          <>
            <Link href="/wishlist" className="text-white">
              Wishlist
            </Link>
            <Link href="/cart" className="text-white">
              Keranjang
            </Link>
            <Link href="/orders" className="text-white">
              Pesanan
            </Link>
            <Link href="/chat" className="text-white">
              Chat
            </Link>
            <Link href="/notifications" className="relative text-white">
              Notifikasi
              {unread && unread.count > 0 ? (
                <span className="absolute -top-2 -right-4 rounded-full bg-red-500 px-1.5 text-xs text-white">
                  {unread.count}
                </span>
              ) : null}
            </Link>
            <Link href="/profile" className="text-white">
              Profil
            </Link>
            <Button onClick={() => logout()} disabled={loading}>
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>

            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
