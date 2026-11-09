import type { FeatureCollection } from "geojson";

import type {
  HeatmapMetric,
  HeatmapMetricDetails,
  RiskLevel,
  RiskLevelDetails,
  SampleIntervalMiles,
} from "@/types/trips";

// -------------------------- Risk levels --------------------------

/** Lowest to highest. Used wherever levels are listed or stacked in order. */
export const RISK_LEVEL_ORDER: RiskLevel[] = ["low", "moderate", "high", "severe", "no_travel"];

export const RISK_LEVELS: Record<RiskLevel, RiskLevelDetails> = {
  low: {
    label: "Low",
    colorVar: "--risk-low",
    badgeClassName: "bg-risk-low-subtle text-risk-low-strong",
    fillClassName: "bg-risk-low",
  },
  moderate: {
    label: "Moderate",
    colorVar: "--risk-moderate",
    badgeClassName: "bg-risk-moderate-subtle text-risk-moderate-strong",
    fillClassName: "bg-risk-moderate",
  },
  high: {
    label: "High",
    colorVar: "--risk-high",
    badgeClassName: "bg-risk-high-subtle text-risk-high-strong",
    fillClassName: "bg-risk-high",
  },
  severe: {
    label: "Severe",
    colorVar: "--risk-severe",
    badgeClassName: "bg-risk-severe-subtle text-risk-severe-strong",
    fillClassName: "bg-risk-severe",
  },
  no_travel: {
    label: "No travel",
    colorVar: "--risk-no-travel",
    badgeClassName: "bg-risk-no-travel-subtle text-risk-no-travel-strong",
    fillClassName: "bg-risk-no-travel",
  },
};

/** For checkpoints the forecast doesn't reach. */
export const UNKNOWN_RISK: RiskLevelDetails = {
  label: "No forecast",
  colorVar: "--risk-unknown",
  badgeClassName: "bg-risk-unknown-subtle text-risk-unknown-strong",
  fillClassName: "bg-risk-unknown",
};

// -------------------------- Trip form --------------------------

export const SAMPLE_INTERVAL_OPTIONS: { value: SampleIntervalMiles; label: string }[] = [
  { value: 10, label: "10 mi" },
  { value: 25, label: "25 mi" },
  { value: 50, label: "50 mi" },
];

export const DEFAULT_SAMPLE_INTERVAL_MILES: SampleIntervalMiles = 25;
export const DEFAULT_LOAD_WEIGHT_LBS = 35_000;
export const MAX_LOAD_WEIGHT_LBS = 80_000;

// Same window the API accepts: from an hour ago up to 7 days out.
export const DEPARTURE_GRACE_MINUTES = 60;
export const MAX_DEPARTURE_DAYS_AHEAD = 7;

/** Geocoding only kicks in after this many characters. */
export const MIN_PLACE_SEARCH_LENGTH = 3;

// -------------------------- Demo trip --------------------------

// Static files in public/demo, written by the backend's `python manage.py build_demo_trip`.
export const DEMO_TRIP_FILES = {
  PLAN: "demo/trip-plan.json",
  HEATMAP: "demo/trip-heatmap.json",
};

// -------------------------- Forecast heatmap --------------------------

export const FORECAST_HOURS = 48;
/** How long each hour stays on screen while the forecast plays. */
export const FORECAST_PLAYBACK_STEP_MS = 700;

