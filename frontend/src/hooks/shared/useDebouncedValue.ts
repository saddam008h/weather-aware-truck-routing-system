import { useEffect, useState } from "react";

/** `value`, but only after it has stopped changing for `delayMs`. Used to avoid a search per keystroke. */
export function useDebouncedValue<T>({ value, delayMs }: { value: T; delayMs: number }) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
