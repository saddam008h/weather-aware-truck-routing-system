import type { Dispatch, SetStateAction } from "react";

import type { z } from "zod";

import type { tripFormSchema } from "@/validations/trips";

// API shapes below mirror the Django serializers one to one (snake_case included),
// so a response can be used as-is without a mapping layer.

export type RiskLevel = "low" | "moderate" | "high" | "severe" | "no_travel";

export type SampleIntervalMiles = 10 | 25 | 50;

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

export interface TripRequest {
  /** Address/place name, or "lat,lon" once a suggestion was picked. */
  origin: string;
  destination: string;
  /** ISO 8601 with offset. */
  departure_time: string;
  load_weight_lbs: number;
  sample_interval_miles: SampleIntervalMiles;
}

export interface CheckpointWeather {
  temperature_f: number;
  wind_mph: number;
  gust_mph: number;
  rain_in_hr: number;
  snow_in_hr: number;
}

export interface CheckpointRisk {
  level: RiskLevel;
  /** 0 (low) to 4 (no travel) */
  score: number;
  wind: RiskLevel;
  rain: RiskLevel;
  snow: RiskLevel;
  /** The load weight rules made the wind risk worse than wind speed alone. */
  load_adjusted: boolean;
}

export interface Checkpoint {
  mile: number;
  lat: number;
  lon: number;
  eta: string;
  /** Null when the forecast doesn't reach this checkpoint's ETA. */
  weather: CheckpointWeather | null;
  risk: CheckpointRisk | null;
}

export type MilesByLevel = Record<RiskLevel, number>;

export interface RouteRiskSummary {
  worst_level: RiskLevel;
  average_score: number;
  miles_by_level: MilesByLevel;
  unknown_miles: number;
}

/** [lat, lon] */
export type LatLon = [number, number];

export interface TripRoute {
  id: number;
  /** Main roads, e.g. "I 35, I 44" */
  summary: string;
  distance_miles: number;
  duration_minutes: number;
  arrival_time: string;
  is_recommended: boolean;
  risk: RouteRiskSummary;
  geometry: LatLon[];
  checkpoints: Checkpoint[];
}

export interface TripPlan {
  origin: Place;
  destination: Place;
  departure_time: string;
  load_weight_lbs: number;
  sample_interval_miles: SampleIntervalMiles;
  recommended_route_id: number;
  recommendation: string;
  warnings: string[];
  routes: TripRoute[];
}

/** One hour of the heatmap. Every list lines up with TripHeatmap.points by index. */
export interface HeatmapFrame {
  hour: number;
  time: string;
  risk: (number | null)[];
  wind_mph: (number | null)[];
  rain_in_hr: (number | null)[];
  snow_in_hr: (number | null)[];
}

export interface TripHeatmap {
  start_time: string;
  points: LatLon[];
  frames: HeatmapFrame[];
}

// Front-end only types

/** Which value the heatmap shows. Matches the HeatmapFrame keys. */
export type HeatmapMetric = "risk" | "wind_mph" | "rain_in_hr" | "snow_in_hr";

/** What a location input holds: the typed text, plus the place once a suggestion is picked. */
export interface LocationValue {
  text: string;
  place: Place | null;
}

export type TripFormValues = z.infer<typeof tripFormSchema>;

export interface RiskLevelDetails {
  label: string;
  /** CSS variable with the solid color, for map layers. */
  colorVar: string;
  /** Classes for small pills like <RiskBadge />. */
  badgeClassName: string;
  /** Background class for solid fills like the route risk bar. */
  fillClassName: string;
}

export interface HeatmapMetricDetails {
  label: string;
  unit: string;
  /** Values at or below `min` are invisible, values at `max` get the strongest color. */
  min: number;
  max: number;
  /** CSS variables for the color ramp, weakest to strongest. */
  colorVars: string[];
  /** Labelled points under the legend's scale (risk levels, or the brief's thresholds). */
  ticks: { value: number; label: string }[];
  /** What the legend calls the corridor's worst value at the slider hour. */
  peakLabel: string;
  /** Decimals when showing that value. */
  decimals: number;
}

/** A checkpoint plus the route it belongs to, so the map and list can point at the same one. */
export interface CheckpointSelection {
  routeId: number;
  index: number;
}

// Properties on the map's GeoJSON features. "unknown" = no forecast for that stretch.
export interface RouteFeatureProperties {
  routeId: number;
  level: RiskLevel | "unknown";
}

export interface CheckpointFeatureProperties {
  routeId: number;
  index: number;
  level: RiskLevel | "unknown";
}

/** Where the truck is at a given time: before departure it waits at the origin, after arrival it sits at the destination. */
export interface TruckPosition {
  lat: number;
  lon: number;
  mile: number;
  status: "waiting" | "driving" | "arrived";
  /** The truck icon faces east (right) by default; true means mirror it to face west. */
  isHeadingWest: boolean;
}

/** A ready-made trip (real routes, scripted storms) for seeing the app without waiting for bad weather. */
export interface DemoTrip {
  plan: TripPlan;
  heatmap: TripHeatmap;
}

export interface TripsContextType {
  tripPlan: TripPlan | undefined;
  isPlanningTrip: boolean;
  handlePlanTrip: (request: TripRequest) => void;
  /** True while the demo trip is on screen instead of a planned one. */
  isDemoTrip: boolean;
  isLoadingDemoTrip: boolean;
  handleLoadDemoTrip: () => void;
  selectedRoute: TripRoute | undefined;
  /** Selects a route; a checkpoint popup from another route closes. */
  handleSelectRoute: (routeId: number) => void;
  focusedCheckpoint: CheckpointSelection | null;
  setFocusedCheckpoint: Dispatch<SetStateAction<CheckpointSelection | null>>;
  tripHeatmap: TripHeatmap | undefined;
  isTripHeatmapLoading: boolean;
  isTripHeatmapError: boolean;
  refetchTripHeatmap: () => void;
}

/** The forecast slider's state. Kept apart from TripsContextType because it changes many times a second. */
export interface TripForecastContextType {
  forecastHour: number;
  setForecastHour: Dispatch<SetStateAction<number>>;
  /** Lives here (not in the play button) so a new trip can stop playback. */
  isForecastPlaying: boolean;
  setIsForecastPlaying: Dispatch<SetStateAction<boolean>>;
  heatmapMetric: HeatmapMetric;
  setHeatmapMetric: Dispatch<SetStateAction<HeatmapMetric>>;
}
