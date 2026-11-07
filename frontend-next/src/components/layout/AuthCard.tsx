import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{title}</h1>
        {children}
        {footer ? (
          <div className="mt-10 flex justify-center gap-4 text-white">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
