"""Errors the services can raise.

They extend DRF's APIException, so DRF turns them into a JSON response like
{"detail": "..."} with the status code below. Views don't need try/except.
"""
from rest_framework import status
from rest_framework.exceptions import APIException


# OSRM, Open-Meteo or Photon is down, slow or rate limiting us.
class UpstreamServiceError(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "A routing or weather provider is unavailable right now. Please try again."
    default_code = "upstream_unavailable"


# The user typed something we couldn't geocode.
class LocationNotFound(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Couldn't find that location."
    default_code = "location_not_found"


# Both places exist but no road connects them (e.g. Honolulu to LA).
class NoRouteFound(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_detail = "There is no drivable route between these locations."
    default_code = "no_route"
