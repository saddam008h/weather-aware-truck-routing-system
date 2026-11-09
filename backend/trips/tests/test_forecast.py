"""Reading one moment out of an hourly forecast."""
from datetime import datetime, timedelta, timezone

from django.test import SimpleTestCase

from trips.domain import HourlyForecast

START = datetime(2026, 1, 5, 0, 0, tzinfo=timezone.utc)


def forecast(hours=6, wind=10.0, rain=0.0, snow=0.0):
    # Values can be a single number for every hour or a list with one per hour.
    def series(value):
        return value if isinstance(value, list) else [value] * hours

    return HourlyForecast(
        first_hour=int(START.timestamp()),
        temperature_f=series(50.0),
        wind_mph=series(wind),
        gust_mph=series(wind),
        rain_in_hr=series(rain),
        snow_in_hr=series(snow),
    )


class ForecastAtTests(SimpleTestCase):
    def test_wind_comes_from_the_closest_hour(self):
        sample = forecast(wind=[10.0, 20.0, 30.0, 40.0, 50.0, 60.0]).at(START + timedelta(hours=2, minutes=40))

        self.assertEqual(sample.wind_mph, 40)

    def test_rain_and_snow_come_from_the_hour_being_driven_through(self):
        # Open-Meteo files the 02:00-03:00 total under 03:00.
        rain = [0.0, 0.0, 0.0, 0.3, 0.0, 0.0]
        snow = [0.0, 0.0, 0.0, 1.2, 0.0, 0.0]
        sample = forecast(rain=rain, snow=snow).at(START + timedelta(hours=2, minutes=10))

        self.assertEqual(sample.rain_in_hr, 0.3)
        self.assertEqual(sample.snow_in_hr, 1.2)

    def test_values_are_rounded_like_the_risk_table(self):
        # 0.01 + 0.09 rain from two sources adds up to 0.09999999999999999 in floats.
        sample = forecast(wind=34.5, rain=0.01 + 0.09, snow=0.45).at(START)

        self.assertEqual(sample.wind_mph, 35)
        self.assertEqual(sample.rain_in_hr, 0.1)
        self.assertEqual(sample.snow_in_hr, 0.5)

    def test_outside_the_forecast_is_none(self):
        self.assertIsNone(forecast().at(START - timedelta(hours=1)))
        # The last hour's total isn't there, since it would be filed under the hour after.
        self.assertIsNone(forecast(hours=6).at(START + timedelta(hours=5)))

    def test_missing_values_are_none(self):
        self.assertIsNone(forecast(wind=[10.0, None, 10.0, 10.0, 10.0, 10.0]).at(START + timedelta(hours=1)))
