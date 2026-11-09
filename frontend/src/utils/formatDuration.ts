/** 1026 -> "17 h 6 min", 45 -> "45 min" */
export function formatDuration({ minutes }: { minutes: number }) {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;

  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
