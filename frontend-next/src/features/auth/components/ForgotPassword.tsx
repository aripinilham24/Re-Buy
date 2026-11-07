"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@rebuy/contracts";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { getErrorMessage } from "@/lib/errors";
import { forgotPasswordService } from "../services/authServices";

export default function ForgotPassword() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: forgotPasswordService,
    onSuccess: () => {
      toast.success("Jika email terdaftar, tautan reset sudah dikirim");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal mengirim email reset"));
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await mutation.mutateAsync(data);
      form.reset();
    } catch {
      // The mutation already surfaces a toast.
    }
  });

  return (
    <AuthCard
      title="Lupa Password"
      footer={<Link href="/login">Kembali ke login</Link>}
    >
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Email"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          hint="Kami akan mengirim tautan reset jika email terdaftar."
          {...form.register("email")}
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? "Mengirim..." : "Kirim tautan reset"}
        </Button>
      </form>
    </AuthCard>
  );
}
