import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

/** "Avg risk 0.91" with a tooltip explaining what the number means. */
export function AverageRiskScore({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-xs text-xs text-text-secondary">
      Avg risk {score.toFixed(2)}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-text-tertiary" aria-label="What is average risk?">
            <Info className="size-lg" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-c-xxs">
          A 0–4 score: each checkpoint counts as 0 (Low), 1 (Moderate), 2 (High), 3 (Severe) or 4 (No travel), averaged
          along the route by the miles each one covers. It breaks ties after No travel, Severe and High miles.
        </TooltipContent>
      </Tooltip>
    </span>
  );
}
