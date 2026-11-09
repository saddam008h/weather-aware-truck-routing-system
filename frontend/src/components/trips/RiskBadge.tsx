import { getRiskLevelDetails } from "@/lib/trips";
import type { RiskLevel } from "@/types/trips";
import { cn } from "@/utils";

/** Small colored pill like "● Severe". A missing level shows as "No forecast". */
export function RiskBadge({ level, className }: { level: RiskLevel | null | undefined; className?: string }) {
  const details = getRiskLevelDetails({ level });

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-xs rounded-full px-sm py-xxs text-xs font-medium",
        details.badgeClassName,
        className,
      )}
    >
      <span className={cn("size-sm rounded-full", details.fillClassName)} />
      {details.label}
    </span>
  );
}