// Ticks for the single factors are the brief's risk thresholds, so the heatmap
// colors can be read against the same table the route risk comes from.
export const HEATMAP_METRICS: Record<HeatmapMetric, HeatmapMetricDetails> = {
  risk: {
    label: "Overall risk",
    min: 0,
    max: 4,
    colorVars: ["--heatmap-risk-1", "--heatmap-risk-2", "--heatmap-risk-3", "--heatmap-risk-4"],
    ticks: RISK_LEVEL_ORDER.map((level, score) => ({ value: score, label: RISK_LEVELS[level].label })),
  },
  wind_mph: {
    label: "Wind",
    // Under 10 mph is just a normal day, so it stays clear.
    min: 10,
    max: 55,
    colorVars: ["--heatmap-wind-1", "--heatmap-wind-2", "--heatmap-wind-3", "--heatmap-wind-4"],
    ticks: [
      { value: 10, label: "10" },
      { value: 25, label: "25" },
      { value: 35, label: "35" },
      { value: 45, label: "45" },
      { value: 55, label: "55+ mph" },
    ],
  },
  rain_in_hr: {
    label: "Rain",
    min: 0,
    max: 0.5,
    colorVars: ["--heatmap-rain-1", "--heatmap-rain-2", "--heatmap-rain-3", "--heatmap-rain-4"],
    ticks: [
      { value: 0, label: "0" },
      { value: 0.1, label: "0.1" },
      { value: 0.25, label: "0.25" },
      { value: 0.5, label: "0.5+ in/hr" },
    ],
  },
  snow_in_hr: {
    label: "Snow",
    min: 0,
    max: 2,
    colorVars: ["--heatmap-snow-1", "--heatmap-snow-2", "--heatmap-snow-3", "--heatmap-snow-4"],
    ticks: [
      { value: 0, label: "0" },
      { value: 0.5, label: "0.5" },
      { value: 1, label: "1" },
      { value: 2, label: "2+ in/hr" },
    ],
  },
};

/** The main heatmap view. Overall risk already combines wind, rain and snow (worst of the three). */
export const HEATMAP_OVERALL_OPTION: { value: HeatmapMetric; label: string } = {
  value: "risk",
  label: "Overall risk",
};

/** One weather factor on its own, for a closer look at what's behind the overall risk. */
export const HEATMAP_FACTOR_OPTIONS: { value: HeatmapMetric; label: string }[] = [
  { value: "wind_mph", label: "Wind only" },
  { value: "rain_in_hr", label: "Rain only" },
  { value: "snow_in_hr", label: "Snow only" },
];

/** Grid points are spaced evenly; a radius of about two cells lets neighbours blend smoothly. */
export const HEATMAP_RADIUS_IN_CELLS = 2;

export const HEATMAP_LAYER_STYLE = {
  intensity: 1,
  opacity: 0.7,
  // Zoomed in past this, the heatmap fades out and the routes speak for themselves.
  maxZoom: 11,
};

// -------------------------- Map --------------------------

// OpenFreeMap: free vector tiles, no API key. Positron is a muted style that keeps overlays readable.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Layers of the Positron basemap that draw states (and other first-level regions). */
export const BASEMAP_STATE_LAYER_IDS = { LABELS: "label_state", BORDERS: "boundary_3" };
/** Out of the box Positron shows state names from zoom 5 and borders from zoom 8; a whole trip sits around 4-5. */
export const STATES_MIN_ZOOM = 3;
/** Past this zoom city labels take over, as in the original style. */
export const STATE_LABELS_MAX_ZOOM = 8;

/** Continental US before any trip is planned. */
export const MAP_INITIAL_VIEW = { longitude: -98.5, latitude: 39.5, zoom: 3.6 };

/** Leaves room for the forecast panel at the bottom when fitting routes into view. */
export const MAP_FIT_PADDING = { top: 72, bottom: 220, left: 64, right: 64 };
/** Used instead on short maps (phones), where 220px would leave no room for the routes. */
export const MAP_FIT_PADDING_COMPACT = { top: 40, bottom: 40, left: 24, right: 24 };
export const MAP_COMPACT_HEIGHT_PX = 600;

export const MAP_FOCUS_ZOOM = 8;

/** Line and dot sizes (px) for the selected route vs the other options. */
export const MAP_ROUTE_STYLE = {
  casingWidth: 10,
  selectedWidth: 6,
  otherWidth: 4,
  otherOpacity: 0.55,
  selectedCheckpointRadius: 5,
  otherCheckpointRadius: 3,
  otherCheckpointOpacity: 0.75,
};

export const MAP_SOURCE_IDS = {
  HEATMAP: "trip-heatmap",
  ROUTES: "trip-routes",
  CHECKPOINTS: "trip-checkpoints",
};

export const MAP_LAYER_IDS = {
  HEATMAP: "trip-heatmap",
  ROUTE_CASING: "trip-route-casing",
  ROUTE_LINES: "trip-route-lines",
  CHECKPOINTS: "trip-checkpoints",
};

/** Where along each route (0-1) its label sits, staggered so labels of similar routes don't stack. */
export const ROUTE_LABEL_POSITIONS = [0.5, 0.35, 0.65];

export const EMPTY_FEATURE_COLLECTION: FeatureCollection = { type: "FeatureCollection", features: [] };
