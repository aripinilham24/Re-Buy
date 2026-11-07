import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-700 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? (
        <p className="max-w-md text-sm text-gray-400">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
