import { ForecastPanel } from "@/components/trips/ForecastPanel";
import { TripMap } from "@/components/trips/TripMap";
import { TripSidebar } from "@/components/trips/TripSidebar";

/** The whole app: planner sidebar on the left, map on the right (stacked on small screens). */
export function TripPlannerPage() {
  return (
    <main className="flex min-h-full flex-col md:h-full md:flex-row">
      <TripSidebar />
      <section className="relative h-[70vh] shrink-0 md:h-full md:flex-1" aria-label="Route map">
        {/* Isolated, so the z-index on map markers (truck, route labels) only ranks them
            against each other and never lifts them over the forecast panel. */}
        <div className="isolate h-full">
          <TripMap />
        </div>
        <ForecastPanel />
      </section>
    </main>
  );
}
