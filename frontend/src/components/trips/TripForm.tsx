import { zodResolver } from "@hookform/resolvers/zod";
import { Route } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { FormField } from "@/components/shared";
import { LocationSearchInput } from "@/components/trips/LocationSearchInput";
import { Button, Input, SegmentedControl } from "@/components/ui";
import { MAX_LOAD_WEIGHT_LBS, SAMPLE_INTERVAL_OPTIONS } from "@/constants/trips";
import { useTripsContext } from "@/contexts/tripsContext";
import { buildTripRequest, getDepartureInputLimits, getTripFormDefaultValues } from "@/lib/trips";
import type { TripFormValues } from "@/types/trips";
import { tripFormSchema } from "@/validations/trips";

export function TripForm() {
  const { handlePlanTrip, isPlanningTrip } = useTripsContext();

  // react-hook-form keeps the field values; zod (tripFormSchema) decides what's valid.
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: getTripFormDefaultValues(),
  });

  // Recomputed on each render, so the picker's window moves along with the clock.
  const departureLimits = getDepartureInputLimits();

  // Only runs once every field passes validation.
  const handleValidSubmit = (values: TripFormValues) => {
    handlePlanTrip(buildTripRequest({ values }));
  };

  return (
    <form className="flex flex-col gap-lg" onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      {/* Locations use Controller because their value is an object (text + picked place), not a plain string. */}
      <Controller
        name="origin"
        control={control}
        render={({ field, fieldState }) => (
          <LocationSearchInput
            id="origin"
            label="Origin"
            placeholder="e.g. Dallas, TX"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="destination"
        control={control}
        render={({ field, fieldState }) => (
          <LocationSearchInput
            id="destination"
            label="Destination"
            placeholder="e.g. Chicago, IL"
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="flex gap-md">
        <FormField label="Departure" htmlFor="departureTime" error={errors.departureTime?.message} className="flex-1">
          <Input
            id="departureTime"
            type="datetime-local"
            min={departureLimits.min}
            max={departureLimits.max}
            aria-invalid={!!errors.departureTime}
            {...register("departureTime")}
          />
        </FormField>
        <FormField label="Load (lb)" htmlFor="loadWeightLbs" error={errors.loadWeightLbs?.message} className="w-c-xxxs">
          <Input
            id="loadWeightLbs"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_LOAD_WEIGHT_LBS}
            step={500}
            aria-invalid={!!errors.loadWeightLbs}
            {...register("loadWeightLbs", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-xs">
        <span className="text-xs font-medium text-text-secondary">Check the weather every</span>
        <Controller
          name="sampleIntervalMiles"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              ariaLabel="Check the weather every"
              options={SAMPLE_INTERVAL_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <Button type="submit" size="lg" loading={isPlanningTrip}>
        <Route />
        Plan routes
      </Button>
    </form>
  );
}
