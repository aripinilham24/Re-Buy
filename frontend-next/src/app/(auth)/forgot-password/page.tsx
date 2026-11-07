import { Suspense } from "react";
import ForgotPassword from "@/features/auth/components/ForgotPassword";

export const metadata = {
  title: "Lupa Password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-container" />}>
      <ForgotPassword />
    </Suspense>
  );
}
