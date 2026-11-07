"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RegisterInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import { registerService } from "../services/authServices";

export const useRegister = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: RegisterInput) => registerService(data),
    onSuccess: () => {
      toast.success("Registrasi berhasil, silakan cek email verifikasi");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Registrasi gagal. Silakan coba lagi."),
      );
    },
  });

  return { register: mutation.mutateAsync, loading: mutation.isPending };
};
