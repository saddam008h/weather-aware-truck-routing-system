import { Skeleton } from "@/components/ui";

/** Rough outline of the results (banner + three route cards) while the trip is being planned. */
export function TripResultsSkeleton() {
  return (
    <div className="flex flex-col gap-xl" aria-busy="true" aria-label="Planning routes">
      <Skeleton className="h-8xl" />
      <div className="flex flex-col gap-md">
        <Skeleton className="h-11xl" />
        <Skeleton className="h-11xl" />
        <Skeleton className="h-11xl" />
      </div>
    </div>
  );
}
