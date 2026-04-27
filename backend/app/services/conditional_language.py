"""
FORGED — Conditional Language Service

Provides confidence-based phrase selection for appropriate hedging.
Ensures claims are proportional to statistical certainty.
"""

from dataclasses import dataclass
from typing import Literal


ConfidenceLevel = Literal["high", "moderate", "low", "uncertain"]


@dataclass
class LanguageModifiers:
    """Language modifiers for a given confidence level."""
    level: ConfidenceLevel
    confidence_range: tuple[float, float]

    # Subject phrases (how to refer to the match)
    subject_phrases: list[str]

    # Verb phrases (how to describe the alignment)
    verb_phrases: list[str]

    # Qualifier phrases (how to hedge the statement)
    qualifiers: list[str]

    # Confidence descriptors
    confidence_descriptors: list[str]

    # Recommendation strength
    recommendation_phrases: list[str]


# Confidence level definitions with language modifiers
LANGUAGE_MODIFIERS: dict[ConfidenceLevel, LanguageModifiers] = {
    "high": LanguageModifiers(
        level="high",
        confidence_range=(0.75, 1.0),
        subject_phrases=[
            "Your build strongly aligns with",
            "Your profile shows clear characteristics of",
            "Your measurements closely match",
        ],
        verb_phrases=[
            "reflects the typical profile of",
            "demonstrates strong alignment with",
            "shows significant overlap with",
        ],
        qualifiers=[
            "with strong statistical confidence",
            "based on robust historical patterns",
            "consistent with well-documented trends",
        ],
        confidence_descriptors=[
            "strong match",
            "high confidence alignment",
            "clear archetype signature",
        ],
        recommendation_phrases=[
            "would likely excel in",
            "has strong potential for",
            "shows promising alignment with",
        ],
    ),
    "moderate": LanguageModifiers(
        level="moderate",
        confidence_range=(0.50, 0.75),
        subject_phrases=[
            "Your build could align with",
            "Your profile suggests characteristics of",
            "Your measurements indicate potential alignment with",
        ],
        verb_phrases=[
            "shares some characteristics with",
            "shows moderate overlap with",
            "suggests affinity toward",
        ],
        qualifiers=[
            "though patterns vary across the dataset",
            "with some statistical uncertainty",
            "based on available historical data",
        ],
        confidence_descriptors=[
            "moderate match",
            "reasonable alignment",
            "suggestive pattern",
        ],
        recommendation_phrases=[
            "could potentially thrive in",
            "might find good fit with",
            "shows interesting alignment with",
        ],
    ),
    "low": LanguageModifiers(
        level="low",
        confidence_range=(0.30, 0.50),
        subject_phrases=[
            "Your build may have some affinity with",
            "Your profile shows possible connections to",
            "Your measurements hint at",
        ],
        verb_phrases=[
            "shares some overlapping characteristics with",
            "has loose connections to",
            "shows tentative alignment with",
        ],
        qualifiers=[
            "though the match is not definitive",
            "within a wide range of possibilities",
            "based on limited pattern overlap",
        ],
        confidence_descriptors=[
            "exploratory match",
            "possible alignment",
            "tentative connection",
        ],
        recommendation_phrases=[
            "might explore opportunities in",
            "could consider looking into",
            "shows some characteristics seen in",
        ],
    ),
    "uncertain": LanguageModifiers(
        level="uncertain",
        confidence_range=(0.0, 0.30),
        subject_phrases=[
            "Your build doesn't strongly match any single archetype",
            "Your profile shows a unique combination that spans",
            "Your measurements suggest a versatile profile across",
        ],
        verb_phrases=[
            "falls between multiple archetypes including",
            "shares distributed characteristics with",
            "shows varied alignment across",
        ],
        qualifiers=[
            "making definitive classification difficult",
            "suggesting athletic versatility",
            "with no single dominant pattern",
        ],
        confidence_descriptors=[
            "distributed profile",
            "versatile match",
            "multi-archetype affinity",
        ],
        recommendation_phrases=[
            "might explore a variety of sports including",
            "could find fit across multiple disciplines like",
            "shows characteristics that span",
        ],
    ),
}


def get_confidence_level(confidence: float) -> ConfidenceLevel:
    """Determine confidence level from numeric confidence score."""
    if confidence >= 0.75:
        return "high"
    elif confidence >= 0.50:
        return "moderate"
    elif confidence >= 0.30:
        return "low"
    else:
        return "uncertain"


def get_language_modifiers(confidence: float) -> LanguageModifiers:
    """Get appropriate language modifiers for a confidence level."""
    level = get_confidence_level(confidence)
    return LANGUAGE_MODIFIERS[level]


def get_subject_phrase(confidence: float, index: int = 0) -> str:
    """Get an appropriate subject phrase for the confidence level."""
    modifiers = get_language_modifiers(confidence)
    return modifiers.subject_phrases[index % len(modifiers.subject_phrases)]


def get_verb_phrase(confidence: float, index: int = 0) -> str:
    """Get an appropriate verb phrase for the confidence level."""
    modifiers = get_language_modifiers(confidence)
    return modifiers.verb_phrases[index % len(modifiers.verb_phrases)]


def get_qualifier(confidence: float, index: int = 0) -> str:
    """Get an appropriate qualifier for the confidence level."""
    modifiers = get_language_modifiers(confidence)
    return modifiers.qualifiers[index % len(modifiers.qualifiers)]


