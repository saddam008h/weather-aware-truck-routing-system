import { Marker } from "react-map-gl/maplibre";

import { useTripsContext } from "@/contexts/tripsContext";

/** "A" and "B" pins on the origin and destination. */
export function MapEndpointMarkers() {
  const { tripPlan } = useTripsContext();

  if (!tripPlan) {
    return null;
  }

  const endpoints = [
    { key: "origin", letter: "A", place: tripPlan.origin },
    { key: "destination", letter: "B", place: tripPlan.destination },
  ];

  return endpoints.map(({ key, letter, place }) => (
    <Marker key={key} longitude={place.lon} latitude={place.lat} anchor="center">
      <span
        title={place.name}
        className="flex size-3xl items-center justify-center rounded-full border-2 border-background bg-button-primary text-xs font-semibold text-text-button-primary shadow-md"
      >
        {letter}
      </span>
    </Marker>
  ));
}
