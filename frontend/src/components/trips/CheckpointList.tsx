import { CheckpointRow } from "@/components/trips/CheckpointRow";
import { useTripsContext } from "@/contexts/tripsContext";

/** Every checkpoint on the selected route. Clicking one shows it on the map. */
export function CheckpointList() {
  const { selectedRoute, focusedCheckpoint, setFocusedCheckpoint } = useTripsContext();

  if (!selectedRoute) {
    return null;
  }

  return (
    <section className="flex flex-col gap-sm" aria-labelledby="checkpoint-list-title">
      <h2 id="checkpoint-list-title" className="text-sm font-semibold text-text-primary">
        Checkpoints on route {selectedRoute.id}{" "}
        <span className="font-normal text-text-tertiary">({selectedRoute.checkpoints.length})</span>
      </h2>

      {/* On phones the sidebar sits above the map, so a long list scrolls in place instead of pushing the map away. */}
      <ol className="flex flex-col divide-y divide-border-primary overflow-hidden rounded-lg border border-border-primary bg-background max-md:max-h-[50vh] max-md:overflow-y-auto">
        {selectedRoute.checkpoints.map((checkpoint, index) => (
          <CheckpointRow
            key={checkpoint.mile}
            checkpoint={checkpoint}
            isFocused={focusedCheckpoint?.routeId === selectedRoute.id && focusedCheckpoint.index === index}
            onSelect={() => setFocusedCheckpoint({ routeId: selectedRoute.id, index })}
          />
        ))}
      </ol>
    </section>
  );
}
