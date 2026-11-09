import { useMemo } from "react";

import type { ExpressionSpecification } from "maplibre-gl";
import { Layer, Source } from "react-map-gl/maplibre";

import { EMPTY_FEATURE_COLLECTION, MAP_LAYER_IDS, MAP_ROUTE_STYLE, MAP_SOURCE_IDS } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { buildRouteFeatures, getRiskColorExpression } from "@/lib/trips";
import { getCssVar } from "@/utils";

/**
 * All route options as lines. The selected route is drawn on top, wider, with a
 * white outline and colored by risk; the others are thin grey alternatives.
 */
export function MapRouteLayers() {
  const { tripPlan, selectedRoute } = useTripsContext();

  const features = useMemo(
    () => (tripPlan ? buildRouteFeatures({ routes: tripPlan.routes }) : EMPTY_FEATURE_COLLECTION),
    [tripPlan],
  );
  // Colors come from globals.css; reading them once is enough.
  const colors = useMemo(
    () => ({
      risk: getRiskColorExpression(),
      other: getCssVar({ name: "--map-route-inactive" }),
      casing: getCssVar({ name: "--map-route-casing" }),
    }),
    [],
  );

  // Selection lives in the style, not the data, so picking a route doesn't re-upload any lines.
  const isSelected: ExpressionSpecification = ["==", ["get", "routeId"], selectedRoute?.id ?? -1];

  return (
    <Source id={MAP_SOURCE_IDS.ROUTES} type="geojson" data={features}>
      <Layer
        id={MAP_LAYER_IDS.ROUTE_CASING}
        type="line"
        filter={isSelected}
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{ "line-color": colors.casing, "line-width": MAP_ROUTE_STYLE.casingWidth }}
      />
      <Layer
        id={MAP_LAYER_IDS.ROUTE_LINES}
        type="line"
        layout={{
          "line-cap": "round",
          "line-join": "round",
          // Higher sort key draws later, so the selected route ends up on top.
          "line-sort-key": ["case", isSelected, 1, 0],
        }}
        paint={{
          "line-color": ["case", isSelected, colors.risk, colors.other],
          "line-width": ["case", isSelected, MAP_ROUTE_STYLE.selectedWidth, MAP_ROUTE_STYLE.otherWidth],
          "line-opacity": ["case", isSelected, 1, MAP_ROUTE_STYLE.otherOpacity],
        }}
      />
    </Source>
  );
}
