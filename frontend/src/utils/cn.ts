import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default scales. Without our token names it
// can't tell that `px-4xl` should replace `px-lg`, and keeps both. Keep in sync with globals.css.
const twMerge = extendTailwindMerge({
  override: {
    theme: {
      spacing: [
        "none",
        "xxxs",
        "xxs",
        "xs",
        "sm",
        "md",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
        "7xl",
        "8xl",
        "9xl",
        "10xl",
        "11xl",
        "12xl",
      ],
      radius: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
      text: ["xxs", "xs", "sm", "md", "lg", "xl", "display-xs"],
      container: ["c-xxxs", "c-xxs", "c-xs", "c-sm", "c-md", "c-lg", "sidebar"],
      shadow: ["sm", "md", "lg"],
    },
  },
});

/** Joins class names and lets later Tailwind classes override earlier ones (`p-md` then `p-xl` -> `p-xl`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
