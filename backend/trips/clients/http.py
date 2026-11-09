import logging

import requests
from django.conf import settings

from trips.exceptions import UpstreamServiceError

logger = logging.getLogger(__name__)


def get_json(url: str, params: dict | None = None, *, service: str):
    """GET a JSON document from a third-party API.

    4xx responses are returned as-is because some providers (OSRM, Open-Meteo)
    explain what went wrong in a JSON body, and the caller knows how to read it.
    Network errors, rate limits and 5xx responses become UpstreamServiceError.
    `service` is only used to make error messages readable.
    """
    try:
        response = requests.get(
            url,
            params=params,
            timeout=settings.HTTP_TIMEOUT_SECONDS,
            headers={"User-Agent": settings.HTTP_USER_AGENT},
        )
    except requests.RequestException as exc:
        # DNS failure, timeout, connection refused, ...
        logger.warning("%s request failed: %s", service, exc)
        raise UpstreamServiceError(f"{service} service is unreachable right now.") from exc

    if response.status_code == 429:
        raise UpstreamServiceError(f"{service} service is rate limiting us. Try again in a minute.")
    if response.status_code >= 500:
        logger.warning("%s returned %s", service, response.status_code)
        raise UpstreamServiceError(f"{service} service is having problems right now.")

    try:
        return response.json()
    except ValueError as exc:
        # e.g. an HTML error page from a proxy in front of the API
        raise UpstreamServiceError(f"{service} service sent back something we couldn't read.") from exc
