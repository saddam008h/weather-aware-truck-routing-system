import type { ComponentProps } from "react";

import { cn } from "@/utils";

/** Grey pulsing block shown in place of content that's still loading. Size it with className. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-md bg-skeleton", className)} {...props} />;
}
