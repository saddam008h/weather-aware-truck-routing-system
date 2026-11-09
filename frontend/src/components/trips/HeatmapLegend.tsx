import { HEATMAP_LAYER_STYLE, HEATMAP_METRICS } from "@/constants/trips";
import { getHeatmapColorStops } from "@/lib/trips";
import type { HeatmapMetric } from "@/types/trips";
import { clamp, cn } from "@/utils";

/** Color key for the map's heatmap: the metric's scale with named ticks. */
export function HeatmapLegend({ metric }: { metric: HeatmapMetric }) {
  const { label, min, max, ticks } = HEATMAP_METRICS[metric];

  // Where a value sits on the bar, 0-100%.
  const toPercent = (value: number) => clamp({ value: (value - min) / (max - min), min: 0, max: 1 }) * 100;

  // Neutral grey at the low end (the map draws nothing there), then the same color stops the map uses.
  const gradient = [
    "var(--background-tertiary) 0%",
    ...getHeatmapColorStops({ metric }).map(({ position, cssVar }) => `var(${cssVar}) ${position * 100}%`),
  ].join(", ");

  return (
    <div className="flex flex-col gap-xs text-xs">
      <span className="font-medium text-text-primary">{label}</span>

      {/* Data-driven gradient, hence the inline style. Its colors are still the globals.css tokens, drawn at
          the map layer's opacity so the bar looks like the heatmap over the map. */}
      <div
        className="h-sm rounded-full"
        style={{ background: `linear-gradient(to right, ${gradient})`, opacity: HEATMAP_LAYER_STYLE.opacity }}
      />

      <div className="relative h-xl text-xxs text-text-tertiary">
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
