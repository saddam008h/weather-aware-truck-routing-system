import { Truck } from "lucide-react";

import { TripForm } from "@/components/trips/TripForm";
import { TripResults } from "@/components/trips/TripResults";

export function TripSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-border-primary bg-background-secondary md:h-full md:w-sidebar md:overflow-y-auto md:border-r">
      <header className="flex items-center gap-md border-b border-border-primary px-xl py-lg">
        <span className="flex size-4xl items-center justify-center rounded-lg bg-button-primary text-text-button-primary">
          <Truck className="size-xl" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-text-primary">Weather-Aware Truck Routing</h1>
          <p className="text-xs text-text-secondary">Find the safest route for the forecast and your load.</p>
        </div>
      </header>

      <div className="flex flex-col gap-2xl p-xl">
        <TripForm />
        <TripResults />
      </div>
    </aside>
  );
}
