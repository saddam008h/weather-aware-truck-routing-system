from datetime import datetime, timezone

from django.test import SimpleTestCase

from trips.domain import Checkpoint, PlannedRoute, RiskAssessment, RiskLevel, RiskSummary
from trips.services.ranking import recommend, summarize_risk

LOW, MODERATE, HIGH, SEVERE, NO_TRAVEL = RiskLevel
NOW = datetime(2026, 1, 5, tzinfo=timezone.utc)


# A checkpoint at `mile` with the given risk level (None = no forecast).
def checkpoint(mile, level):
    risk = None if level is None else RiskAssessment(level=level, wind=level, rain=LOW, snow=LOW)
    return Checkpoint(mile=mile, lat=0, lon=0, eta=NOW, risk=risk)


# A route with made-up risk totals, e.g. route(1, minutes=600, severe=30, high=10).
def route(route_id, minutes, average=0.0, **miles):
    by_level = {level: 0.0 for level in RiskLevel}
    for name, value in miles.items():
        by_level[RiskLevel[name.upper()]] = value
    return PlannedRoute(
        id=route_id,
        summary="",
        distance_miles=100,
        duration_minutes=minutes,
        arrival_time=NOW,
        geometry=[],
        checkpoints=[],
        risk=RiskSummary(miles_by_level=by_level, average_score=average, worst_level=LOW),
    )


class SummarizeRiskTests(SimpleTestCase):
    def test_each_checkpoint_covers_the_road_nearest_to_it(self):
        summary = summarize_risk([checkpoint(0, LOW), checkpoint(25, SEVERE), checkpoint(50, LOW)], 50)

        self.assertEqual(summary.miles(LOW), 25)
        self.assertEqual(summary.miles(SEVERE), 25)
        self.assertEqual(summary.worst_level, SEVERE)
        self.assertEqual(summary.average_score, 1.5)

    def test_missing_weather_counts_as_unknown(self):
        summary = summarize_risk([checkpoint(0, HIGH), checkpoint(20, None)], 20)

        self.assertEqual(summary.unknown_miles, 10)
        self.assertEqual(summary.miles(HIGH), 10)
        self.assertEqual(summary.average_score, 2.0)


class RecommendTests(SimpleTestCase):
    def test_fewest_severe_miles_beats_a_faster_route(self):
        fast = route(1, minutes=600, severe=30)
        safe = route(2, minutes=720, high=80)

        best, reason = recommend([fast, safe])

        self.assertIs(best, safe)
        self.assertIn("Severe", reason)

    def test_no_travel_miles_rank_before_severe_miles(self):
        blocked = route(1, minutes=600, no_travel=5)
        stormy = route(2, minutes=600, severe=60)

        best, _ = recommend([blocked, stormy])

        self.assertIs(best, stormy)

    def test_high_miles_then_average_risk(self):
        a = route(1, minutes=600, average=0.2, high=10)
        b = route(2, minutes=650, average=0.9, high=0)
        c = route(3, minutes=700, average=0.5, high=0)

        best, reason = recommend([a, b, c])

        self.assertIs(best, c)
        self.assertIn("average", reason)

    def test_equal_risk_goes_to_the_fastest_route(self):
        slow = route(1, minutes=700, average=0.1)
        fast = route(2, minutes=640, average=0.1)

        best, reason = recommend([slow, fast])

        self.assertIs(best, fast)
        self.assertIn("60 min faster", reason)

    def test_tiny_differences_in_average_risk_are_ignored(self):
        slow = route(1, minutes=700, average=0.101)
        fast = route(2, minutes=600, average=0.104)

        best, _ = recommend([slow, fast])

        self.assertIs(best, fast)
