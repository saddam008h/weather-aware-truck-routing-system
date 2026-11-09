import { type RefObject, useEffect } from "react";

import type { MapRef } from "react-map-gl/maplibre";

import { MAP_FOCUS_ZOOM } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";

/** When a checkpoint is picked in the sidebar list, pans (and zooms in, if needed) to it on the map. */
export function useFlyToFocusedCheckpoint({ mapRef }: { mapRef: RefObject<MapRef | null> }) {
  const { tripPlan, focusedCheckpoint } = useTripsContext();

  useEffect(() => {
    const map = mapRef.current;
    const route = tripPlan?.routes.find(({ id }) => id === focusedCheckpoint?.routeId);
    const checkpoint = focusedCheckpoint ? route?.checkpoints[focusedCheckpoint.index] : undefined;
    if (!map || !checkpoint) {
      return;
    }

    map.flyTo({
      center: [checkpoint.lon, checkpoint.lat],
      zoom: Math.max(map.getZoom(), MAP_FOCUS_ZOOM),
      duration: 800,
    });
  }, [mapRef, tripPlan, focusedCheckpoint]);
}
