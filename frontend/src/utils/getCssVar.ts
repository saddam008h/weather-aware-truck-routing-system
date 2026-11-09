/** Reads a color (or any value) defined in globals.css, for places that can't use Tailwind classes like map layers. */
export function getCssVar({ name }: { name: string }) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
