"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthCard } from "@/components/layout/AuthCard";
import { getErrorMessage } from "@/lib/errors";
import { verifyEmailService } from "../services/authServices";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const started = useRef(false);

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: verifyEmailService,
  });

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    mutate(token);
  }, [token, mutate]);

  if (!token) {
    return (
      <AuthCard title="Verifikasi Email">
        <p className="mt-6 text-center text-white">
          Token verifikasi tidak ditemukan.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verifikasi Email"
      footer={<Link href="/login">Kembali ke login</Link>}
    >
      <div className="mt-6 text-center text-white">
        {isPending ? <p>Memverifikasi email...</p> : null}
        {isSuccess ? (
          <p>Email berhasil diverifikasi. Silakan login.</p>
        ) : null}
        {error ? (
          <p className="text-destructive">
            {getErrorMessage(error, "Verifikasi gagal atau tautan sudah expired")}
          </p>
        ) : null}
      </div>
    </AuthCard>
  );
}
