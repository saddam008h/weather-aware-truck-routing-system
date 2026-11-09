/** 42000 -> "42,000", 966.64 -> "966.6" (with maximumFractionDigits: 1) */
export function formatToLocaleNumber({
  value,
  maximumFractionDigits = 0,
}: {
  value: number;
  maximumFractionDigits?: number;
}) {
  return value.toLocaleString("en-US", { maximumFractionDigits });
}
