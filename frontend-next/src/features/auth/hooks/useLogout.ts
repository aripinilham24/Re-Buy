"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { useAuthStore } from "@/store/auth.store";
import { logoutService } from "../services/authServices";

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const mutation = useMutation({
    mutationFn: logoutService,
    onSettled: () => {
      logout();
      toast.success("Logout berhasil");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal logout"));
    },
  });

  return { logout: mutation.mutate, loading: mutation.isPending };
};
