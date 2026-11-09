import type { ComponentProps } from "react";

import { cn } from "@/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-border-primary bg-background px-lg py-md text-md text-text-primary outline-none transition-colors placeholder:text-text-placeholder focus:border-border-brand aria-invalid:border-border-danger",
        className,
      )}
      {...props}
    />
  );
}
