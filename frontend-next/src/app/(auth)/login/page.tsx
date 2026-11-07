import { Suspense } from "react";
import Login from "@/features/auth/components/Login";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container" />}>
      <Login />
    </Suspense>
  );
}
