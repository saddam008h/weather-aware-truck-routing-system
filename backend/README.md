# Weather-Aware Truck Routing — API

Django REST API behind the truck routing app. Given an origin, destination,
departure time and load weight it:

1. finds up to three routes,
2. drops a checkpoint every 10, 25 or 50 miles and works out when the truck gets there,
3. looks up the forecast for each checkpoint *at that ETA*,
4. scores the weather risk using the brief's thresholds and load rules,
5. recommends a route, and
6. builds a 0–48 hour weather grid along the corridor for the map heatmap.

There's no database. Every request is computed on the fly from three free,
keyless APIs, with short-lived caching in memory:

| What        | Service                                    |
|-------------|--------------------------------------------|
| Routing     | [OSRM](https://project-osrm.org) public server |
| Weather     | [Open-Meteo](https://open-meteo.com) hourly forecast |
| Geocoding   | [Photon](https://photon.komoot.io) (OpenStreetMap) |

## Running it

Needs Python 3.10+ (developed on 3.12).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py runserver
```

Then open http://localhost:8000/api/docs/ for the Swagger UI. Every endpoint
can be tried from there; the plan and heatmap endpoints come with example bodies.

Tests don't touch the network:

```bash
python manage.py test
```

The frontend's "Try a demo trip" button loads a pre-built Dallas → Chicago trip. It comes from the
normal planner and heatmap code, run with real routes but scripted storms in place of Open-Meteo, so
risky stretches show up whatever the real weather is doing. To rebuild it (for example after changing
the risk rules):

```bash
python manage.py build_demo_trip   # writes frontend/public/demo/*.json
```

## Endpoints

| Method | Path                  | What it does |
|--------|-----------------------|--------------|
| GET    | `/api/geocode/?q=`    | Place suggestions for the search boxes |
| POST   | `/api/trips/plan/`    | Routes, checkpoints, risk and the recommendation |
| POST   | `/api/trips/heatmap/` | Hourly weather/risk grid around the routes, 49 frames (hour 0–48) |
| GET    | `/api/health/`        | Health check |
| GET    | `/api/docs/`          | Swagger UI (`/api/schema/` for the raw OpenAPI file) |

Plan and heatmap take the same body:

```json
{
  "origin": "Dallas, TX",
  "destination": "Chicago, IL",
  "departure_time": "2026-11-10T08:00:00-06:00",
  "load_weight_lbs": 42000,
  "sample_interval_miles": 25
}
```

`origin` / `destination` can be any address or a `"lat,lon"` string (the
frontend sends coordinates once the user picks a suggestion). `departure_time`
defaults to now and can be up to 7 days out.

The heatmap reuses the routes the plan request already found (they're cached
for an hour), so the frontend should call it after the plan comes back.

## How the logic works

### Routes

OSRM is asked for alternatives, but the public server often returns only one or
two. The rest are found by forcing the route through a waypoint pushed off to
the left or right of the straight line between the two cities (10%, 20%, then
30% of the trip length). A detour is thrown away if it:

- takes more than 2x as long as the fastest route (1.5x is preferred),
- shares more than 80% of its road with a route we already have,
- drives into a dead end and back out (the waypoint landed on a spur road), or
- wanders into a third country (e.g. LA to Phoenix through Mexico).

If there genuinely aren't three sensible routes (Seattle to Portland is basically
just I-5) the response has fewer and says so in `warnings`.

### Checkpoints and ETAs

OSRM returns how many seconds each tiny segment of the route takes, so the ETA
at mile 150 reflects slow city stretches and fast interstate ones rather than an
average speed. Those segment times leave out turns, so they're scaled to add up
to the route's duration, which makes the destination's ETA the arrival time.
Checkpoints sit at mile 0, every N miles, and at the destination.

### Weather

Wind and temperature come from the forecast hour closest to each checkpoint's
ETA. Rain and snow are hourly totals, so they come from the hour the truck is
driving through. Lookups are snapped to a 0.1° grid (~7 miles), which is about the
resolution of the forecast models anyway and lets overlapping routes share requests.

Values are rounded to the risk table's precision before they're scored: whole mph,
0.01 in of rain and 0.1 in of snow, with halves rounded up. The app shows them the
same way, so a risk badge always matches the number next to it.

- **Wind** uses the sustained 10 m wind speed. Gusts are returned for context
  but aren't scored, since the brief gives one wind figure.
- **Rain** is Open-Meteo's `rain` + `showers` (in/hr).
- **Snow** is `snowfall` (in/hr).

### Risk

Straight from the brief. Each factor gets a level; the checkpoint takes the worst one.

| Condition | Low      | Moderate  | High      | Severe    | No Travel |
|-----------|----------|-----------|-----------|-----------|-----------|
| Wind (mph)| < 25     | 25–34     | 35–44     | 45–54     | ≥ 55      |
| Rain (in/hr) | < 0.10 | 0.10–0.25 | 0.25–0.50 | 0.50–1.00 | > 1.00 |
| Snow (in/hr) | < 0.5  | 0.5–1.0   | 1.0–2.0   | 2.0–3.0   | > 3.0  |

Load rules on top of wind: 45–54 mph with more than 30,000 lb is No Travel, and
35–44 mph with more than 40,000 lb is Severe. Values that sit exactly on a shared
edge (rain of 0.25) go to the more dangerous band.

### Recommendation

Each checkpoint stands for the stretch of road nearest to it, which gives miles
per risk level for every route. Routes are then compared in this order:

1. fewest **No Travel** miles
2. fewest **Severe** miles
3. fewest **High** miles
4. lowest average risk (distance-weighted, 0–4)
5. shortest travel time

No Travel isn't in the brief's list, but a route through No Travel weather
shouldn't win just because it has fewer Severe miles. Miles are compared to a
tenth of a mile and the average to two decimals, so rounding noise can't beat a
real time saving. The response includes a one-line `recommendation`: when a
slower route wins it says why it beat the fastest one, otherwise what put it
ahead of the runner-up.

Stretches the forecast doesn't reach yet (a long trip leaving days from now) are
counted as unknown. They're left out of the risk miles and the average, and
`warnings` says so.

### Heatmap

Grid cells (about 17 miles across, coarser on very long trips) covering every
route plus one cell either side, kept to about 300 points. All 49 hourly frames come
back in one response so the slider never waits on the network.

## Known limitations

- The public OSRM server routes for cars, not trucks: no height/weight
  restrictions, and durations are car speeds.
- ETAs don't include hours-of-service breaks.
- The free APIs have rate limits (OSRM asks for ~1 request/second, Open-Meteo
  allows 10k location lookups a day). The API throttles itself to 30 trip
  requests a minute per client. For real traffic, point `OSRM_URL` /
  `OPEN_METEO_URL` at a self-hosted or paid instance.
- The cache is in-process, so each gunicorn worker keeps its own.

## Layout

```
config/              Django project: settings and the root URLs
trips/
  domain.py          dataclasses passed between the layers (Route, Checkpoint, ...)
  geo.py             distance, interpolation, line simplification
  exceptions.py      errors that map to HTTP responses
  clients/           thin wrappers around OSRM, Open-Meteo and Photon
  services/          the actual logic
    routes.py          picking three distinct routes
    checkpoints.py     sampling points + ETAs along a route
    weather.py         batched, cached forecast lookups
    risk.py            the risk table and load rules
    ranking.py         risk totals per route and the recommendation
    trip_planner.py    ties the above together for /plan
    heatmap.py         corridor grid for /heatmap
  serializers/       request validation and response shapes (also drive Swagger)
  views/             one small file per endpoint
  tests/
```

## Deploying

Any host that runs a Python web process works. Set `DJANGO_DEBUG=false`, a real
`DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`, then:

```bash
gunicorn config.wsgi --workers 2 --threads 4 --timeout 60
```

Planning a long trip can take several seconds on a cold cache, hence the longer timeout.
