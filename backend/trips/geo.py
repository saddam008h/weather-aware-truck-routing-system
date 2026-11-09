"""Small geometry helpers for working with route lines on a map."""
import math
from bisect import bisect_right

from trips.domain import Point

EARTH_RADIUS_MILES = 3958.8
METERS_PER_MILE = 1609.344


def distance_miles(a: Point, b: Point) -> float:
    """Great-circle (haversine) distance between two points."""
    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
    h = (
        math.sin((lat2 - lat1) / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    )
    return 2 * EARTH_RADIUS_MILES * math.asin(math.sqrt(h))


def cumulative_miles(points: list[Point]) -> list[float]:
    """Running distance from the start of the line to each point (first value is 0)."""
    totals = [0.0]
    for previous, current in zip(points, points[1:]):
        totals.append(totals[-1] + distance_miles(previous, current))
    return totals


def locate(miles: list[float], target: float) -> tuple[int, float]:
    """Find the segment that contains `target` and how far along it we are (0..1).

    `miles` is the running total from cumulative_miles(). Returns the index of
    the segment's first point.
    """
    # Binary search, since `miles` is sorted. Clamp so the ends still map to a real segment.
    index = bisect_right(miles, target) - 1
    index = min(max(index, 0), len(miles) - 2)
    span = miles[index + 1] - miles[index]
    fraction = (target - miles[index]) / span if span else 0.0
    return index, min(max(fraction, 0.0), 1.0)


def interpolate(a: Point, b: Point, fraction: float) -> Point:
    # Straight-line interpolation in degrees. Route segments are short enough
    # that the curvature of the earth doesn't matter here.
    return (a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction)


def resample(points: list[Point], step_miles: float) -> list[Point]:
    """Evenly spaced points along a line, `step_miles` apart (end point included)."""
    if len(points) < 2:
        return list(points)

    miles = cumulative_miles(points)
    samples = []
    steps = int(miles[-1] // step_miles)
    for n in range(steps + 1):
        index, fraction = locate(miles, n * step_miles)
        samples.append(interpolate(points[index], points[index + 1], fraction))
    samples.append(points[-1])
    return samples


def offset_midpoint(a: Point, b: Point, ratio: float) -> Point:
    """Midpoint of a-b pushed sideways by `ratio` times the a-b distance.

    Positive ratios go to the left of the a->b direction, negative to the right.
    """
    mid_lat = (a[0] + b[0]) / 2
    mid_lon = (a[1] + b[1]) / 2
    # Work in "latitude degrees" so east/west and north/south are on the same scale.
    lon_scale = math.cos(math.radians(mid_lat))
    east = (b[1] - a[1]) * lon_scale
    north = b[0] - a[0]
    # Rotating the (east, north) direction 90 degrees left gives (-north, east).
    return (mid_lat + east * ratio, mid_lon - north * ratio / lon_scale)


class PointGrid:
    """Buckets points by grid cell so "is anything close to here?" stays cheap.

    `cell` is in degrees and must be at least as large as any radius you query
    with (0.02 degrees is about a mile of longitude at US latitudes).
    """

    def __init__(self, cell: float):
        self.cell = cell
        self.buckets: dict[tuple[int, int], list[tuple[Point, int]]] = {}

    def _key(self, point: Point) -> tuple[int, int]:
        return (int(point[0] // self.cell), int(point[1] // self.cell))

    def add(self, point: Point, tag: int = 0) -> None:
        self.buckets.setdefault(self._key(point), []).append((point, tag))

    def nearby(self, point: Point, radius_miles: float):
        """Tags of stored points within `radius_miles` of `point`."""
        # Only the point's own cell and the 8 around it can hold anything that close.
        row, col = self._key(point)
        for d_row in (-1, 0, 1):
            for d_col in (-1, 0, 1):
                for other, tag in self.buckets.get((row + d_row, col + d_col), ()):
                    if distance_miles(point, other) <= radius_miles:
                        yield tag

    def has_nearby(self, point: Point, radius_miles: float) -> bool:
        return next(self.nearby(point, radius_miles), None) is not None


def overlap_ratio(a: list[Point], b: list[Point], tolerance_miles: float = 1.0) -> float:
    """Share of line `a` that runs within `tolerance_miles` of line `b`."""
    grid = PointGrid(cell=0.05)
    for point in resample(b, 1.0):
        grid.add(point)

    # Walk `a` a mile at a time and count how often `b` is right there.
    a_samples = resample(a, 1.0)
    near = sum(1 for point in a_samples if grid.has_nearby(point, tolerance_miles))
    return near / len(a_samples)


def retraced_miles(points: list[Point], step: float = 0.5) -> float:
    """Miles of a line that double back over ground it already covered.

    Catches out-and-back spurs, e.g. a detour waypoint that snapped onto a dead
    end road. Interchange loops come back to the same spot within a mile or two,
    so only revisits more than 5 miles apart (along the line) count.
    """
    samples = resample(points, step)
    min_gap = int(5 / step)
    grid = PointGrid(cell=0.01)

    retraced = 0
    for index, point in enumerate(samples):
        # Tags are sample indexes, so `index - earlier` is how far back along the line that was.
        if any(index - earlier > min_gap for earlier in grid.nearby(point, 0.3)):
            retraced += 1
        grid.add(point, index)
    return retraced * step


def simplify(points: list[Point], tolerance: float = 0.0005) -> list[Point]:
    """Ramer-Douglas-Peucker line simplification.

    Only used to shrink geometry before it goes to the browser, so measuring in
    raw degrees is fine. 0.0005 degrees is roughly 50 meters.
    """
    if len(points) < 3:
        return list(points)

    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    # Stack of (start, end) stretches still to check. Done with a loop instead of
    # recursion so a 10,000-point route can't hit Python's recursion limit.
    stack = [(0, len(points) - 1)]

    while stack:
        start, end = stack.pop()
        # Find the point that strays furthest from the straight start-end line.
        farthest, farthest_distance = None, tolerance
        for i in range(start + 1, end):
            distance = _distance_to_segment(points[i], points[start], points[end])
            if distance > farthest_distance:
                farthest, farthest_distance = i, distance
        # If it strays more than the tolerance it's a real bend: keep it and check both halves.
        if farthest is not None:
            keep[farthest] = True
            stack.append((start, farthest))
            stack.append((farthest, end))

    return [point for point, kept in zip(points, keep) if kept]


def _distance_to_segment(p: Point, a: Point, b: Point) -> float:
    # Project p onto the a-b segment (t = 0 at a, 1 at b) and measure to that spot.
    dy, dx = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    t = ((p[0] - a[0]) * dy + (p[1] - a[1]) * dx) / (dx * dx + dy * dy)
    t = min(max(t, 0.0), 1.0)
    return math.hypot(p[0] - (a[0] + t * dy), p[1] - (a[1] + t * dx))
