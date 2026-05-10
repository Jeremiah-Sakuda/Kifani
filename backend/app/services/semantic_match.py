"""
FORGED — Semantic Embedding Match Service

Provides a parallel matching path using text-embedding-005 on Vertex AI.
Embeds sport descriptions and user self-descriptions for cosine similarity.
"""

import os
import numpy as np
from typing import Any
from functools import lru_cache

from google.cloud import aiplatform
from vertexai.language_models import TextEmbeddingModel

from app.models.archetypes import ARCHETYPES


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
EMBEDDING_MODEL = "text-embedding-005"


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_arr = np.array(a)
    b_arr = np.array(b)
    dot = np.dot(a_arr, b_arr)
    norm_a = np.linalg.norm(a_arr)
    norm_b = np.linalg.norm(b_arr)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))


def build_archetype_description(archetype_name: str) -> str:
    """
    Build a rich text description of an archetype for embedding.

    Combines description, sports, and historical context.
    """
    arch = next((a for a in ARCHETYPES if a.name == archetype_name), None)
    if not arch:
        return ""

    parts = [arch.description]

    # Add Olympic sports
    if arch.sports_olympic:
        olympic_sports = [s.sport for s in arch.sports_olympic]
        parts.append(f"Olympic sports: {', '.join(olympic_sports)}.")

    # Add Paralympic sports
    if arch.sports_paralympic:
        para_sports = [s.sport for s in arch.sports_paralympic]
        parts.append(f"Paralympic sports: {', '.join(para_sports)}.")

    # Add historical context snippet
    if arch.historical_context:
        # Take first sentence
        first_sentence = arch.historical_context.split('.')[0] + '.'
        parts.append(first_sentence)

    return " ".join(parts)


@lru_cache(maxsize=1)
def get_archetype_embeddings() -> dict[str, list[float]]:
    """
    Get embeddings for all 8 archetypes.

    Uses lru_cache to compute embeddings only once.
    Returns dict mapping archetype name to embedding vector.
    """
    # Dev mode returns mock embeddings
    if os.getenv("DEV_MODE", "false").lower() == "true":
        return _mock_archetype_embeddings()

    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)

        embeddings = {}
        for arch in ARCHETYPES:
            description = build_archetype_description(arch.name)
            result = model.get_embeddings([description])
            embeddings[arch.name] = result[0].values

        return embeddings

    except Exception as e:
        print(f"Embedding error: {e}")
        return _mock_archetype_embeddings()


def _mock_archetype_embeddings() -> dict[str, list[float]]:
    """Return mock embeddings for dev mode."""
    # Create distinct mock embeddings for each archetype
    mock_base = {
        "Powerhouse": [0.8, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1, 0.1],
        "Aerobic Engine": [0.1, 0.9, 0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
        "Precision Athlete": [0.2, 0.1, 0.8, 0.2, 0.1, 0.3, 0.1, 0.1],
        "Explosive Mover": [0.3, 0.2, 0.1, 0.8, 0.1, 0.2, 0.1, 0.1],
        "Coordinated Specialist": [0.1, 0.2, 0.3, 0.1, 0.8, 0.2, 0.1, 0.1],
        "Tactical Endurance": [0.2, 0.3, 0.1, 0.2, 0.1, 0.8, 0.1, 0.1],
        "Adaptive Power": [0.7, 0.1, 0.2, 0.2, 0.1, 0.1, 0.9, 0.2],
        "Adaptive Endurance": [0.2, 0.7, 0.1, 0.2, 0.2, 0.1, 0.2, 0.9],
    }
    # Pad to 768 dimensions (model output size)
    return {
        name: vec + [0.0] * (768 - len(vec))
        for name, vec in mock_base.items()
    }


def embed_user_description(description: str) -> list[float]:
    """
    Embed a user's natural-language self-description.

    Args:
        description: User's description of their athletic style/preferences

    Returns:
        Embedding vector
    """
    if not description or len(description.strip()) < 10:
        return []

    # Dev mode returns mock
    if os.getenv("DEV_MODE", "false").lower() == "true":
        return _mock_user_embedding(description)

    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)

        result = model.get_embeddings([description])
        return result[0].values

    except Exception as e:
        print(f"User embedding error: {e}")
        return _mock_user_embedding(description)


