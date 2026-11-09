import { useMemo } from "react";

import { Marker } from "react-map-gl/maplibre";

import { RouteMapLabel } from "@/components/trips/RouteMapLabel";
import { ROUTE_LABEL_POSITIONS } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { getRouteLabelPoint } from "@/lib/trips";
import { cn } from "@/utils";

/** A clickable chip on each route ("Route 2 · 17 h 18 min"), placed partway along its line, with its summary on hover. */
export function MapRouteLabels() {
  const { tripPlan, selectedRoute, handleSelectRoute } = useTripsContext();

  const labels = useMemo(
    () =>
      (tripPlan?.routes ?? []).map((route, index) => ({
        route,
        point: getRouteLabelPoint({ route, position: ROUTE_LABEL_POSITIONS[index % ROUTE_LABEL_POSITIONS.length] }),
      })),
    [tripPlan],
  );

  return labels.map(({ route, point: [lat, lon] }) => {
    const isSelected = route.id === selectedRoute?.id;

    return (
      <Marker
        key={route.id}
        longitude={lon}
        latitude={lat}
        anchor="bottom"
        // The selected route's chip sits above the others when they overlap, and an open
        // summary card above everything else (truck marker included).
        className={cn(isSelected ? "z-10" : "z-0", "hover:z-30 has-focus-visible:z-30")}
        onClick={(event) => {
          // Stop the click from also reaching the map underneath.
          event.originalEvent.stopPropagation();
          handleSelectRoute(route.id);
        }}
      >
        <RouteMapLabel route={route} isSelected={isSelected} />
      </Marker>
    );
  });
}
