# Weather-Aware Truck Routing

Helps a truck driver pick the safest route for a trip, based on the weather the truck will actually drive
into, the load weight and the travel time.

Enter an origin, a destination, a departure time and the load weight. The app finds up to three routes,
checks the forecast every 10, 25 or 50 miles at the time the truck reaches each point, scores the risk
using the wind / rain / snow thresholds and load rules from the brief, and recommends a route. Everything
is shown on a map, along with a 0–48 hour weather heatmap of the trip corridor.

| Folder                            | What it is                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`backend/`](backend/README.md)   | Django REST API: routing, forecasts, risk rules, recommendation, heatmap. Swagger docs at `/api/docs/`. |
| [`frontend/`](frontend/README.md) | React app (Vite, TypeScript, MapLibre): trip form, route cards, map, forecast slider.                   |

Routing (OSRM), weather (Open-Meteo), geocoding (Photon) and map tiles (OpenFreeMap) all come from free
services that need no API key.

## Running it locally

Backend (Python 3.12):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py runserver          # http://localhost:8000/api/docs/
```

Frontend (Node 22), in a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                         # http://localhost:5173
```

Before planning a real trip, "Try a demo trip with storms" loads a ready-made trip with scripted bad
weather, which is handy when the real forecast is calm.

Tests: `python manage.py test` in `backend/`, `npm test` in `frontend/`.

## Deploying on Vercel

Both apps deploy as two Vercel projects from this repo. Vercel detects Django and Vite on its own.

**1. API project**

- New Project → import this repo → Root Directory: `backend`
- Environment variables:

  | Name                   | Value                                                                                                 |
  | ---------------------- | ----------------------------------------------------------------------------------------------------- |
  | `DJANGO_DEBUG`         | `false`                                                                                               |
  | `DJANGO_SECRET_KEY`    | a long random string (`python3 -c "import secrets; print(secrets.token_urlsafe(50))"`)                |
  | `DJANGO_ALLOWED_HOSTS` | the API's domain, e.g. `your-api.vercel.app`                                                          |
  | `CORS_ALLOWED_ORIGINS` | the frontend's URL, e.g. `https://your-app.vercel.app` (set after step 2)                             |
  | `HTTP_USER_AGENT`      | `weather-aware-truck-routing/1.0 (+https://github.com/saddam008h/weather-aware-truck-routing-system)` |

- Check `https://your-api.vercel.app/api/docs/` loads.

**2. Web project**

- New Project → import this repo again → Root Directory: `frontend`
- Environment variable: `VITE_API_BASE_URL` = `https://your-api.vercel.app` (no trailing slash)

**3. Connect them**

Put the web project's URL into the API project's `CORS_ALLOWED_ORIGINS` and redeploy the API.

Notes:

- `VITE_API_BASE_URL` is read at build time, so redeploy the frontend if the API's address changes.
- The API caches routes and forecasts in memory. Serverless instances don't always share it, so the
  heatmap request after a plan can occasionally take a few seconds longer while routes are looked up again.
