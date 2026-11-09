import type { ComponentProps } from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/utils";

// Thin wrappers around Radix Tooltip (hover + keyboard focus, positioning, a11y)
// so the rest of the app imports tooltips from one place, styled with our tokens.

/** Wraps the app once; sets how long a hover waits before a tooltip opens. */
export function TooltipProvider({
  delayDuration = 300,
  disableHoverableContent = true,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  // Our tooltips only hold text, so there's no reason to keep one open while the
  // pointer travels onto it. Without that "grace area", moving straight from one
  // trigger to its neighbour (like the parts of a risk bar) switches tooltips at once.
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
      {...props}
    />
  );
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    // Portal: rendered at the end of <body>, so map panels can't clip it.
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn("z-50 rounded-md bg-bg-tooltip px-md py-xs text-xs text-text-tooltip shadow-md", className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
