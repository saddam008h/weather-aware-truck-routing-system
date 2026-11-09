import { Truck } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";

import { useTruckPosition } from "@/hooks/trips";
import { cn } from "@/utils";

/** The truck on the selected route, at the hour the forecast slider points to, facing the way it drives. */
export function MapTruckMarker() {
  const position = useTruckPosition();

  if (!position) {
    return null;
  }

  return (
    <Marker longitude={position.lon} latitude={position.lat} anchor="center" className="z-20">
      <span className="flex size-3xl items-center justify-center rounded-full border-2 border-background bg-bg-brand text-text-button-primary shadow-lg">
        {/* The icon faces right; mirror it (not rotate, which would turn it upside down) when driving west. */}
        <Truck className={cn("size-lg", position.isHeadingWest && "-scale-x-100")} />
      </span>
    </Marker>
  );
}
