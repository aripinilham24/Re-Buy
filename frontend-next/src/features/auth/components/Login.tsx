"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@rebuy/contracts";
import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useLogin } from "../hooks/useLogin";

export default function Login() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/dashboard";
  const { login, loading } = useLogin(redirectTo);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await login(data);
    } catch {
      // The mutation already surfaces a toast.
    }
  });

  return (
    <AuthCard
      title="Login Re:Buy"
      footer={
        <>
          <Link href="/register">Belum punya akun</Link>
          <Link href="/forgot-password">Lupa password</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Email"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="password"
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthCard>
  );
}
