"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../hooks/useAddresses";
import { AddressForm } from "./AddressForm";

export function AddressManager() {
  const [showForm, setShowForm] = useState(false);
  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Alamat</h2>
        <Button variant="outline" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Tutup form" : "Tambah alamat"}
        </Button>
      </div>

      {showForm ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <AddressForm
            loading={createAddress.isPending}
            onCancel={() => setShowForm(false)}
            onSubmit={async (data) => {
              await createAddress.mutateAsync(data);
              setShowForm(false);
            }}
          />
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat alamat...</p>
      ) : addresses.length === 0 ? (
        <EmptyState
          title="Belum ada alamat"
          description="Tambahkan alamat pengiriman untuk checkout."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.addressId}
              className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  {address.label}
                </span>
                {address.isDefault ? (
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300">
                    Utama
                  </span>
                ) : null}
              </div>
              <p className="text-gray-200">{address.recipientName}</p>
              <p className="text-gray-400">{address.phone}</p>
              <p className="text-gray-400">
                {address.street}, {address.city}, {address.province},{" "}
                {address.postalCode}
              </p>
              {address.notes ? (
                <p className="text-gray-500">{address.notes}</p>
              ) : null}

              <div className="flex gap-2 pt-2">
                {!address.isDefault ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={setDefaultAddress.isPending}
                    onClick={() =>
                      setDefaultAddress.mutate(address.addressId)
                    }
                  >
                    Jadikan utama
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteAddress.isPending}
                  onClick={() => {
                    if (window.confirm(`Hapus alamat "${address.label}"?`)) {
                      deleteAddress.mutate(address.addressId);
                    }
                  }}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
