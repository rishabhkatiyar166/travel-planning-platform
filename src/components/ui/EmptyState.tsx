import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

function EmptyState({
  icon = "✨",
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`text-center ${
        compact
          ? "rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7"
          : "rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 shadow-sm"
      }`}
      role="status"
    >
      <div
        className={`mx-auto flex items-center justify-center rounded-full bg-slate-100 ${
          compact ? "h-12 w-12 text-lg" : "h-14 w-14 text-xl"
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3
        className={`${
          compact ? "mt-4 text-base" : "mt-5 text-xl"
        } font-bold text-slate-900`}
      >
        {title}
      </h3>

      <p
        className={`${
          compact ? "mt-2 text-xs" : "mt-2 text-sm"
        } mx-auto max-w-lg leading-6 text-slate-500`}
      >
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
