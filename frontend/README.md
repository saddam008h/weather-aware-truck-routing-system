# Weather-Aware Truck Routing — Frontend

React app for planning a truck trip: enter an origin, destination, departure time and load weight, and it
compares up to three routes by the weather the truck will actually drive into. Talks to the Django API in
`../backend`.

Built with Vite, React 19, TypeScript, TanStack Query, Tailwind CSS v4 and MapLibre GL (via `react-map-gl`).

## Running it

Start the backend first (see `../backend/README.md`), then:

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_BASE_URL, defaults to http://localhost:8000
npm run dev              # http://localhost:5173
```

| Script            | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev server with hot reload         |
| `npm run build`   | Type-check and build into `dist/`  |
| `npm run preview` | Serve the production build locally |
| `npm test`        | Unit tests (Vitest)                |
| `npm run lint`    | oxlint                             |
| `npm run format`  | Prettier                           |

The base map uses [OpenFreeMap](https://openfreemap.org) vector tiles, which need no API key.

## What's on screen

- **Sidebar:** the trip form (with place search), the recommended route and why it won, a card per route
  (distance, drive time, arrival, miles in each risk level) and the checkpoint list for the selected route.
- **Map:** every route option, with the selected one colored by risk. Checkpoint dots show their ETA,
  forecast and risk on hover. Clicking a line, dot or route chip selects that route. US state names and
  borders stay visible at trip-level zoom.
- **Forecast panel:** a 0–48 hour slider (hour 0 = departure hour) for the weather heatmap along the trip
  corridor, with play/pause and stop (stops on its own at +48h). A dropdown picks what the heatmap shows:
  overall risk by default (it already combines wind, rain and snow), or one of those factors on its own.
  The slider covers the whole corridor's forecast, so it keeps going after a short trip's arrival time.
- **Demo trip:** "Try a demo trip with storms" (shown before any trip is planned) loads real Dallas →
  Chicago routes with scripted storms from `public/demo/`, clearly marked as demo data. It's handy when
  the real forecast is calm. The files are built by the backend's `python manage.py build_demo_trip`.

## Keeping the map smooth

- The API sends all 49 forecast hours in one response. Each heatmap point carries a weight for every
  hour (`h0` … `h48`), so moving the slider only changes which property the heatmap layer reads. Nothing
  is re-fetched or re-uploaded to the GPU (`lib/trips/buildHeatmapFeatures.ts`).
- Route and checkpoint data is built once per trip. Selecting a route changes style expressions, not data.
- The slider's state lives in its own context (`useTripForecastContext`), so dragging it re-renders the
  map layers and the panel only, not the sidebar.
- The heatmap radius scales with zoom from the API's grid spacing, so cells always blend into one
  surface (`lib/trips/getHeatmapRadius.ts`).

## Project layout

The structure is feature based: each folder is split by feature (`trips`) plus `shared` for anything
generic.

```
src/
  app/            App shell (providers) and globals.css with every design token
  components/
    ui/           Small building blocks: Button, Input, Slider, SegmentedControl ...
    shared/       Generic pieces used across features (FormField, EmptyView)
    trips/        The planner: form, results, map layers, forecast panel
  contexts/       tripsContext: shared state for the sidebar and the map
  hooks/          Reusable hooks (debounce, map fitting, forecast playback)
  services/       One file per API call, no error handling inside
  queryOptions/   TanStack Query options per request
  lib/            Feature helpers with no React or network: GeoJSON builders, map math ...
  utils/          Generic helpers: formatting, cn(), getCssVar() ...
  constants/      Query keys, risk levels, map settings, form limits
  types/          Shared TypeScript types (API shapes mirror the Django serializers)
  validations/    zod schema for the trip form
  test/           Test fixtures
```

Conventions:

- One function per file, file named after the function, re-exported from the folder's `index.ts`.
- Functions take named parameters: `formatDuration({ minutes })`.
- Styling uses only the tokens in `src/app/globals.css` (`p-xl`, `gap-md`, `text-text-secondary`,
  `bg-risk-severe` ...). Tailwind's default scales are switched off there. Map layers read the same
  color variables at runtime through `getCssVar()`, so every color lives in one file.
- Fetching goes through `services/` + `queryOptions/`. The plan request is a mutation, since it's started by
  a submit, and its errors show as toasts. Messages written by the API are shown as-is.

## Deploying

`npm run build` produces a static site in `dist/` that can be served by Vercel, Netlify or any static
host. Set `VITE_API_BASE_URL` to the deployed API at build time, and add the site's URL to the API's
`CORS_ALLOWED_ORIGINS`.
