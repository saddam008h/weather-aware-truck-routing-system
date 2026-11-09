import type { ReactNode } from "react";

import { Label } from "@/components/ui";
import { cn } from "@/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label on top, the input in the middle, and the validation message (if any) underneath. */
export function FormField({ label, htmlFor, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-xs", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
