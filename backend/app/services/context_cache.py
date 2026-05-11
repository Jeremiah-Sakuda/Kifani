"""
FORGED — Context Caching Service

Caches the 120-year archetype corpus and Paralympic classification taxonomy
using Vertex AI's explicit context caching for production efficiency.
"""

import os
from typing import Any
from functools import lru_cache

from google.cloud import aiplatform
from vertexai.generative_models import Part
from vertexai.preview import caching as vertex_caching

from app.models.archetypes import ARCHETYPES
from app.tools.classify_paralympic import CLASSIFICATIONS


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
CACHE_DISPLAY_NAME = "forged-archetype-corpus"


def build_archetype_corpus() -> str:
    """
    Build the archetype corpus string for caching.

    Returns a structured text representation of all 8 archetypes
    with their centroids, sport mappings, and historical context.
    """
    corpus_parts = [
        "# FORGED Archetype Corpus",
        "",
        "## Overview",
        "8 archetypes derived from 120 years of Team USA athlete data:",
        "- 14,218 US Olympic athlete records (1896–2024)",
        "- 2,847 US Paralympic athlete records (1960–2024)",
        "- Paralympic data is sample-weighted for structural parity",
        "",
    ]

    for arch in ARCHETYPES:
        corpus_parts.append(f"## {arch.name}")
        corpus_parts.append("")
        corpus_parts.append(f"**Description:** {arch.description}")
        corpus_parts.append("")
        corpus_parts.append("**Biometric Centroid:**")
        corpus_parts.append(f"- Height: {arch.mean_height_cm} cm (σ={arch.std_height_cm})")
        corpus_parts.append(f"- Weight: {arch.mean_weight_kg} kg (σ={arch.std_weight_kg})")
        corpus_parts.append(f"- BMI: {arch.mean_bmi}")
        corpus_parts.append(f"- Sample Size: {arch.athlete_count} athletes")
        corpus_parts.append(f"- Sample Weight: {arch.sample_weight}")
        corpus_parts.append("")
        corpus_parts.append(f"**Historical Context:** {arch.historical_context}")
        corpus_parts.append("")

        if arch.insight:
            corpus_parts.append(f"**Insight:** {arch.insight}")
            corpus_parts.append("")

        if arch.sports_olympic:
            corpus_parts.append("**Olympic Sports:**")
            for sport in arch.sports_olympic:
                corpus_parts.append(f"- {sport.sport}: {', '.join(sport.events)}")
                corpus_parts.append(f"  - Why: {sport.why}")
            corpus_parts.append("")

        if arch.sports_paralympic:
            corpus_parts.append("**Paralympic Sports:**")
            for sport in arch.sports_paralympic:
                corpus_parts.append(f"- {sport.sport}: {', '.join(sport.events)}")
                corpus_parts.append(f"  - Why: {sport.why}")
                if sport.classification:
                    corpus_parts.append(f"  - Classification: {sport.classification}")
                if sport.classification_explainer:
                    corpus_parts.append(f"  - Explainer: {sport.classification_explainer}")
            corpus_parts.append("")

        corpus_parts.append("---")
        corpus_parts.append("")

    return "\n".join(corpus_parts)


def build_classification_corpus() -> str:
    """
    Build the Paralympic classification corpus string for caching.

    Returns a structured text representation of all 30+ classification codes.
    """
    corpus_parts = [
        "# Paralympic Classification Taxonomy",
        "",
        "## Overview",
        "30+ classification codes across Paralympic sports with eligibility criteria.",
        "",
    ]

    # Group by sport
    sports_map: dict[str, list] = {}
    for code, info in CLASSIFICATIONS.items():
        sport = info.get("sport", "General")
        if sport not in sports_map:
            sports_map[sport] = []
        sports_map[sport].append((code, info))

    for sport, codes in sorted(sports_map.items()):
        corpus_parts.append(f"## {sport}")
        corpus_parts.append("")

        for code, info in codes:
            corpus_parts.append(f"### {code}")
            corpus_parts.append(f"- Category: {info.get('category', 'N/A')}")
            corpus_parts.append(f"- Description: {info.get('description', 'N/A')}")
            corpus_parts.append(f"- Eligibility: {info.get('eligibility', 'N/A')}")
            events = info.get("events", [])
            if events:
                corpus_parts.append(f"- Events: {', '.join(events)}")
            corpus_parts.append("")

        corpus_parts.append("---")
        corpus_parts.append("")

    return "\n".join(corpus_parts)


@lru_cache(maxsize=1)
def get_full_corpus() -> str:
    """
    Get the full cached corpus combining archetypes and classifications.

    Uses lru_cache to avoid rebuilding on every request.
    """
    archetype_corpus = build_archetype_corpus()
    classification_corpus = build_classification_corpus()

    return f"""
{archetype_corpus}

═══════════════════════════════════════════════════════════════════════════════

{classification_corpus}
"""


def get_corpus_stats() -> dict[str, Any]:
    """Get statistics about the cached corpus."""
    corpus = get_full_corpus()
    return {
        "total_characters": len(corpus),
        "total_lines": corpus.count("\n"),
        "archetype_count": len(ARCHETYPES),
        "classification_count": len(CLASSIFICATIONS),
        "cache_name": CACHE_DISPLAY_NAME,
    }


# ══════════════════════════════════════════════════════════════════════════════
# Vertex AI Context Cache Management
# ══════════════════════════════════════════════════════════════════════════════

_cached_context = None


async def get_or_create_vertex_cache() -> Any:
    """
    Get or create a Vertex AI context cache for the archetype corpus.

    Returns the cached context object that can be passed to GenerativeModel.
    Uses a module-level cache to avoid repeated API calls.
    """
    global _cached_context

    if _cached_context is not None:
        return _cached_context

    # Dev mode skips actual caching
    if os.getenv("DEV_MODE", "false").lower() == "true":
        return None

    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)

        # Check for existing cache
        existing_caches = vertex_caching.CachedContent.list()
        for cache in existing_caches:
            if cache.display_name == CACHE_DISPLAY_NAME:
                _cached_context = cache
                return cache

        # Create new cache
        corpus = get_full_corpus()

        cache = vertex_caching.CachedContent.create(
            model_name="gemini-2.5-pro",
            display_name=CACHE_DISPLAY_NAME,
            system_instruction="You are FORGED, a Team USA archetype matching agent. Use the cached corpus to provide accurate archetype information.",
            contents=[Part.from_text(corpus)],
            ttl="3600s",  # 1 hour TTL
        )

        _cached_context = cache
        return cache

    except Exception as e:
        # Log but don't fail - caching is an optimization
        print(f"Context caching unavailable: {e}")
        return None


def get_corpus_as_system_context() -> str:
    """
    Get the corpus formatted as system context for non-cached use.

    Used as fallback when Vertex AI caching is unavailable.
    """
    corpus = get_full_corpus()
    return f"""
You have access to the FORGED archetype corpus containing:
- 8 Team USA archetypes with biometric centroids
- 30+ Paralympic classification codes
- 120 years of historical context

CORPUS:
{corpus}

Use this data to provide accurate, contextual archetype matches.
"""
