import type { ComponentProps } from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/utils";

/** Radix slider (keyboard + touch support built in), styled with our tokens. Single thumb. */
export function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none items-center py-sm select-none", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-xs grow overflow-hidden rounded-full bg-background-tertiary">
        <SliderPrimitive.Range className="absolute h-full bg-button-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block size-xl cursor-grab rounded-full border-2 border-button-primary bg-background shadow-md active:cursor-grabbing"
        aria-label={props["aria-label"]}
      />
    </SliderPrimitive.Root>
  );
}
