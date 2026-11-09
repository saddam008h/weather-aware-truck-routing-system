import type { HeatmapMetric, TripHeatmap } from "@/types/trips";

/** The highest value of `metric` anywhere in the corridor at `hour`, or null when nothing there has a forecast. */
export function getHeatmapPeak({
  heatmap,
  metric,
  hour,
}: {
  heatmap: TripHeatmap;
  metric: HeatmapMetric;
  hour: number;
}) {
  const frame = heatmap.frames.find((candidate) => candidate.hour === hour);
  const values = (frame?.[metric] ?? []).filter((value): value is number => value !== null);

  return values.length > 0 ? Math.max(...values) : null;
}
