"""
FORGED — BigQuery ML integration for data-driven archetype matching.

Uses BQML K-Means model for clustering instead of expert-defined centroids.
This provides data-driven, auditable matching with silhouette scores.

COMPLIANCE: All data filtered to Team USA athletes (NOC='USA') at training time.
"""

import os
import logging
from typing import TypedDict
from google.cloud import bigquery

logger = logging.getLogger(__name__)

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
DATASET = os.getenv("BQ_DATASET", "kifani")
MODEL_NAME = f"{PROJECT_ID}.{DATASET}.archetype_kmeans_v2"

# Fallback to local clustering if BQML unavailable
BQML_ENABLED = os.getenv("BQML_ENABLED", "false").lower() == "true"


class BQMLPrediction(TypedDict):
    """Single cluster prediction from BQML."""
    centroid_id: int
    distance: float


class BQMLMatchResult(TypedDict):
    """Full BQML matching result."""
    primary_centroid: int
    primary_distance: float
    secondary_centroid: int
    secondary_distance: float
    tertiary_centroid: int
    tertiary_distance: float
    confidence: float
    model_used: str


# Sport family mapping for feature engineering
SPORT_FAMILY_MAP = {
    # Strength/combat sports
    "strength": 1, "combat": 1, "weightlifting": 1, "wrestling": 1,
    "judo": 1, "boxing": 1, "powerlifting": 1,
    # Endurance sports
    "endurance": 2, "cardio": 2, "running": 2, "cycling": 2,
    "swimming": 2, "triathlon": 2, "marathon": 2,
    # Precision sports
    "precision": 3, "accuracy": 3, "shooting": 3, "archery": 3,
    "fencing": 3, "equestrian": 3,
    # Coordination sports
    "agility": 4, "gymnastics": 4, "diving": 4, "skating": 4,
    # Team/ball sports
    "team": 5, "basketball": 5, "volleyball": 5, "soccer": 5,
}

# Centroid ID to archetype name mapping
# This must be updated after training the BQML model based on cluster analysis
CENTROID_ARCHETYPE_MAP = {
    0: "Powerhouse",
    1: "Aerobic Engine",
    2: "Precision Athlete",
    3: "Explosive Mover",
    4: "Coordinated Specialist",
    5: "Tactical Endurance",
    6: "Adaptive Power",
    7: "Adaptive Endurance",
}


def _get_client() -> bigquery.Client:
    """Get BigQuery client."""
    return bigquery.Client(project=PROJECT_ID)


def _map_sport_to_family(sport_preference: str | None) -> int:
    """Map sport preference string to family encoding."""
    if not sport_preference:
        return 6  # Default/other
    sport_lower = sport_preference.lower()
    for keyword, family in SPORT_FAMILY_MAP.items():
        if keyword in sport_lower:
            return family
    return 6  # Default/other


def _calculate_confidence(distances: list[float]) -> float:
    """
    Calculate confidence score from cluster distances.

    Uses inverse distance ratio - closer to primary cluster = higher confidence.
    """
    if not distances or len(distances) < 2:
        return 0.5

    min_dist = distances[0]
    max_dist = max(distances)

    if max_dist <= 0:
        return 0.95

    # Confidence based on relative distance
    confidence = 0.5 + 0.5 * (1.0 - min_dist / max_dist)

    # Clamp to reasonable range
    return max(0.20, min(0.98, confidence))


