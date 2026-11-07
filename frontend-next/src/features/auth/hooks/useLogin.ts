"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LoginInput } from "@rebuy/contracts";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/lib/errors";
import { loginService } from "../services/authServices";

export const useLogin = (redirectTo = "/dashboard") => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: (data: LoginInput) => loginService(data),
    onSuccess: ({ user }) => {
      setUser(user);
      toast.success("Login berhasil");
      router.push(redirectTo);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(
          error,
          "Login gagal. Periksa kembali email dan password Anda.",
        ),
      );
    },
  });

  return { login: mutation.mutateAsync, loading: mutation.isPending };
};
