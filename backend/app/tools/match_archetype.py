"""
Tool 1: match_archetype

Matches user biometric traits to Team USA archetypes using k-means clustering.
Returns ranked archetype probabilities with confidence scores.
"""

from dataclasses import dataclass
from typing import Any

from app.models.archetypes import ARCHETYPES, get_archetype_by_name
from app.services.clustering import compute_archetype_match, format_sport_matches
from app.services.conditional_language import (
    enrich_match_result_with_language,
    get_confidence_aware_prompt_injection,
)
from app.models.schemas import MatchRequest


@dataclass
class MatchArchetypeArgs:
    """Arguments for match_archetype tool."""
    height_cm: float
    weight_kg: float
    arm_span_cm: float | None = None
    activity_preferences: list[str] | None = None


def match_archetype_tool(args: MatchArchetypeArgs) -> dict[str, Any]:
    """
    Match user traits to the 8 Team USA archetypes.

    Uses k-means clustering on normalized biometric vectors.
    Paralympic data is sample-weighted for structural parity.

    Args:
        args: User biometric data including height, weight, optional arm span

    Returns:
        Dictionary containing:
        - primary_archetype: Best match with confidence
        - ranked_archetypes: All 8 archetypes ranked by match strength
        - sport_alignments: Olympic and Paralympic sport mappings
        - user_metrics: Calculated BMI and normalized position
    """
    # Create match request
    req = MatchRequest(
        height_cm=args.height_cm,
        weight_kg=args.weight_kg,
        arm_span_cm=args.arm_span_cm,
        activity_preference=args.activity_preferences,
    )

    # Compute archetype match
    result = compute_archetype_match(req)

    archetype = result["archetype"]
    confidence = result["confidence"]

    # Get sport mappings
    sports = format_sport_matches(archetype, max_olympic=3, max_paralympic=3)

    # Build ranked list of all archetypes
    ranked = []
    for name, distance in result["all_distances"]:
        arch = get_archetype_by_name(name)
        if arch:
            # Convert distance to match strength (inverse)
            max_dist = max(d for _, d in result["all_distances"])
            strength = 1.0 - (distance / max_dist) if max_dist > 0 else 0.5
            ranked.append({
                "name": name,
                "match_strength": round(strength, 3),
                "description": arch.description[:150] + "...",
                "is_paralympic_first": len(arch.sports_olympic) == 0,
            })

    base_result = {
        "primary_archetype": {
            "name": archetype.name,
            "description": archetype.description,
            "historical_context": archetype.historical_context,
            "confidence": confidence,
            "mean_height_cm": archetype.mean_height_cm,
            "mean_weight_kg": archetype.mean_weight_kg,
            "athlete_count": archetype.athlete_count,
        },
        "ranked_archetypes": ranked,
        "sport_alignments": sports,
        "user_metrics": {
            "bmi": result["user_bmi"],
            "position": result["user_position"],
        },
        "centroid_positions": result["centroid_positions"],
    }

    # Enrich with confidence-aware language context
    enriched_result = enrich_match_result_with_language(base_result)

    # Add prompt injection for Gemini
    enriched_result["language_guidance"] = get_confidence_aware_prompt_injection(
        confidence
    )

    return enriched_result


# Tool metadata for ADK registration
TOOL_NAME = "match_archetype"
TOOL_DESCRIPTION = """
Match user biometric traits to Team USA athlete archetypes.

Call this tool when you have user height and weight data and need to determine
their archetype match. Returns ranked probabilities across all 8 archetypes
with confidence scores and sport alignments.

The tool uses k-means clustering on normalized biometric vectors. Paralympic
archetype data is sample-weighted to achieve structural parity despite smaller
sample sizes in the historical record.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "height_cm": {
            "type": "number",
            "description": "User height in centimeters (e.g., 175.5)"
        },
        "weight_kg": {
            "type": "number",
            "description": "User weight in kilograms (e.g., 72.3)"
        },
        "arm_span_cm": {
            "type": "number",
            "description": "Optional arm span in centimeters"
        },
        "activity_preferences": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Optional list of activity preferences (e.g., ['strength', 'endurance'])"
        },
    },
    "required": ["height_cm", "weight_kg"],
}