def _mock_user_embedding(description: str) -> list[float]:
    """Generate a mock embedding based on keywords."""
    desc_lower = description.lower()

    # Base vector
    vec = [0.1] * 8

    # Adjust based on keywords
    if any(w in desc_lower for w in ["strength", "power", "lift", "heavy"]):
        vec[0] = 0.7
    if any(w in desc_lower for w in ["endurance", "run", "marathon", "cardio"]):
        vec[1] = 0.7
    if any(w in desc_lower for w in ["precision", "accuracy", "focus", "control"]):
        vec[2] = 0.7
    if any(w in desc_lower for w in ["speed", "sprint", "explosive", "fast"]):
        vec[3] = 0.7
    if any(w in desc_lower for w in ["agility", "flexible", "balance", "grace"]):
        vec[4] = 0.7
    if any(w in desc_lower for w in ["tactical", "team", "strategy", "versatile"]):
        vec[5] = 0.7
    if any(w in desc_lower for w in ["wheelchair", "adaptive", "para"]):
        vec[6] = 0.8
        vec[7] = 0.8

    # Pad to 768 dimensions
    return vec + [0.0] * (768 - len(vec))


def compute_semantic_match(user_description: str) -> dict[str, Any]:
    """
    Compute semantic similarity between user description and all archetypes.

    Args:
        user_description: Natural-language description of athletic style

    Returns:
        Dictionary containing:
        - primary_match: Best semantic match with confidence
        - ranked_matches: All archetypes ranked by similarity
        - embedding_model: Model used for embeddings
    """
    if not user_description or len(user_description.strip()) < 10:
        return {
            "error": "Description too short for semantic matching",
            "minimum_length": 10,
        }

    # Get embeddings
    archetype_embeddings = get_archetype_embeddings()
    user_embedding = embed_user_description(user_description)

    if not user_embedding:
        return {"error": "Failed to embed user description"}

    # Compute similarities
    similarities = []
    for name, arch_embedding in archetype_embeddings.items():
        sim = cosine_similarity(user_embedding, arch_embedding)
        # Convert to percentage (cosine similarity ranges from -1 to 1)
        confidence = (sim + 1) / 2  # Map to 0-1 range
        similarities.append({
            "archetype": name,
            "similarity": round(sim, 4),
            "confidence": round(confidence, 4),
        })

    # Sort by similarity (descending)
    similarities.sort(key=lambda x: x["similarity"], reverse=True)

    primary = similarities[0]
    arch_data = next((a for a in ARCHETYPES if a.name == primary["archetype"]), None)

    return {
        "primary_match": {
            "archetype": primary["archetype"],
            "confidence": primary["confidence"],
            "description": arch_data.description if arch_data else "",
            "is_paralympic_first": len(arch_data.sports_olympic) == 0 if arch_data else False,
        },
        "ranked_matches": similarities,
        "embedding_model": EMBEDDING_MODEL,
        "input_length": len(user_description),
    }


def compute_dual_match(
    biometric_archetype: str,
    biometric_confidence: float,
    user_description: str | None = None,
) -> dict[str, Any]:
    """
    Combine biometric and semantic matching for a dual-signal result.

    Args:
        biometric_archetype: Archetype from K-means matching
        biometric_confidence: Confidence from K-means matching
        user_description: Optional natural-language description

    Returns:
        Dual match result with both signals
    """
    result = {
        "biometric_match": {
            "archetype": biometric_archetype,
            "confidence": biometric_confidence,
            "method": "k-means clustering",
        },
        "semantic_match": None,
        "combined_confidence": biometric_confidence,
        "signals_agree": True,
    }

    if user_description and len(user_description.strip()) >= 10:
        semantic_result = compute_semantic_match(user_description)

        if "error" not in semantic_result:
            semantic_primary = semantic_result["primary_match"]
            result["semantic_match"] = {
                "archetype": semantic_primary["archetype"],
                "confidence": semantic_primary["confidence"],
                "method": f"text-embedding-005 cosine similarity",
            }

            # Check if signals agree
            result["signals_agree"] = (
                biometric_archetype == semantic_primary["archetype"]
            )

            # Combined confidence (weighted average if agree, lower if disagree)
            if result["signals_agree"]:
                # Average with slight boost for agreement
                combined = (biometric_confidence + semantic_primary["confidence"]) / 2
                combined = min(1.0, combined * 1.1)  # 10% boost for agreement
            else:
                # Take biometric as primary but note semantic divergence
                combined = biometric_confidence * 0.9  # Slight reduction

            result["combined_confidence"] = round(combined, 4)

    return result
