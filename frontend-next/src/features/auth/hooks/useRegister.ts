"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { RegisterTypeProps } from "../auth.types";
import { registerService } from "../services/authServices";
import { getErrorMessage } from "@/lib/errors";

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (data: RegisterTypeProps) => {
    setLoading(true);
    try {
      const res = await registerService(data);
      toast.success("Registrasi berhasil, silakan cek email verifikasi");
      router.push("/login");
      return res;
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Registrasi gagal. Silakan coba lagi."),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
};
