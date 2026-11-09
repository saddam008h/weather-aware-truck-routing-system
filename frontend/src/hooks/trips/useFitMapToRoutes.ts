import { type RefObject, useEffect } from "react";

import type { MapRef } from "react-map-gl/maplibre";

import { MAP_FIT_PADDING, MAP_FIT_PADDING_COMPACT, MAP_COMPACT_HEIGHT_PX } from "@/constants/trips";
import { getRoutesBounds } from "@/lib/trips";
import type { TripRoute } from "@/types/trips";

/** Zooms the map to show every route whenever a new trip is planned. */
export function useFitMapToRoutes({ mapRef, routes }: { mapRef: RefObject<MapRef | null>; routes?: TripRoute[] }) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routes?.length) {
      return;
    }

    // Short maps (phones) can't spare the room the forecast panel normally gets.
    const isCompact = map.getContainer().clientHeight < MAP_COMPACT_HEIGHT_PX;
    map.fitBounds(getRoutesBounds({ routes }), {
      padding: isCompact ? MAP_FIT_PADDING_COMPACT : MAP_FIT_PADDING,
      duration: 800,
    });
  }, [mapRef, routes]);
}
