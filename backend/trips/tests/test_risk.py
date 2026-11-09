"""The risk table and load rules from the brief, checked right at each band's edges."""
from django.test import SimpleTestCase

from trips.domain import RiskLevel, WeatherSample
from trips.services.risk import assess, rain_level, snow_level, wind_level

LOW, MODERATE, HIGH, SEVERE, NO_TRAVEL = RiskLevel


# Calm weather unless a test says otherwise.
def weather(wind=0.0, rain=0.0, snow=0.0):
    return WeatherSample(temperature_f=50, wind_mph=wind, gust_mph=wind, rain_in_hr=rain, snow_in_hr=snow)


class WindTests(SimpleTestCase):
    def test_bands_for_a_light_load(self):
        cases = [
            (24.9, LOW), (25, MODERATE), (34.9, MODERATE), (35, HIGH),
            (44.9, HIGH), (45, SEVERE), (54.9, SEVERE), (55, NO_TRAVEL),
        ]
        for mph, expected in cases:
            with self.subTest(mph=mph):
                self.assertEqual(wind_level(mph, load_lbs=10_000), expected)

    def test_55_mph_is_no_travel_for_any_load(self):
        self.assertEqual(wind_level(55, load_lbs=0), NO_TRAVEL)

    def test_45_to_54_mph_over_30k_lbs_is_no_travel(self):
        self.assertEqual(wind_level(45, load_lbs=30_001), NO_TRAVEL)
        self.assertEqual(wind_level(54, load_lbs=45_000), NO_TRAVEL)
        self.assertEqual(wind_level(50, load_lbs=30_000), SEVERE)

    def test_35_to_44_mph_over_40k_lbs_is_severe(self):
        self.assertEqual(wind_level(35, load_lbs=40_001), SEVERE)
        self.assertEqual(wind_level(44, load_lbs=40_001), SEVERE)
        self.assertEqual(wind_level(40, load_lbs=40_000), HIGH)

    def test_load_does_not_change_lower_wind_bands(self):
        self.assertEqual(wind_level(30, load_lbs=80_000), MODERATE)
        self.assertEqual(wind_level(10, load_lbs=80_000), LOW)


class PrecipitationTests(SimpleTestCase):
    def test_rain_bands(self):
        cases = [
            (0.09, LOW), (0.10, MODERATE), (0.24, MODERATE), (0.25, HIGH),
            (0.49, HIGH), (0.50, SEVERE), (1.00, SEVERE), (1.01, NO_TRAVEL),
        ]
        for inches, expected in cases:
            with self.subTest(inches=inches):
                self.assertEqual(rain_level(inches), expected)

    def test_snow_bands(self):
        cases = [
            (0.49, LOW), (0.5, MODERATE), (0.99, MODERATE), (1.0, HIGH),
            (1.99, HIGH), (2.0, SEVERE), (3.0, SEVERE), (3.01, NO_TRAVEL),
        ]
        for inches, expected in cases:
            with self.subTest(inches=inches):
                self.assertEqual(snow_level(inches), expected)


class AssessTests(SimpleTestCase):
    def test_overall_level_is_the_worst_factor(self):
        result = assess(weather(wind=26, rain=0.3, snow=0.6), load_lbs=10_000)
        self.assertEqual(result.wind, MODERATE)
        self.assertEqual(result.rain, HIGH)
        self.assertEqual(result.snow, MODERATE)
        self.assertEqual(result.level, HIGH)

    def test_flags_when_the_load_made_it_worse(self):
        heavy = assess(weather(wind=38), load_lbs=42_000)
        light = assess(weather(wind=38), load_lbs=20_000)

        self.assertEqual(heavy.level, SEVERE)
        self.assertTrue(heavy.load_adjusted)
        self.assertEqual(light.level, HIGH)
        self.assertFalse(light.load_adjusted)
