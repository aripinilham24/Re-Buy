"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerSchema, type RegisterInput } from "@rebuy/contracts";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useRegister } from "../hooks/useRegister";

const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function Register() {
  const { register, loading } = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload: RegisterInput = {
      username: values.username,
      email: values.email,
      password: values.password,
    };

    try {
      await register(payload);
    } catch {
      // The mutation already surfaces a toast.
    }
  });

  return (
    <AuthCard
      title="Register ReBuy"
      footer={<Link href="/login">Sudah punya akun</Link>}
    >
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Username"
          type="text"
          autoComplete="username"
          error={form.formState.errors.username?.message}
          {...form.register("username")}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Register"}
        </Button>
      </form>
    </AuthCard>
  );
}
