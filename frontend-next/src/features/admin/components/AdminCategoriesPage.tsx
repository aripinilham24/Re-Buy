"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { listAdminCategoriesService } from "@/features/category/services/categoryServices";
import {
  createAdminCategoryService,
  deleteAdminCategoryService,
} from "@/features/category/services/categoryAdminServices";

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: listAdminCategoriesService,
  });

  const create = useMutation({
    mutationFn: createAdminCategoryService,
    onSuccess: () => {
      toast.success("Kategori dibuat");
      setName("");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal membuat kategori")),
  });

  const remove = useMutation({
    mutationFn: deleteAdminCategoryService,
    onSuccess: () => {
      toast.success("Kategori dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus kategori")),
  });

  return (
    <section className="space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length >= 2) create.mutate(name.trim());
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="category-name" className="text-sm text-gray-400">
            Nama kategori
          </label>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Elektronik"
            className="w-64"
          />
        </div>
        <Button
          type="submit"
          disabled={create.isPending || name.trim().length < 2}
        >
          {create.isPending ? "Menyimpan..." : "Tambah kategori"}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : categories.length === 0 ? (
        <EmptyState title="Belum ada kategori" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {categories.map((category) => (
                <tr key={category.categoryId}>
                  <td className="px-4 py-3">{category.name}</td>
                  <td className="px-4 py-3">{category.slug}</td>
                  <td className="px-4 py-3">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Hapus kategori "${category.name}"?`,
                          )
                        ) {
                          remove.mutate(category.categoryId);
                        }
                      }}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
