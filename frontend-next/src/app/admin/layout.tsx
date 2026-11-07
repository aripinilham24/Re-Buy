import Link from "next/link";
import { AdminGuard } from "@/features/admin/components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin</h1>
            <p className="text-sm text-gray-400">
              Kelola katalog dan kategori Re:Buy.
            </p>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/products" className="text-green-400">
              Produk
            </Link>
            <Link href="/admin/categories" className="text-green-400">
              Kategori
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </AdminGuard>
  );
}
