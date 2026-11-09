import type { Place } from "@/types/trips";
import { cn } from "@/utils";

interface LocationSuggestionsProps {
  id: string;
  suggestions: Place[];
  activeIndex: number;
  onSelect: (place: Place) => void;
}

export function LocationSuggestions({ id, suggestions, activeIndex, onSelect }: LocationSuggestionsProps) {
  return (
    <ul
      id={id}
      role="listbox"
      className="absolute inset-x-none top-full z-20 mt-xs flex flex-col overflow-hidden rounded-md border border-border-primary bg-background py-xs shadow-lg"
    >
      {suggestions.map((place, index) => (
        <li
          key={`${place.lat},${place.lon}`}
          id={`${id}-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          className={cn(
            "cursor-pointer px-lg py-sm text-sm text-text-primary hover:bg-background-tertiary",
            index === activeIndex && "bg-background-tertiary",
          )}
          // mousedown (not click) fires before the input's blur, which would close the list first.
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(place);
          }}
        >
          {place.name}
        </li>
      ))}
    </ul>
  );
}
