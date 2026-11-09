/** Small label over a value, e.g. "Distance / 966 mi". Spans only, since it sits inside a button. */
export function RouteStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-xxs">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </span>
  );
}