def get_confidence_descriptor(confidence: float, index: int = 0) -> str:
    """Get an appropriate confidence descriptor."""
    modifiers = get_language_modifiers(confidence)
    return modifiers.confidence_descriptors[index % len(modifiers.confidence_descriptors)]


def get_recommendation_phrase(confidence: float, index: int = 0) -> str:
    """Get an appropriate recommendation phrase."""
    modifiers = get_language_modifiers(confidence)
    return modifiers.recommendation_phrases[index % len(modifiers.recommendation_phrases)]


def build_conditional_statement(
    confidence: float,
    archetype_name: str,
    trait_description: str = "",
) -> str:
    """
    Build a complete conditional statement based on confidence.

    Args:
        confidence: Match confidence score (0.0 to 1.0)
        archetype_name: Name of the matched archetype
        trait_description: Optional description of relevant traits

    Returns:
        A properly hedged statement about the match
    """
    modifiers = get_language_modifiers(confidence)

    subject = modifiers.subject_phrases[0]
    qualifier = modifiers.qualifiers[0]

    if trait_description:
        return f"{subject} the {archetype_name} archetype. {trait_description}, {qualifier}."
    else:
        return f"{subject} the {archetype_name} archetype, {qualifier}."


def format_confidence_for_display(confidence: float) -> dict:
    """
    Format confidence information for UI display.

    Returns:
        Dictionary with confidence value, level, and display text
    """
    level = get_confidence_level(confidence)
    modifiers = LANGUAGE_MODIFIERS[level]

    # Create display percentage
    percentage = int(confidence * 100)

    # Determine color/styling hint
    style_hints = {
        "high": {"color": "green", "icon": "check-circle"},
        "moderate": {"color": "blue", "icon": "info-circle"},
        "low": {"color": "yellow", "icon": "alert-triangle"},
        "uncertain": {"color": "gray", "icon": "help-circle"},
    }

    return {
        "value": confidence,
        "percentage": percentage,
        "level": level,
        "descriptor": modifiers.confidence_descriptors[0],
        "explanation": _get_confidence_explanation(level),
        "style": style_hints[level],
    }


def _get_confidence_explanation(level: ConfidenceLevel) -> str:
    """Get a user-friendly explanation of the confidence level."""
    explanations = {
        "high": "Your measurements closely match this archetype's typical profile based on Team USA historical data.",
        "moderate": "Your build shares notable characteristics with this archetype, though some variation exists.",
        "low": "This archetype shows some alignment with your profile, but other archetypes may also fit.",
        "uncertain": "Your unique profile spans multiple archetypes, suggesting athletic versatility.",
    }
    return explanations[level]


def enrich_match_result_with_language(match_result: dict) -> dict:
    """
    Enrich a match result with conditional language metadata.

    Adds language_context to the result that the agent can use
    for generating appropriately hedged responses.
    """
    confidence = match_result.get("primary_archetype", {}).get("confidence", 0.5)
    archetype_name = match_result.get("primary_archetype", {}).get("name", "Unknown")

    modifiers = get_language_modifiers(confidence)

    match_result["language_context"] = {
        "confidence_level": modifiers.level,
        "confidence_range": modifiers.confidence_range,
        "suggested_phrases": {
            "subject": modifiers.subject_phrases,
            "verb": modifiers.verb_phrases,
            "qualifier": modifiers.qualifiers,
            "recommendation": modifiers.recommendation_phrases,
        },
        "opening_statement": build_conditional_statement(
            confidence, archetype_name
        ),
        "confidence_display": format_confidence_for_display(confidence),
    }

    return match_result


# ══════════════════════════════════════════════════════════════════════════════
# PROMPT ENHANCEMENT
# ══════════════════════════════════════════════════════════════════════════════

def get_confidence_aware_prompt_injection(confidence: float) -> str:
    """
    Generate prompt text that instructs the model on appropriate hedging.

    This gets injected into prompts to ensure Gemini uses appropriate language.
    """
    level = get_confidence_level(confidence)
    modifiers = LANGUAGE_MODIFIERS[level]

    if level == "high":
        return f"""
CONFIDENCE LEVEL: HIGH ({int(confidence * 100)}%)
Language guidance: Use confident but still conditional phrasing. Phrases like:
- {modifiers.subject_phrases[0]}
- {modifiers.recommendation_phrases[0]}
Avoid absolute statements, but convey strong alignment."""

    elif level == "moderate":
        return f"""
CONFIDENCE LEVEL: MODERATE ({int(confidence * 100)}%)
Language guidance: Use balanced conditional phrasing that acknowledges uncertainty. Phrases like:
- {modifiers.subject_phrases[0]}
- {modifiers.recommendation_phrases[0]}
Present the match as one strong possibility among others."""

    elif level == "low":
        return f"""
CONFIDENCE LEVEL: LOW ({int(confidence * 100)}%)
Language guidance: Use exploratory, tentative phrasing. Phrases like:
- {modifiers.subject_phrases[0]}
- {modifiers.recommendation_phrases[0]}
Emphasize this is one of several possible alignments."""

    else:  # uncertain
        return f"""
CONFIDENCE LEVEL: UNCERTAIN ({int(confidence * 100)}%)
Language guidance: Frame as a versatile, multi-archetype profile. Phrases like:
- {modifiers.subject_phrases[0]}
- {modifiers.recommendation_phrases[0]}
Highlight the user's unique positioning across multiple archetypes."""
