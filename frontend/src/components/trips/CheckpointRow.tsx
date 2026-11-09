import { CheckpointWeatherSummary } from "@/components/trips/CheckpointWeatherSummary";
import { RiskBadge } from "@/components/trips/RiskBadge";
import type { Checkpoint } from "@/types/trips";
import { cn, formatToLocaleNumber, formatToWeekdayTime } from "@/utils";

interface CheckpointRowProps {
  checkpoint: Checkpoint;
  isFocused: boolean;
  onSelect: () => void;
}

export function CheckpointRow({ checkpoint, isFocused, onSelect }: CheckpointRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isFocused || undefined}
        className={cn(
          "flex w-full cursor-pointer flex-col gap-xs px-lg py-md text-left transition-colors hover:bg-background-tertiary",
          isFocused && "bg-bg-brand-subtle hover:bg-bg-brand-subtle",
        )}
      >
        <span className="flex items-center justify-between gap-md">
          <span className="text-sm text-text-primary">
            <span className="font-medium">Mile {formatToLocaleNumber({ value: checkpoint.mile })}</span>
            <span className="text-text-tertiary"> · {formatToWeekdayTime({ date: checkpoint.eta })}</span>
          </span>
          <RiskBadge level={checkpoint.risk?.level} />
        </span>
        <CheckpointWeatherSummary weather={checkpoint.weather} />
      </button>
    </li>
  );
}
