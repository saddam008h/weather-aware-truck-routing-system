import type { ComponentProps } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@/utils";

/**
 * The browser's own dropdown, styled to match the app. Being native, keyboard
 * use, screen readers and phone pickers all work without extra code.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative inline-flex items-center">
      <select
        className={cn(
          "cursor-pointer appearance-none rounded-md border border-border-primary bg-background py-xs pr-3xl pl-md text-xs font-medium text-text-primary outline-none transition-colors hover:bg-background-tertiary focus:border-border-brand",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-sm size-lg text-text-tertiary" />
    </span>
  );
}
