import { Suspense } from "react";
import { ProductsPage } from "@/features/catalog/components/ProductsPage";

export const metadata = {
  title: "Katalog",
};

export default function ProductsRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Memuat katalog...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
