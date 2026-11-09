import { TriangleAlert } from "lucide-react";

/** Heads-ups from the API, e.g. "Every route runs into No Travel conditions". Renders nothing when there are none. */
export function TripWarnings({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-sm rounded-lg border border-border-warning bg-bg-warning p-lg">
      {warnings.map((warning) => (
        <li key={warning} className="flex gap-sm text-sm text-text-warning">
          <TriangleAlert className="size-xl shrink-0" />
          {warning}
        </li>
      ))}
    </ul>
  );
}
