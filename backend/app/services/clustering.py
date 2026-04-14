"""
Archetype matching via Euclidean distance against centroid vectors.
"""

import math

from app.models.schemas import MatchRequest
from app.models.archetypes import ARCHETYPES, ArchetypeCentroid


def _normalize(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0–1 range."""
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def _compute_distance(
    user_height: float,
    user_weight: float,
    user_bmi: float,
    centroid: ArchetypeCentroid,
) -> float:
    """Euclidean distance in normalized feature space."""
    # Normalization ranges based on human athletic population
    h = _normalize(user_height, 150, 210) - _normalize(centroid.mean_height_cm, 150, 210)
    w = _normalize(user_weight, 45, 130) - _normalize(centroid.mean_weight_kg, 45, 130)
    b = _normalize(user_bmi, 17, 35) - _normalize(centroid.mean_bmi, 17, 35)

    return math.sqrt(h ** 2 + w ** 2 + b ** 2)


def compute_archetype_match(req: MatchRequest) -> dict:
    """
    Find the closest archetype(s) to the user's biometrics.
    Returns match data including distances for Digital Mirror visualization.
    """
    user_bmi = req.weight_kg / ((req.height_cm / 100) ** 2)

    distances = []
    for archetype in ARCHETYPES:
        dist = _compute_distance(req.height_cm, req.weight_kg, user_bmi, archetype)
        distances.append((archetype, dist))

    distances.sort(key=lambda x: x[1])

    best_match = distances[0]
    max_dist = max(d for _, d in distances)
    confidence = 1.0 - (best_match[1] / max_dist) if max_dist > 0 else 1.0

    # Build centroid positions for Digital Mirror (normalized 0-1)
    centroid_positions = {}
    for archetype in ARCHETYPES:
        x = _normalize(archetype.mean_height_cm, 150, 210)
        y = _normalize(archetype.mean_weight_kg, 45, 130)
        centroid_positions[archetype.name] = [round(x, 3), round(y, 3)]

    user_x = _normalize(req.height_cm, 150, 210)
    user_y = _normalize(req.weight_kg, 45, 130)

    return {
        "archetype": best_match[0],
        "confidence": round(confidence, 3),
        "all_distances": [(a.name, round(d, 4)) for a, d in distances],
        "user_position": [round(user_x, 3), round(user_y, 3)],
        "centroid_positions": centroid_positions,
        "user_bmi": round(user_bmi, 1),
    }
