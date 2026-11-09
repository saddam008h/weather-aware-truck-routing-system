import { FlaskConical, Route } from "lucide-react";

import { EmptyView } from "@/components/shared";
import { CheckpointList } from "@/components/trips/CheckpointList";
import { DemoTripBanner } from "@/components/trips/DemoTripBanner";
import { RecommendationBanner } from "@/components/trips/RecommendationBanner";
import { RiskLegend } from "@/components/trips/RiskLegend";
import { RouteCard } from "@/components/trips/RouteCard";
import { TripResultsSkeleton } from "@/components/trips/TripResultsSkeleton";
import { TripWarnings } from "@/components/trips/TripWarnings";
import { Button } from "@/components/ui";
import { useTripsContext } from "@/contexts/tripsContext";

export function TripResults() {
  const {
    tripPlan,
    isPlanningTrip,
    isDemoTrip,
    isLoadingDemoTrip,
    handleLoadDemoTrip,
    selectedRoute,
    handleSelectRoute,
  } = useTripsContext();

  if (isPlanningTrip) {
    return <TripResultsSkeleton />;
  }

  if (!tripPlan) {
    return (
      <EmptyView
        icon={<Route className="size-2xl" />}
        title="No trip planned yet"
        description="Enter a route above. We'll compare up to three options by the weather the truck will actually drive into."
        action={
          <Button variant="secondary" loading={isLoadingDemoTrip} onClick={() => handleLoadDemoTrip()}>
            <FlaskConical />
            Try a demo trip with storms
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-xl">
      {isDemoTrip && <DemoTripBanner />}
      <RecommendationBanner tripPlan={tripPlan} />
      <TripWarnings warnings={tripPlan.warnings} />

      <section className="flex flex-col gap-md" aria-label="Route options">
        {/* One color key for all the cards' risk bars. */}
        <RiskLegend showUnknown={tripPlan.routes.some((route) => route.risk.unknown_miles > 0)} />

        {tripPlan.routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            isSelected={route.id === selectedRoute?.id}
            onSelect={() => handleSelectRoute(route.id)}
          />
        ))}
      </section>

      <CheckpointList />
    </div>
  );
}
