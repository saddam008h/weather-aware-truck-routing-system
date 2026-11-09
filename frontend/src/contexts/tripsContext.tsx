import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getTripHeatmapQueryOptions } from "@/queryOptions/trips";
import { getDemoTrip, planTrip } from "@/services/trips";
import type {
  CheckpointSelection,
  DemoTrip,
  HeatmapMetric,
  TripForecastContextType,
  TripPlan,
  TripRequest,
  TripsContextType,
} from "@/types/trips";
import { handleError } from "@/utils";

const TripsContext = createContext<TripsContextType | undefined>(undefined);
const TripForecastContext = createContext<TripForecastContextType | undefined>(undefined);

/**
 * State shared by the sidebar and the map: the planned trip, the selected route,
 * the focused checkpoint and the forecast slider.
 *
 * It's split into two contexts. The slider changes many times a second while
 * it's dragged or playing, and keeping it apart means only the heatmap and the
 * slider panel re-render then, not the whole sidebar.
 */
export function TripsProvider({ children }: { children: ReactNode }) {
  const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
  // Kept in state rather than read from the mutation's `data`: React Query clears
  // that as soon as a new request starts, so a failed re-plan would wipe the
  // trip on screen. This way the last good trip stays until a new one succeeds.
  const [plannedTrip, setPlannedTrip] = useState<TripPlan | null>(null);
  const [demoTrip, setDemoTrip] = useState<DemoTrip | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [focusedCheckpoint, setFocusedCheckpoint] = useState<CheckpointSelection | null>(null);
  const [forecastHour, setForecastHour] = useState(0);
  const [isForecastPlaying, setIsForecastPlaying] = useState(false);
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>("risk");

  // Every new trip (planned or demo) starts on the recommended route, at
  // departure time, with playback stopped and no popup open.
  const showFromStart = (plan: TripPlan) => {
    setSelectedRouteId(plan.recommended_route_id);
    setFocusedCheckpoint(null);
    setForecastHour(0);
    setIsForecastPlaying(false);
  };

  // Stable (useCallback) so it doesn't break the memoized context value below.
  // A popup from another route would be pointing at a route that's no longer highlighted.
  const handleSelectRoute = useCallback((routeId: number) => {
    setSelectedRouteId(routeId);
    setFocusedCheckpoint((current) => (current?.routeId === routeId ? current : null));
  }, []);

  const { mutate: handlePlanTrip, isPending: isPlanningTrip } = useMutation({
    mutationFn: (request: TripRequest) => planTrip({ request }),
    // Freeze the old trip's playback while the new one loads.
    onMutate: () => setIsForecastPlaying(false),
    onSuccess: (plan, request) => {
      setPlannedTrip(plan);
      setDemoTrip(null);
      setTripRequest(request);
      showFromStart(plan);
    },
    onError: (error) => {
      handleError({ error, message: "There was an error trying to plan your trip. Please try again later!" });
    },
  });

  const { mutate: handleLoadDemoTrip, isPending: isLoadingDemoTrip } = useMutation({
    mutationFn: getDemoTrip,
    onMutate: () => setIsForecastPlaying(false),
    onSuccess: (demo) => {
      setDemoTrip(demo);
      // No request means the real heatmap query below stays idle; the demo brings its own.
      setTripRequest(null);
      showFromStart(demo.plan);
    },
    onError: (error) => {
      handleError({ error, message: "There was an error trying to load the demo trip. Please try again later!" });
    },
  });

  // Fetched after the plan comes back: the API reuses the routes it just found for the plan.
  const heatmapQuery = useQuery(getTripHeatmapQueryOptions({ request: tripRequest }));

  const tripPlan = demoTrip?.plan ?? plannedTrip ?? undefined;
  const tripHeatmap = demoTrip?.heatmap ?? heatmapQuery.data;
  const isTripHeatmapLoading = heatmapQuery.isLoading;
  const isTripHeatmapError = heatmapQuery.isError;
  const refetchTripHeatmap = heatmapQuery.refetch;
  const isDemoTrip = demoTrip !== null;

  const selectedRoute = tripPlan?.routes.find((route) => route.id === selectedRouteId);

  // Memoized so a slider change (which re-renders this provider) doesn't hand
  // every TripsContext consumer a "new" value and re-render them too.
  const tripsValue = useMemo<TripsContextType>(
    () => ({
      tripPlan,
      isPlanningTrip,
      handlePlanTrip,
      isDemoTrip,
      isLoadingDemoTrip,
      handleLoadDemoTrip,
      selectedRoute,
      handleSelectRoute,
      focusedCheckpoint,
      setFocusedCheckpoint,
      tripHeatmap,
      isTripHeatmapLoading,
      isTripHeatmapError,
      refetchTripHeatmap,
    }),
    [
      tripPlan,
      isPlanningTrip,
      handlePlanTrip,
      isDemoTrip,
      isLoadingDemoTrip,
      handleLoadDemoTrip,
      selectedRoute,
      handleSelectRoute,
      focusedCheckpoint,
      tripHeatmap,
      isTripHeatmapLoading,
      isTripHeatmapError,
      refetchTripHeatmap,
    ],
  );

  const forecastValue = useMemo<TripForecastContextType>(
    () => ({
      forecastHour,
      setForecastHour,
      isForecastPlaying,
      setIsForecastPlaying,
      heatmapMetric,
      setHeatmapMetric,
    }),
    [forecastHour, isForecastPlaying, heatmapMetric],
  );

  return (
    <TripsContext.Provider value={tripsValue}>
      <TripForecastContext.Provider value={forecastValue}>{children}</TripForecastContext.Provider>
    </TripsContext.Provider>
  );
}

export function useTripsContext() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error("useTripsContext must be used inside <TripsProvider>");
  }
  return context;
}

export function useTripForecastContext() {
  const context = useContext(TripForecastContext);
  if (!context) {
    throw new Error("useTripForecastContext must be used inside <TripsProvider>");
  }
  return context;
}
