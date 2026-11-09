"""Checkpoint spacing and ETAs, on a simple straight route where the answers are easy to work out."""
from datetime import datetime, timedelta, timezone

from django.test import SimpleTestCase

from trips.domain import Route
from trips.geo import METERS_PER_MILE, cumulative_miles
from trips.services.checkpoints import checkpoint_miles, sample_checkpoints

DEPARTURE = datetime(2026, 1, 5, 8, 0, tzinfo=timezone.utc)


def straight_route(segment_durations=None, duration_s=3 * 3600):
    # Two one-degree hops due north: about 69 miles each.
    points = [(40.0, -100.0), (41.0, -100.0), (42.0, -100.0)]
    miles = cumulative_miles(points)[-1]
    return Route(
        points=points,
        distance_m=miles * METERS_PER_MILE,
        duration_s=duration_s,
        segment_durations=segment_durations,
    )


class CheckpointMilesTests(SimpleTestCase):
    def test_includes_origin_and_destination(self):
        self.assertEqual(checkpoint_miles(60, 25), [0, 25, 50, 60])

    def test_short_trip_still_gets_both_ends(self):
        self.assertEqual(checkpoint_miles(10, 25), [0, 10])

    def test_exact_multiple_does_not_duplicate_the_end(self):
        self.assertEqual(checkpoint_miles(100, 25), [0, 25, 50, 75, 100])

    def test_drops_a_checkpoint_right_before_the_destination(self):
        self.assertEqual(checkpoint_miles(100.2, 25), [0, 25, 50, 75, 100.2])


class SampleCheckpointsTests(SimpleTestCase):
    def test_positions_follow_the_route(self):
        checkpoints = sample_checkpoints(straight_route(), 10, DEPARTURE)

        first, second, last = checkpoints[0], checkpoints[1], checkpoints[-1]
        self.assertEqual((first.lat, first.lon), (40.0, -100.0))
        self.assertAlmostEqual(second.lat, 40.0 + 10 / 69.09, places=2)
        self.assertAlmostEqual(last.lat, 42.0)
        self.assertAlmostEqual(last.mile, 138.2, places=0)

    def test_eta_uses_per_segment_timing(self):
        # First hop takes 1h, the second 2h, so mile 100 (31 miles into the
        # slow hop) is reached at 1h + 2h * 31/69.
        route = straight_route(segment_durations=[3600, 7200])
        checkpoints = sample_checkpoints(route, 50, DEPARTURE)
        at_100 = next(cp for cp in checkpoints if cp.mile == 100)

        expected = DEPARTURE + timedelta(hours=1 + 2 * (100 - 69.09) / 69.09)
        self.assertAlmostEqual(at_100.eta.timestamp(), expected.timestamp(), delta=60)
        self.assertEqual(checkpoints[-1].eta, DEPARTURE + timedelta(hours=3))

    def test_eta_falls_back_to_average_speed(self):
        checkpoints = sample_checkpoints(straight_route(), 50, DEPARTURE)
        at_50 = next(cp for cp in checkpoints if cp.mile == 50)

        share = 50 / checkpoints[-1].mile
        expected = DEPARTURE + timedelta(seconds=3 * 3600 * share)
        self.assertAlmostEqual(at_50.eta.timestamp(), expected.timestamp(), delta=1)
