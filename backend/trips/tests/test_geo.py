from django.test import SimpleTestCase

from trips.geo import distance_miles, offset_midpoint, overlap_ratio, retraced_miles, simplify


class DistanceTests(SimpleTestCase):
    def test_one_degree_of_latitude(self):
        self.assertAlmostEqual(distance_miles((40, -100), (41, -100)), 69.09, places=1)


class SimplifyTests(SimpleTestCase):
    def test_drops_points_on_a_straight_line(self):
        line = [(0, 0), (0.5, 0.5), (1, 1), (2, 2)]
        self.assertEqual(simplify(line), [(0, 0), (2, 2)])

    def test_keeps_corners(self):
        line = [(0, 0), (0, 0.5), (0, 1), (0.5, 1), (1, 1)]
        self.assertEqual(simplify(line), [(0, 0), (0, 1), (1, 1)])


class OffsetMidpointTests(SimpleTestCase):
    def test_positive_offset_is_left_of_travel(self):
        lat, lon = offset_midpoint((40, -100), (42, -100), 0.2)  # heading north
        self.assertAlmostEqual(lat, 41)
        self.assertLess(lon, -100)  # left of north is west


class OverlapTests(SimpleTestCase):
    def test_same_line_overlaps_fully(self):
        line = [(40, -100), (41, -100)]
        self.assertEqual(overlap_ratio(line, line), 1.0)

    def test_distant_parallel_line_does_not_overlap(self):
        a = [(40, -100), (41, -100)]
        b = [(40, -99), (41, -99)]
        self.assertEqual(overlap_ratio(a, b), 0.0)


class RetracedTests(SimpleTestCase):
    def test_straight_line_never_retraces(self):
        self.assertEqual(retraced_miles([(40, -100), (41, -100)]), 0)

    def test_out_and_back_spur_is_detected(self):
        # 69 miles north, 20 miles back south along the same road, then east.
        spur = [(40, -100), (41, -100), (40.71, -100), (40.71, -99)]
        self.assertGreater(retraced_miles(spur), 10)
