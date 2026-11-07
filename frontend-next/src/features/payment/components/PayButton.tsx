"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import {
  createPaymentService,
  syncPaymentService,
} from "../services/paymentServices";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

const SNAP_SCRIPT_ID = "midtrans-snap-script";

const loadSnapScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.snap) {
      resolve();
      return;
    }

    const existing = document.getElementById(SNAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Snap load failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SNAP_SCRIPT_ID;
    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
    );
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Snap load failed"));
    document.body.appendChild(script);
  });

export function PayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const refreshOrder = () => {
    queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handlePay = async () => {
    if (!process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) {
      toast.error("Midtrans belum dikonfigurasi");
      return;
    }

    setLoading(true);
    try {
      const payment = await createPaymentService(orderId);
      if (!payment.snapToken) {
        throw new Error("Snap token is missing");
      }

      await loadSnapScript();
      if (!window.snap) throw new Error("Snap is not available");

      window.snap.pay(payment.snapToken, {
        onSuccess: async () => {
          try {
            await syncPaymentService(orderId);
            toast.success("Pembayaran berhasil");
          } catch (error) {
            toast.error(getErrorMessage(error, "Gagal sinkronisasi pembayaran"));
          } finally {
            refreshOrder();
          }
        },
        onPending: () => {
          toast.info("Pembayaran menunggu konfirmasi");
          refreshOrder();
        },
        onError: () => {
          toast.error("Pembayaran gagal");
          refreshOrder();
        },
        onClose: () => {
          refreshOrder();
        },
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal membuat pembayaran"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePay} disabled={loading}>
      {loading ? "Menyiapkan pembayaran..." : "Bayar sekarang"}
    </Button>
  );
}
