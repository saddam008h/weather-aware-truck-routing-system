"""End-to-end API tests with the third-party clients swapped for the fakes in fakes.py."""
from datetime import timedelta
from unittest import mock

from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APISimpleTestCase

from trips.exceptions import UpstreamServiceError
from trips.tests import fakes


FAKES = {
    "trips.clients.osrm.fetch_routes": fakes.fetch_routes,
    "trips.clients.photon.search": fakes.search,
    "trips.clients.photon.country_code": fakes.country_code,
    "trips.clients.open_meteo.fetch_hourly": fakes.fetch_hourly,
}


# APISimpleTestCase is DRF's test case for code that doesn't need a database.
class TripApiTestCase(APISimpleTestCase):
    def setUp(self):
        # Routes and forecasts are cached by location, so start every test clean.
        cache.clear()
        # Patching here (not with a class decorator) so subclasses get the fakes too.
        for target, fake in FAKES.items():
            patcher = mock.patch(target, fake)
            patcher.start()
            self.addCleanup(patcher.stop)

    # A valid request body; each test overrides only the field it cares about.
    def trip(self, **overrides):
        body = {
            "origin": "origin",
            "destination": "destination",
            "load_weight_lbs": 42_000,
            "sample_interval_miles": 10,
        }
        body.update(overrides)
        return body


class PlanTripTests(TripApiTestCase):
    url = reverse("trip-plan")

    def test_returns_three_routes_and_recommends_the_safest(self):
        response = self.client.post(self.url, self.trip(), format="json")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["routes"]), 3)

        straight, north, south = data["routes"]
        # 38 mph wind with a 42,000 lb load is Severe, so the fastest route loses.
        self.assertGreater(straight["risk"]["miles_by_level"]["severe"], 0)
        self.assertGreater(south["risk"]["miles_by_level"]["high"], 0)
        self.assertEqual(north["risk"]["worst_level"], "low")

        self.assertEqual(data["recommended_route_id"], north["id"])
        self.assertTrue(north["is_recommended"])
        # A slower route won, so the reason says why it beat the fastest (windy) one.
        self.assertEqual(data["recommendation"], f"Fewer Severe miles than Route {straight['id']} (0 vs 80).")

    def test_checkpoints_carry_eta_weather_and_risk(self):
        data = self.client.post(self.url, self.trip(), format="json").json()
        checkpoints = data["routes"][0]["checkpoints"]

        self.assertEqual(checkpoints[0]["mile"], 0)
        self.assertEqual([cp["mile"] for cp in checkpoints[:3]], [0, 10, 20])
        etas = [cp["eta"] for cp in checkpoints]
        self.assertEqual(etas, sorted(etas))

        windy = [cp for cp in checkpoints if cp["risk"]["wind"] != "low"]
        self.assertTrue(windy)
        self.assertTrue(all(cp["risk"]["load_adjusted"] for cp in windy))

    def test_lighter_load_lowers_the_wind_risk(self):
        data = self.client.post(self.url, self.trip(load_weight_lbs=20_000), format="json").json()
        straight = data["routes"][0]

        self.assertEqual(straight["risk"]["miles_by_level"]["severe"], 0)
        self.assertGreater(straight["risk"]["miles_by_level"]["high"], 0)

    def test_rejects_a_departure_in_the_past(self):
        past = (timezone.now() - timedelta(days=1)).isoformat()
        response = self.client.post(self.url, self.trip(departure_time=past), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("departure_time", response.json())

    def test_rejects_an_unsupported_interval(self):
        response = self.client.post(self.url, self.trip(sample_interval_miles=15), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("sample_interval_miles", response.json())

    def test_unknown_location_is_a_400(self):
        response = self.client.post(self.url, self.trip(origin="Atlantis"), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("Atlantis", response.json()["detail"])

    def test_coordinates_skip_geocoding(self):
        response = self.client.post(
            self.url, self.trip(origin="40.0,-100.0", destination="40.0,-98.0"), format="json"
        )

        self.assertEqual(response.status_code, 200)

    def test_provider_outage_is_a_502(self):
        with mock.patch("trips.clients.osrm.fetch_routes", side_effect=UpstreamServiceError()):
            response = self.client.post(self.url, self.trip(), format="json")

        self.assertEqual(response.status_code, 502)

    def test_router_returning_no_routes_is_a_422_not_a_crash(self):
        with mock.patch("trips.clients.osrm.fetch_routes", return_value=[]):
            response = self.client.post(self.url, self.trip(), format="json")

        self.assertEqual(response.status_code, 422)

    def test_same_origin_and_destination_is_a_400(self):
        response = self.client.post(self.url, self.trip(destination="40.0,-100.0", origin="40.0,-100.0"), format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("destination", response.json())


class HeatmapTests(TripApiTestCase):
    url = reverse("trip-heatmap")

    def test_returns_49_hourly_frames_over_the_corridor(self):
        response = self.client.post(self.url, self.trip(), format="json")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual([frame["hour"] for frame in data["frames"]], list(range(49)))

        point_count = len(data["points"])
        self.assertGreater(point_count, 0)
        for frame in data["frames"]:
            self.assertEqual(len(frame["risk"]), point_count)
            self.assertEqual(len(frame["wind_mph"]), point_count)

    def test_risk_values_reflect_the_weather(self):
        data = self.client.post(self.url, self.trip(), format="json").json()
        risks = set(data["frames"][0]["risk"])

        self.assertIn(0, risks)
        self.assertIn(3, risks)  # windy strip + heavy load


class GeocodeTests(TripApiTestCase):
    url = reverse("geocode")

    def test_returns_matching_places(self):
        response = self.client.get(self.url, {"q": "origin"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [{"name": "Origin, Kansas", "lat": 40.0, "lon": -100.0}])

    def test_requires_a_query(self):
        self.assertEqual(self.client.get(self.url).status_code, 400)
