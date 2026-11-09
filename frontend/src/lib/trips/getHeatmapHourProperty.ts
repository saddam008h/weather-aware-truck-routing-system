/** Name of the feature property holding the weight for one forecast hour: 5 -> "h5". */
export function getHeatmapHourProperty({ hour }: { hour: number }) {
  return `h${hour}`;
}
