import { FlaskConical } from "lucide-react";

/** Makes it obvious the storms on screen are invented, so nobody mistakes the demo for a real forecast. */
export function DemoTripBanner() {
  return (
    <div className="flex gap-sm rounded-lg border border-border-warning bg-bg-warning p-lg text-sm text-text-warning">
      <FlaskConical className="size-xl shrink-0" />
      <p>
        <span className="font-semibold">Demo trip.</span> Real Dallas → Chicago routes with made-up storms and a 42,000
        lb load, to show how risky weather changes the pick. Plan a trip above for real forecasts.
      </p>
    </div>
  );
}
