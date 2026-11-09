import type { Map as MapLibreMap } from "maplibre-gl";

import { BASEMAP_STATE_LAYER_IDS, STATE_LABELS_MAX_ZOOM, STATES_MIN_ZOOM } from "@/constants/trips";

// A zoom past anything MapLibre allows, i.e. "no upper limit".
const NO_MAX_ZOOM = 24;

/**
 * Keeps state names and borders visible when a whole trip is in view.
 *
 * The basemap's own state layers are reused, just with a wider zoom range,
 * so there's no extra data to load. Layers missing from the style are skipped.
 */
export function showStatesOnMap({ map }: { map: MapLibreMap }) {
  const { LABELS, BORDERS } = BASEMAP_STATE_LAYER_IDS;

  if (map.getLayer(LABELS)) {
    map.setLayerZoomRange(LABELS, STATES_MIN_ZOOM, STATE_LABELS_MAX_ZOOM);
  }
  if (map.getLayer(BORDERS)) {
    map.setLayerZoomRange(BORDERS, STATES_MIN_ZOOM, NO_MAX_ZOOM);
  }
}
