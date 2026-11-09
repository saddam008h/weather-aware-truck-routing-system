"""Django settings. Anything that differs between laptop and server comes from env vars (or .env)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Pull variables from backend/.env into os.environ, if the file exists.
load_dotenv(BASE_DIR / ".env")


def env_list(name, default=""):
    # "a.com, b.com" -> ["a.com", "b.com"]
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-local-dev-only")
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"
# Hostnames Django will answer to. Anything else gets a 400.
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

# Apps Django loads at startup. "trips" is ours; the rest are libraries.
INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "corsheaders",  # lets the React app on another port call this API
    "rest_framework",  # Django REST Framework: views/serializers for JSON APIs
    "drf_spectacular",  # generates the OpenAPI schema + Swagger UI
    "trips",
]

# Every request and response passes through these, top to bottom and back.
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.gzip.GZipMiddleware",  # route + heatmap JSON compresses ~10x
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# Only needed so the Swagger UI page (an HTML template from drf_spectacular) can render.
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": ["django.template.context_processors.request"]},
    },
]

# The API is stateless: nothing is stored, so no database is configured.
DATABASES = {}

# In-memory cache for geocoding, routes and forecasts. Each server process has its own.
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "truck-routing",
    }
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = False
USE_TZ = True  # datetimes are timezone-aware everywhere

STATIC_URL = "static/"

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
# Behind a proxy (Render, Railway, ...) the original scheme comes in this header.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

REST_FRAMEWORK = {
    # JSON in, JSON out. Swagger replaces DRF's browsable HTML pages.
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    # Public API with no user accounts, so no login or permission checks.
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
    # Datetimes are always rendered in UTC (TIME_ZONE above); seconds are plenty.
    "DATETIME_FORMAT": "%Y-%m-%dT%H:%M:%SZ",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Rate limits per client IP. Each view picks a bucket with `throttle_scope`.
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        # Each trip request fans out to several free third-party APIs.
        "trips": os.environ.get("TRIPS_RATE_LIMIT", "30/min"),
        "geocode": os.environ.get("GEOCODE_RATE_LIMIT", "60/min"),
    },
}

# Swagger / OpenAPI docs, served at /api/docs/
SPECTACULAR_SETTINGS = {
    "TITLE": "Weather-Aware Truck Routing API",
    "DESCRIPTION": (
        "Plans truck routes, samples the forecast at each checkpoint for the time the "
        "truck will actually be there, and recommends the safest option."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    # Risk levels show up in several fields; document them once as a single enum.
    "ENUM_NAME_OVERRIDES": {"RiskLevelEnum": "trips.serializers.fields.RISK_LEVEL_CHOICES"},
}

# Third-party services. All of them work without an API key.
OSRM_URL = os.environ.get("OSRM_URL", "https://router.project-osrm.org")
OPEN_METEO_URL = os.environ.get("OPEN_METEO_URL", "https://api.open-meteo.com/v1/forecast")
PHOTON_URL = os.environ.get("PHOTON_URL", "https://photon.komoot.io")

HTTP_TIMEOUT_SECONDS = 20
# Public OSM-based services ask clients to identify themselves.
HTTP_USER_AGENT = os.environ.get("HTTP_USER_AGENT", "weather-aware-truck-routing/1.0")

# How long cached lookups stay fresh. Forecasts change the fastest.
ROUTE_CACHE_SECONDS = 60 * 60
WEATHER_CACHE_SECONDS = 30 * 60
GEOCODE_CACHE_SECONDS = 24 * 60 * 60
