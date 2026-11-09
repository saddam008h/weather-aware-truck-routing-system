import { useMemo } from "react";

import { Layer, Source } from "react-map-gl/maplibre";

import { EMPTY_FEATURE_COLLECTION, HEATMAP_LAYER_STYLE, MAP_LAYER_IDS, MAP_SOURCE_IDS } from "@/constants/trips";
import { useTripForecastContext, useTripsContext } from "@/contexts/tripsContext";
import { buildHeatmapFeatures, getHeatmapColorRamp, getHeatmapHourProperty, getHeatmapRadius } from "@/lib/trips";

/**
 * Weather heatmap along the trip corridor. The data (all 49 hours) only changes
 * with a new trip or metric; the slider just points the layer at another hour's property.
 */
export function MapHeatmapLayer() {
  const { tripHeatmap } = useTripsContext();
  const { forecastHour, heatmapMetric } = useTripForecastContext();

  const features = useMemo(
    () =>
      tripHeatmap ? buildHeatmapFeatures({ heatmap: tripHeatmap, metric: heatmapMetric }) : EMPTY_FEATURE_COLLECTION,
    [tripHeatmap, heatmapMetric],
  );
  const radius = useMemo(() => getHeatmapRadius({ points: tripHeatmap?.points ?? [] }), [tripHeatmap]);
  const colorRamp = useMemo(() => getHeatmapColorRamp({ metric: heatmapMetric }), [heatmapMetric]);

  // The source is always mounted (empty before a trip) so the layer keeps its place under the routes.
  return (
    <Source id={MAP_SOURCE_IDS.HEATMAP} type="geojson" data={features}>
      <Layer
        id={MAP_LAYER_IDS.HEATMAP}
        type="heatmap"
        maxzoom={HEATMAP_LAYER_STYLE.maxZoom}
        paint={{
          "heatmap-weight": ["coalesce", ["get", getHeatmapHourProperty({ hour: forecastHour })], 0],
          "heatmap-radius": radius,
          "heatmap-intensity": HEATMAP_LAYER_STYLE.intensity,
          "heatmap-color": colorRamp,
          "heatmap-opacity": HEATMAP_LAYER_STYLE.opacity,
        }}
      />
    </Source>
  );
}
