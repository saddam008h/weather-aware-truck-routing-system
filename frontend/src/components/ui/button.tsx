import type { ComponentProps, ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";

// All button looks live here. Pick one with `variant` and `size` instead of adding classes from outside.
const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-sm rounded-md font-medium whitespace-nowrap transition-colors outline-none disabled:cursor-default disabled:bg-background-tertiary disabled:text-text-tertiary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-xl",
  {
    variants: {
      variant: {
        primary: "bg-button-primary text-text-button-primary hover:bg-button-primary-hover",
        secondary: "border border-border-primary bg-background text-text-primary hover:bg-background-tertiary",
        tertiary: "bg-transparent text-text-secondary hover:bg-background-tertiary hover:text-text-primary",
      },
      size: {
        sm: "px-md py-xs text-xs",
        md: "px-lg py-md text-sm",
        lg: "px-xl py-lg text-md",
        icon: "p-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    /** Shown on hover and keyboard focus. Icon-only buttons should always have one. */
    tooltip?: ReactNode;
  };

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  tooltip,
  children,
  ...props
}: ButtonProps) {
  const button = (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* The label stays in place (just hidden) while loading, so the button keeps its width. */}
      <span className={cn("flex items-center gap-[inherit]", loading && "opacity-0")}>{children}</span>
      {loading && <LoaderCircle className="absolute inset-none m-auto animate-spin" />}
    </button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
