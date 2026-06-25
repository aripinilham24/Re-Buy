"use client";

import { useAuthStore } from "@/src/store/auth.store";
import Link from "next/link";
import Button from "@/src/components/ui/Button";

export default function Navbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="flex justify-between items-center p-5 bg-gray-800">
      <h1 className="text-2xl font-bold text-white">Re:Buy</h1>
      <div className="flex justify-center items-center gap-5">
        {user ? (
          <Button onClick={() => useAuthStore.getState().logout()}>
            Logout
          </Button>
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
