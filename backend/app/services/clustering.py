"""
FORGED — Archetype matching via weighted Euclidean distance.

Uses sample-weighted distance metrics so Paralympic archetype data
has proportional influence despite smaller sample sizes.
"""

import math
from typing import TypedDict

from app.models.schemas import MatchRequest
from app.models.archetypes import ARCHETYPES, ArchetypeCentroid


class ArchetypeMatchResult(TypedDict):
    """Result of archetype matching computation."""
    archetype: ArchetypeCentroid
    confidence: float
    all_distances: list[tuple[str, float]]
    secondary_archetypes: list[tuple[ArchetypeCentroid, float]]
    user_position: list[float]
    centroid_positions: dict[str, list[float]]
    user_bmi: float


# Normalization ranges based on human athletic population
NORM_HEIGHT_MIN = 140.0
NORM_HEIGHT_MAX = 210.0
NORM_WEIGHT_MIN = 40.0
NORM_WEIGHT_MAX = 140.0
NORM_BMI_MIN = 16.0
NORM_BMI_MAX = 36.0


def _normalize(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0–1 range."""
    if max_val == min_val:
        return 0.5
    clamped = max(min_val, min(max_val, value))
    return (clamped - min_val) / (max_val - min_val)


def _compute_weighted_distance(
    user_height: float,
    user_weight: float,
    user_bmi: float,
    centroid: ArchetypeCentroid,
) -> float:
    """
    Compute weighted Euclidean distance in normalized feature space.

    Uses sample_weight to give Paralympic-first archetypes proportional
    influence despite smaller athlete counts.
    """
    # Normalize user values
    h_user = _normalize(user_height, NORM_HEIGHT_MIN, NORM_HEIGHT_MAX)
    w_user = _normalize(user_weight, NORM_WEIGHT_MIN, NORM_WEIGHT_MAX)
    b_user = _normalize(user_bmi, NORM_BMI_MIN, NORM_BMI_MAX)

    # Normalize centroid values
    h_cent = _normalize(centroid.mean_height_cm, NORM_HEIGHT_MIN, NORM_HEIGHT_MAX)
    w_cent = _normalize(centroid.mean_weight_kg, NORM_WEIGHT_MIN, NORM_WEIGHT_MAX)
    b_cent = _normalize(centroid.mean_bmi, NORM_BMI_MIN, NORM_BMI_MAX)

    # Compute differences
    h_diff = h_user - h_cent
    w_diff = w_user - w_cent
    b_diff = b_user - b_cent

    # Euclidean distance (BMI gets slightly lower weight as it's derived)
    raw_distance = math.sqrt(h_diff ** 2 + w_diff ** 2 + 0.8 * (b_diff ** 2))

    # Apply inverse sample weight — higher weight = appears "closer"
    # This gives Paralympic archetypes more pull for matching users
    weighted_distance = raw_distance / centroid.sample_weight

    return weighted_distance


def compute_archetype_match(req: MatchRequest) -> ArchetypeMatchResult:
    """
    Find the closest archetype(s) to the user's biometrics.

    Returns match data including:
    - Primary archetype with confidence score
    - Secondary archetypes (ranked by distance)
    - User position for Digital Mirror visualization
    - All centroid positions for visualization
    """
    # Calculate user's BMI
    user_bmi = req.weight_kg / ((req.height_cm / 100) ** 2)

    # Compute weighted distances to all archetypes
    distances: list[tuple[ArchetypeCentroid, float]] = []
    for archetype in ARCHETYPES:
        dist = _compute_weighted_distance(
            req.height_cm,
            req.weight_kg,
            user_bmi,
            archetype
        )
        distances.append((archetype, dist))

    # Sort by distance (closest first)
    distances.sort(key=lambda x: x[1])

    # Primary match
    best_match = distances[0]

    # Compute confidence: inverse of relative distance
    # 0 distance = 100% confidence, max distance = ~50% confidence
    max_dist = max(d for _, d in distances)
    min_dist = best_match[1]

    if max_dist > 0:
        # Scale confidence: best match gets high score, worst gets lower
        confidence = 0.5 + 0.5 * (1.0 - min_dist / max_dist)
    else:
        confidence = 1.0

    # Ensure confidence is in reasonable range
    confidence = max(0.55, min(0.98, confidence))

    # Build centroid positions for Digital Mirror visualization
    centroid_positions: dict[str, list[float]] = {}
    for archetype in ARCHETYPES:
        x = _normalize(archetype.mean_height_cm, NORM_HEIGHT_MIN, NORM_HEIGHT_MAX)
        y = _normalize(archetype.mean_weight_kg, NORM_WEIGHT_MIN, NORM_WEIGHT_MAX)
        centroid_positions[archetype.name] = [round(x, 4), round(y, 4)]

    # User position in same normalized space
    user_x = _normalize(req.height_cm, NORM_HEIGHT_MIN, NORM_HEIGHT_MAX)
    user_y = _normalize(req.weight_kg, NORM_WEIGHT_MIN, NORM_WEIGHT_MAX)

    # Secondary archetypes (2nd and 3rd closest)
    secondary = [
        (arch, round(1.0 - dist / max_dist, 3) if max_dist > 0 else 0.5)
        for arch, dist in distances[1:4]
    ]

    return {
        "archetype": best_match[0],
        "confidence": round(confidence, 3),
        "all_distances": [(a.name, round(d, 4)) for a, d in distances],
        "secondary_archetypes": secondary,
        "user_position": [round(user_x, 4), round(user_y, 4)],
        "centroid_positions": centroid_positions,
        "user_bmi": round(user_bmi, 1),
    }


def format_sport_matches(
    archetype: ArchetypeCentroid,
    include_olympic: bool = True,
    include_paralympic: bool = True,
    max_olympic: int = 3,
    max_paralympic: int = 2,
) -> dict[str, list[dict]]:
    """
    Format sport matches for API response.

    Extracts the top N sports from each category with full mapping data.
    """
    result: dict[str, list[dict]] = {
        "olympic_sports": [],
        "paralympic_sports": [],
    }

    if include_olympic:
        for mapping in archetype.sports_olympic[:max_olympic]:
            result["olympic_sports"].append({
                "sport": mapping.sport,
                "event": ", ".join(mapping.events[:2]),  # First 2 events
                "why": mapping.why,
                "classification": mapping.classification,
                "classification_explainer": mapping.classification_explainer,
            })

    if include_paralympic:
        for mapping in archetype.sports_paralympic[:max_paralympic]:
            result["paralympic_sports"].append({
                "sport": mapping.sport,
                "event": ", ".join(mapping.events[:2]),  # First 2 events
                "why": mapping.why,
                "classification": mapping.classification,
                "classification_explainer": mapping.classification_explainer,
            })

    return result


def get_historical_context(archetype: ArchetypeCentroid) -> str:
    """Get the historical context narrative for an archetype."""
    return archetype.historical_context
