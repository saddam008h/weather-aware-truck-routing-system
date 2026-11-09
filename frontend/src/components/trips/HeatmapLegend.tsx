import { RiskBadge } from "@/components/trips/RiskBadge";
import { HEATMAP_METRICS, RISK_LEVEL_ORDER } from "@/constants/trips";
import { getHeatmapPeak } from "@/lib/trips";
import type { HeatmapMetric, TripHeatmap } from "@/types/trips";
import { clamp, cn, formatToLocaleNumber } from "@/utils";

interface HeatmapLegendProps {
  metric: HeatmapMetric;
  heatmap: TripHeatmap;
  hour: number;
}

/**
 * Key for the heatmap that also says something about the current hour: the
 * color scale with named ticks, plus a marker at the worst value anywhere in
 * the corridor at the slider hour. While playing, the marker rides up and
 * down as storms come and go.
 */
export function HeatmapLegend({ metric, heatmap, hour }: HeatmapLegendProps) {
  const { label, unit, min, max, colorVars, ticks, peakLabel, decimals } = HEATMAP_METRICS[metric];
  const peak = getHeatmapPeak({ heatmap, metric, hour });

  // Where a value sits on the bar, 0-100%.
  const toPercent = (value: number) => clamp({ value: (value - min) / (max - min), min: 0, max: 1 }) * 100;

  // Neutral grey at the low end (the map draws nothing there), then the metric's colors.
  const gradient = [
    "var(--background-tertiary) 0%",
    ...colorVars.map((name, index) => `var(${name}) ${((index + 1) / colorVars.length) * 100}%`),
  ].join(", ");

  const peakValue = () => {
    if (peak === null) {
      return <span>No forecast</span>;
    }
    if (metric === "risk") {
      return <RiskBadge level={RISK_LEVEL_ORDER[peak]} />;
    }
    return (
      <span className="font-medium text-text-primary">
        {formatToLocaleNumber({ value: peak, maximumFractionDigits: decimals })} {unit}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-xs text-xs">
      <div className="flex items-center justify-between gap-md">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="flex items-center gap-xs text-text-secondary">
          {peakLabel}: {peakValue()}
        </span>
      </div>

      {/* Data-driven gradient and marker position, hence inline styles. Colors are still the globals.css tokens. */}
      <div className="relative h-sm rounded-full" style={{ background: `linear-gradient(to right, ${gradient})` }}>
        {peak !== null && (
          <span
            className="absolute top-1/2 size-lg -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-text-primary bg-background shadow-sm transition-[left] duration-300"
            style={{ left: `${toPercent(peak)}%` }}
          />
        )}
      </div>

      <div className="relative h-xl text-xxs text-text-tertiary" aria-hidden>
        {ticks.map((tick, index) => (
          <span
            key={tick.label}
            // First and last labels hug the ends instead of hanging off the bar.
            className={cn(
              "absolute top-none whitespace-nowrap",
              index === ticks.length - 1 ? "-translate-x-full" : index > 0 && "-translate-x-1/2",
            )}
            style={{ left: `${toPercent(tick.value)}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}
