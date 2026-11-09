"""Route risk totals and the recommendation.

Routes are compared on, in order:
  1. miles in No Travel conditions
  2. miles in Severe conditions
  3. miles in High conditions
  4. distance-weighted average risk score
  5. travel time

No Travel is checked first even though the brief starts at "fewest Severe
miles": a route that crosses No Travel weather shouldn't beat one that only
has Severe stretches.
"""
from trips.domain import Checkpoint, PlannedRoute, RiskLevel, RiskSummary


def summarize_risk(checkpoints: list[Checkpoint], total_miles: float) -> RiskSummary:
    """Each checkpoint speaks for the stretch of road closest to it."""
    miles_by_level = {level: 0.0 for level in RiskLevel}
    unknown_miles = 0.0
    weighted_score = 0.0
    worst = RiskLevel.LOW

    for i, checkpoint in enumerate(checkpoints):
        # The stretch runs from halfway back to the previous checkpoint to
        # halfway on to the next one (or to the route's ends).
        start = 0.0 if i == 0 else (checkpoints[i - 1].mile + checkpoint.mile) / 2
        end = total_miles if i == len(checkpoints) - 1 else (checkpoint.mile + checkpoints[i + 1].mile) / 2
        stretch = end - start

        if checkpoint.risk is None:
            unknown_miles += stretch
            continue

        level = checkpoint.risk.level
        miles_by_level[level] += stretch
        weighted_score += level * stretch
        worst = max(worst, level)

    # Unknown stretches are left out of the average rather than counted as safe.
    known_miles = total_miles - unknown_miles
    return RiskSummary(
        miles_by_level=miles_by_level,
        average_score=weighted_score / known_miles if known_miles > 0 else 0.0,
        worst_level=worst,
        unknown_miles=unknown_miles,
    )


def rank_key(route: PlannedRoute) -> tuple:
    # Python compares tuples item by item, which gives exactly the
    # "first criterion, then the next as a tie-breaker" order above.
    # Rounded so that a few hundredths of a mile don't outweigh an hour of driving.
    return (
        round(route.risk.miles(RiskLevel.NO_TRAVEL), 1),
        round(route.risk.miles(RiskLevel.SEVERE), 1),
        round(route.risk.miles(RiskLevel.HIGH), 1),
        round(route.risk.average_score, 2),
        route.duration_minutes,
    )


def recommend(routes: list[PlannedRoute]) -> tuple[PlannedRoute, str]:
    """The best route and a one-line reason it beat the runner-up."""
    ranked = sorted(routes, key=rank_key)
    best = ranked[0]
    if len(ranked) == 1:
        return best, "Only one route was found."
    return best, _explain(best, ranked[1])


def _explain(best: PlannedRoute, runner_up: PlannedRoute) -> str:
    # The first criterion where the two routes differ is the one that decided it.
    ours, theirs = rank_key(best), rank_key(runner_up)
    other = f"Route {runner_up.id}"

    if ours[0] != theirs[0]:
        return f"Fewest miles in No Travel conditions ({ours[0]:g} vs {theirs[0]:g} on {other})."
    if ours[1] != theirs[1]:
        return f"Fewest Severe miles ({ours[1]:g} vs {theirs[1]:g} on {other})."
    if ours[2] != theirs[2]:
        return f"Fewest High-risk miles ({ours[2]:g} vs {theirs[2]:g} on {other})."
    if ours[3] != theirs[3]:
        return f"Lowest average weather risk ({ours[3]:.2f} vs {theirs[3]:.2f} on {other})."

    saved = round(theirs[4] - ours[4])
    if saved > 0:
        return f"Weather risk is the same as {other}, and this route is {saved} min faster."
    return "All routes carry the same weather risk and travel time."
