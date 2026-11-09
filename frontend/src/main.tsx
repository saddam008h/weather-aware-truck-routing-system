import "@fontsource-variable/inter";
import "@/app/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

import { App } from "@/app/App";

// MapLibre locates its web worker relative to its own file, which breaks once Vite
// bundles the library (blank map, "Worker failed to load"). Handing it the
// worker's URL explicitly works both in dev and in production builds.
setWorkerUrl(maplibreWorkerUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
