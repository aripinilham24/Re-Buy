"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { LoginTypeProps } from "../auth.types";
import { loginService } from "../services/authServices";
import { getErrorMessage } from "@/lib/errors";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (data: LoginTypeProps) => {
    setLoading(true);
    try {
      await loginService(data);
      toast.success("Login berhasil");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Login gagal. Periksa kembali email dan password Anda.",
        ),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
