"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@rebuy/contracts";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { getErrorMessage } from "@/lib/errors";
import { resetPasswordService } from "../services/authServices";

const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetFormSchema>;

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (password: string) =>
      resetPasswordService({ token: token ?? "", password }),
    onSuccess: () => {
      toast.success("Password berhasil direset, silakan login");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal mereset password"));
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data.password);
    } catch {
      // The mutation already surfaces a toast.
    }
  });

  if (!token) {
    return (
      <AuthCard
        title="Reset Password"
        footer={<Link href="/forgot-password">Minta tautan baru</Link>}
      >
        <p className="mt-6 text-center text-white">
          Token reset tidak ditemukan. Silakan minta tautan baru.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      footer={<Link href="/login">Kembali ke login</Link>}
    >
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Password baru"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <FormField
          label="Konfirmasi password"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? "Menyimpan..." : "Simpan password"}
        </Button>
      </form>
    </AuthCard>
  );
}
