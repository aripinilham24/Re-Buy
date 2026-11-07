import { Suspense } from "react";
import ResetPassword from "@/features/auth/components/ResetPassword";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-container" />}>
      <ResetPassword />
    </Suspense>
  );
}
