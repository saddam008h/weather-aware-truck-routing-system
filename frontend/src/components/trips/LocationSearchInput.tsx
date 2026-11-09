import { type ChangeEvent, type KeyboardEvent, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Check, LoaderCircle, MapPin } from "lucide-react";

import { FormField } from "@/components/shared";
import { LocationSuggestions } from "@/components/trips/LocationSuggestions";
import { Input } from "@/components/ui";
import { SEARCH_DEBOUNCE_MS } from "@/constants/shared";
import { useDebouncedValue } from "@/hooks/shared";
import { searchPlacesQueryOptions } from "@/queryOptions/trips";
import type { LocationValue, Place } from "@/types/trips";

interface LocationSearchInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  error?: string;
}

/**
 * Text input with place suggestions underneath (a combobox). Typing clears any
 * picked place; picking a suggestion stores its exact coordinates.
 */
export function LocationSearchInput({ id, label, placeholder, value, onChange, error }: LocationSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedText = useDebouncedValue({ value: value.text, delayMs: SEARCH_DEBOUNCE_MS });
  // Once a place is picked its name is already in the box, so there's nothing left to search for.
  const { data: suggestions = [], isFetching } = useQuery({
    ...searchPlacesQueryOptions({ query: debouncedText }),
    enabled: isOpen && !value.place,
  });

  const listId = `${id}-suggestions`;
  const showSuggestions = isOpen && !value.place && suggestions.length > 0;

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ text: event.target.value, place: null });
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleSelect = (place: Place) => {
    onChange({ text: place.name, place });
    setIsOpen(false);
  };

  // Arrow keys move through suggestions, Enter picks one, Escape closes the list.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <FormField label={label} htmlFor={id} error={error}>
      <div className="relative flex items-center">
        <MapPin className="pointer-events-none absolute left-lg size-xl text-text-tertiary" />
        <Input
          id={id}
          className="px-4xl"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value.text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        />
        {isFetching && !value.place && (
          <LoaderCircle className="absolute right-lg size-xl animate-spin text-text-tertiary" />
        )}
        {value.place && <Check className="absolute right-lg size-xl text-risk-low" aria-label="Location picked" />}

        {showSuggestions && (
          <LocationSuggestions
            id={listId}
            suggestions={suggestions}
            activeIndex={activeIndex}
            onSelect={handleSelect}
          />
        )}
      </div>
    </FormField>
  );
}
