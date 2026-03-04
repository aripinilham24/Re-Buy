'use client';
import { useAuthStore } from "@/src/store/auth.store";

export function DashboardComponent() {
    const user = useAuthStore((s) => s.user);
    return (
        <main className="p-4 text-white w-full h-screen flex flex-col items-center justify-center">
            <h1 className="font-bold m-10 text-3xl">Dashboard</h1>
            {user ? (
                <p>Welcome back, {user.username}!</p>
            ) : (
                <p>Halo, welcome to Re:Buy</p>
            )}
        </main>
    );
}