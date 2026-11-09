import { EARTH_RADIUS_MILES } from "@/constants/shared";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle (haversine) distance between two [lat, lon] points. */
export function getDistanceMiles({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [lat1, lon1] = from.map(toRadians);
  const [lat2, lon2] = to.map(toRadians);

  const h = Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}
