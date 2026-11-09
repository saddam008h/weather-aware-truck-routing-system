import "maplibre-gl/dist/maplibre-gl.css";

import { useRef, useState } from "react";

import { Map, type MapLayerMouseEvent, type MapRef, NavigationControl } from "react-map-gl/maplibre";

import { CheckpointPopup } from "@/components/trips/CheckpointPopup";
import { MapCheckpointLayer } from "@/components/trips/MapCheckpointLayer";
import { MapEndpointMarkers } from "@/components/trips/MapEndpointMarkers";
import { MapHeatmapLayer } from "@/components/trips/MapHeatmapLayer";
import { MapRouteLabels } from "@/components/trips/MapRouteLabels";
import { MapRouteLayers } from "@/components/trips/MapRouteLayers";
import { MapTruckMarker } from "@/components/trips/MapTruckMarker";
import { MAP_INITIAL_VIEW, MAP_LAYER_IDS, MAP_STYLE_URL } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { useFitMapToRoutes, useFlyToFocusedCheckpoint } from "@/hooks/trips";
import { showStatesOnMap } from "@/lib/trips";
import type { CheckpointSelection } from "@/types/trips";

// Map layers that react to the mouse. Everything else (basemap, heatmap) ignores it.
const INTERACTIVE_LAYER_IDS = [MAP_LAYER_IDS.ROUTE_LINES, MAP_LAYER_IDS.CHECKPOINTS];

/**
 * The map: heatmap at the bottom, then route lines, checkpoint dots and the
 * HTML markers on top. The order of the children below is the drawing order.
 */
export function TripMap() {
  const [hoveredCheckpoint, setHoveredCheckpoint] = useState<CheckpointSelection | null>(null);
  const [cursor, setCursor] = useState<string>();
  const mapRef = useRef<MapRef>(null);

  const { tripPlan, handleSelectRoute, focusedCheckpoint } = useTripsContext();
  useFitMapToRoutes({ mapRef, routes: tripPlan?.routes });
  useFlyToFocusedCheckpoint({ mapRef });

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    setCursor(feature ? "pointer" : undefined);

    if (feature?.layer.id !== MAP_LAYER_IDS.CHECKPOINTS) {
      setHoveredCheckpoint(null);
      return;
    }
    const { routeId, index } = feature.properties as CheckpointSelection;
    // Keep the same object while hovering the same dot, so the map doesn't re-render on every pixel of movement.
    setHoveredCheckpoint((current) =>
      current?.routeId === routeId && current.index === index ? current : { routeId, index },
    );
  };

  // Clicking any route line or checkpoint dot selects that route.
  const handleClick = (event: MapLayerMouseEvent) => {
    const routeId = event.features?.[0]?.properties.routeId;
    if (typeof routeId === "number") {
      handleSelectRoute(routeId);
    }
  };

  const handleMouseOut = () => {
    setCursor(undefined);
    setHoveredCheckpoint(null);
  };

  // Hovering wins over the checkpoint picked in the sidebar list.
  const popupCheckpoint = hoveredCheckpoint ?? focusedCheckpoint;

  return (
    <Map
      ref={mapRef}
      initialViewState={MAP_INITIAL_VIEW}
      mapStyle={MAP_STYLE_URL}
      interactiveLayerIds={INTERACTIVE_LAYER_IDS}
      cursor={cursor}
      // Collapsed to an (i) button so the map credits don't run under the forecast panel.
      attributionControl={{ compact: true }}
      onLoad={(event) => showStatesOnMap({ map: event.target })}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      <NavigationControl position="top-right" showCompass={false} />

      <MapHeatmapLayer />
      <MapRouteLayers />
      <MapCheckpointLayer />

      <MapEndpointMarkers />
      <MapRouteLabels />
      <MapTruckMarker />
      {popupCheckpoint && <CheckpointPopup selection={popupCheckpoint} />}
    </Map>
  );
}
