import { cn } from "@/utils";

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}

/** A row of mutually exclusive options (like radio buttons), e.g. 10 / 25 / 50 mi. */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex rounded-md bg-background-tertiary p-xxs", className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-sm font-medium text-text-secondary transition-colors hover:text-text-primary",
              size === "sm" ? "px-md py-xxs text-xs" : "px-md py-sm text-sm",
              isSelected && "bg-background text-text-primary shadow-sm",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
