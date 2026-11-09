"""Thin wrappers around the third-party APIs.

Each module knows one API's URL format and response shape, and hands back our
own dataclasses from trips.domain so nothing else depends on the raw JSON.
"""
