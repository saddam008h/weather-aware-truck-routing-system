import { Select } from "@/components/ui";
import { HEATMAP_FACTOR_OPTIONS, HEATMAP_OVERALL_OPTION } from "@/constants/trips";
import { useTripForecastContext } from "@/contexts/tripsContext";
import type { HeatmapMetric } from "@/types/trips";

/**
 * Picks what the heatmap shows. Overall risk comes first as the main view; the
 * single weather factors sit in their own group below it, since overall risk
 * is already made from them.
 */
export function HeatmapMetricSelect() {
  const { heatmapMetric, setHeatmapMetric } = useTripForecastContext();

  return (
    <label className="flex items-center gap-sm text-xs text-text-secondary">
      Heatmap
      <Select
        value={heatmapMetric}
        // The options below only carry HeatmapMetric values.
        onChange={(event) => setHeatmapMetric(event.target.value as HeatmapMetric)}
      >
        <option value={HEATMAP_OVERALL_OPTION.value}>{HEATMAP_OVERALL_OPTION.label}</option>
        <optgroup label="Single factor">
          {HEATMAP_FACTOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      </Select>
    </label>
  );
}
