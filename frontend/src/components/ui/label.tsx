import type { ComponentProps } from "react";

import { cn } from "@/utils";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-xs font-medium text-text-secondary", className)} {...props} />;
}
