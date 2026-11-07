import { Suspense } from "react";
import VerifyEmail from "@/features/auth/components/VerifyEmail";

export const metadata = {
  title: "Verifikasi Email",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-container" />}>
      <VerifyEmail />
    </Suspense>
  );
}
