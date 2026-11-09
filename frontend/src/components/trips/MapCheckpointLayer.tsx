import { useMemo } from "react";

import type { ExpressionSpecification } from "maplibre-gl";
import { Layer, Source } from "react-map-gl/maplibre";

import { EMPTY_FEATURE_COLLECTION, MAP_LAYER_IDS, MAP_ROUTE_STYLE, MAP_SOURCE_IDS } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { buildCheckpointFeatures, getRiskColorExpression } from "@/lib/trips";
import { getCssVar } from "@/utils";

/** A dot per checkpoint on every route, colored by risk. The selected route's dots are bigger and on top. */
export function MapCheckpointLayer() {
  const { tripPlan, selectedRoute } = useTripsContext();

  const features = useMemo(
    () => (tripPlan ? buildCheckpointFeatures({ routes: tripPlan.routes }) : EMPTY_FEATURE_COLLECTION),
    [tripPlan],
  );
  const colors = useMemo(
    () => ({ risk: getRiskColorExpression(), stroke: getCssVar({ name: "--map-checkpoint-stroke" }) }),
    [],
  );

  const isSelected: ExpressionSpecification = ["==", ["get", "routeId"], selectedRoute?.id ?? -1];
  const otherOpacity = MAP_ROUTE_STYLE.otherCheckpointOpacity;

  return (
    <Source id={MAP_SOURCE_IDS.CHECKPOINTS} type="geojson" data={features}>
      <Layer
        id={MAP_LAYER_IDS.CHECKPOINTS}
        type="circle"
        layout={{ "circle-sort-key": ["case", isSelected, 1, 0] }}
        paint={{
          "circle-color": colors.risk,
          "circle-radius": [
            "case",
            isSelected,
            MAP_ROUTE_STYLE.selectedCheckpointRadius,
            MAP_ROUTE_STYLE.otherCheckpointRadius,
          ],
          "circle-stroke-color": colors.stroke,
          "circle-stroke-width": ["case", isSelected, 1.5, 1],
          "circle-opacity": ["case", isSelected, 1, otherOpacity],
          "circle-stroke-opacity": ["case", isSelected, 1, otherOpacity],
        }}
      />
    </Source>
  );
}