async def predict_archetype_bqml(
    height_cm: float,
    weight_kg: float,
    sport_preference: str | None = None,
    paralympic_boost: bool = False,
) -> BQMLMatchResult:
    """
    Predict archetype using BigQuery ML K-Means model.

    Args:
        height_cm: User's height in centimeters
        weight_kg: User's weight in kilograms
        sport_preference: Optional sport preference for feature weighting
        paralympic_boost: If True, boost Paralympic archetype distances

    Returns:
        BQMLMatchResult with top 3 cluster assignments and confidence
    """
    if not BQML_ENABLED:
        logger.info("BQML disabled, returning fallback result")
        return _fallback_result()

    client = _get_client()

    # Calculate derived features
    bmi = weight_kg / ((height_cm / 100) ** 2)
    sport_family = _map_sport_to_family(sport_preference)
    paralympic_weight = 1.5 if paralympic_boost else 0.0

    query = f"""
    SELECT
      centroid_id,
      distance
    FROM ML.PREDICT(
      MODEL `{MODEL_NAME}`,
      (SELECT
        @height AS height_cm,
        @weight AS weight_kg,
        @bmi AS bmi,
        @sport_family AS sport_family,
        4 AS era_bucket,
        @paralympic_weight AS paralympic_weight
      )
    ).nearest_centroids_distance
    ORDER BY distance
    LIMIT 3
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("height", "FLOAT64", height_cm),
            bigquery.ScalarQueryParameter("weight", "FLOAT64", weight_kg),
            bigquery.ScalarQueryParameter("bmi", "FLOAT64", bmi),
            bigquery.ScalarQueryParameter("sport_family", "INT64", sport_family),
            bigquery.ScalarQueryParameter("paralympic_weight", "FLOAT64", paralympic_weight),
        ]
    )

    try:
        results = client.query(query, job_config=job_config).result()
        predictions = [
            {"centroid_id": row.centroid_id, "distance": row.distance}
            for row in results
        ]

        if len(predictions) < 3:
            logger.warning("BQML returned fewer than 3 predictions, using fallback")
            return _fallback_result()

        distances = [p["distance"] for p in predictions]

        return {
            "primary_centroid": predictions[0]["centroid_id"],
            "primary_distance": predictions[0]["distance"],
            "secondary_centroid": predictions[1]["centroid_id"],
            "secondary_distance": predictions[1]["distance"],
            "tertiary_centroid": predictions[2]["centroid_id"],
            "tertiary_distance": predictions[2]["distance"],
            "confidence": _calculate_confidence(distances),
            "model_used": "bqml_kmeans_v2",
        }

    except Exception as e:
        logger.error(f"BQML prediction failed: {e}")
        return _fallback_result()


def _fallback_result() -> BQMLMatchResult:
    """Return fallback result when BQML is unavailable."""
    return {
        "primary_centroid": 3,  # Explosive Mover (most common)
        "primary_distance": 0.5,
        "secondary_centroid": 1,  # Aerobic Engine
        "secondary_distance": 0.7,
        "tertiary_centroid": 5,  # Tactical Endurance
        "tertiary_distance": 0.9,
        "confidence": 0.5,
        "model_used": "fallback",
    }


def get_archetype_name_from_centroid(centroid_id: int) -> str:
    """Map BQML centroid ID to archetype name."""
    return CENTROID_ARCHETYPE_MAP.get(centroid_id, "Unknown")


async def get_model_evaluation() -> dict:
    """
    Get BQML model evaluation metrics.

    Returns silhouette score, Davies-Bouldin index, and cluster sizes.
    Useful for exposing model quality to judges.
    """
    if not BQML_ENABLED:
        return {"error": "BQML not enabled", "model_used": "fallback"}

    client = _get_client()

    query = f"""
    SELECT *
    FROM ML.EVALUATE(MODEL `{MODEL_NAME}`)
    """

    try:
        results = client.query(query).result()
        metrics = [dict(row) for row in results]

        return {
            "model": MODEL_NAME,
            "metrics": metrics[0] if metrics else {},
            "model_used": "bqml_kmeans_v2",
        }
    except Exception as e:
        logger.error(f"BQML evaluation failed: {e}")
        return {"error": str(e), "model_used": "fallback"}


async def get_cluster_statistics() -> dict:
    """
    Get statistics for each cluster from the BQML model.

    Returns cluster sizes, mean biometrics, and sport distributions.
    """
    if not BQML_ENABLED:
        return {"error": "BQML not enabled", "model_used": "fallback"}

    client = _get_client()

    query = f"""
    SELECT
      centroid_id,
      feature,
      numerical_value
    FROM ML.CENTROIDS(MODEL `{MODEL_NAME}`)
    ORDER BY centroid_id, feature
    """

    try:
        results = client.query(query).result()

        # Group by centroid
        centroids: dict[int, dict] = {}
        for row in results:
            cid = row.centroid_id
            if cid not in centroids:
                centroids[cid] = {
                    "centroid_id": cid,
                    "archetype": get_archetype_name_from_centroid(cid),
                    "features": {},
                }
            centroids[cid]["features"][row.feature] = row.numerical_value

        return {
            "centroids": list(centroids.values()),
            "model_used": "bqml_kmeans_v2",
        }
    except Exception as e:
        logger.error(f"BQML centroid fetch failed: {e}")
        return {"error": str(e), "model_used": "fallback"}
