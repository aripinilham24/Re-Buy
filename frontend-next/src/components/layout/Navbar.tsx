"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const { logout, loading } = useLogout();

  return (
    <nav className="flex justify-between items-center p-5 bg-gray-800">
      <Link href="/" className="text-2xl font-bold text-white">
        Re:Buy
      </Link>
      <div className="flex justify-center items-center gap-5">
        {user ? (
          <>
            <Link href="/dashboard" className="text-white">
              Dashboard
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
