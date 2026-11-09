import type { ReactNode } from "react";

interface EmptyViewProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Optional button (or link) under the text, e.g. a way to fill the empty space. */
  action?: ReactNode;
}

/** Icon + short text for places that have nothing to show yet. */
export function EmptyView({ icon, title, description, action }: EmptyViewProps) {
  return (
    <div className="flex flex-col items-center gap-md rounded-lg border border-dashed border-border-primary px-xl py-4xl text-center">
      <span className="flex size-5xl items-center justify-center rounded-full bg-background-tertiary text-text-tertiary">
        {icon}
      </span>
      <div className="flex flex-col gap-xs">
        <p className="text-md font-medium text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      {action}
    </div>
  );
}
