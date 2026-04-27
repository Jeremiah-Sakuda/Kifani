"""
FORGED — Service Layer

Core services for the archetype matching agent.
"""

from app.services.clustering import compute_archetype_match, format_sport_matches
from app.services.conditional_language import (
    get_confidence_level,
    get_language_modifiers,
    enrich_match_result_with_language,
    get_confidence_aware_prompt_injection,
    format_confidence_for_display,
)

__all__ = [
    "compute_archetype_match",
    "format_sport_matches",
    "get_confidence_level",
    "get_language_modifiers",
    "enrich_match_result_with_language",
    "get_confidence_aware_prompt_injection",
    "format_confidence_for_display",
]
