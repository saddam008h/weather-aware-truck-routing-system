/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Lets imports use "@/lib/trips" instead of long "../../" paths.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  optimizeDeps: {
    // Pre-bundling copies MapLibre into .vite/deps, away from its web worker file,
    // and can leave the app and react-map-gl holding two separate copies of it.
    exclude: ["maplibre-gl"],
  },
  build: {
    // MapLibre alone is ~1.1 MB minified (it ships its own WebGL renderer), so it
    // gets a chunk of its own that browsers can keep cached across app releases.
    // The default 500 kB warning would only ever be about that chunk.
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: "maplibre", test: /node_modules[\\/]maplibre-gl/ }],
        },
      },
    },
  },
  test: {
    // Only plain functions from lib/ and utils/ are tested, no DOM needed.
    environment: "node",
  },
});
