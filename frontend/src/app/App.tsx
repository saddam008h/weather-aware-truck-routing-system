import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { TripPlannerPage } from "@/components/trips";
import { TooltipProvider } from "@/components/ui";
import { TripsProvider } from "@/contexts/tripsContext";

// One client for the whole app. Window refocus refetching is off: forecasts
// don't change that fast, and a surprise reload of the heatmap would be jarring.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TripsProvider>
          <TripPlannerPage />
        </TripsProvider>
      </TooltipProvider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
