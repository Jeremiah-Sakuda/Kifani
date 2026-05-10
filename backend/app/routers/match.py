"""
FORGED — Match endpoint for archetype matching.

Accepts user biometrics and returns the closest archetype match
with sport alignments, historical context, and Digital Mirror data.
Includes validation trace for transparency (Gemini auditing Gemini).
"""

import os
import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    MatchRequest,
    MatchResponse,
    SecondaryArchetype,
    ValidationTrace,
)
from app.services.clustering import (
    compute_archetype_match,
    format_sport_matches,
    get_historical_context,
)
from app.services.conditional_validator import validate_conditional_language

router = APIRouter()

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# In-memory session store for dev mode
_sessions: dict[str, dict] = {}


def _build_response_from_match(req: MatchRequest, match_result: dict) -> dict:
    """
    Build a full response from clustering results.

    In dev mode, this generates a complete response without Gemini.
    In production, this provides the base data that Gemini enhances.
    """
    archetype = match_result["archetype"]
    confidence = match_result["confidence"]

    # Get sport matches from the archetype
    sport_matches = format_sport_matches(
        archetype,
        max_olympic=3,
        max_paralympic=2,
    )

    # Get historical context
    historical_context = get_historical_context(archetype)

    # Build secondary archetypes for discovery panel
    secondary_archetypes = []
    for sec_arch, sec_conf in match_result.get("secondary_archetypes", [])[:2]:
        secondary_archetypes.append({
            "name": sec_arch.name,
            "confidence": sec_conf,
            "description": sec_arch.description,
            "is_paralympic_first": sec_arch.name in ["Adaptive Power", "Adaptive Endurance"],
        })

    # Build conditional narrative (uses "could" phrasing per challenge rules)
    olympic_sport = archetype.sports_olympic[0].sport if archetype.sports_olympic else "various Olympic events"
    paralympic_sport = archetype.sports_paralympic[0].sport if archetype.sports_paralympic else "various Paralympic events"

    narrative = (
        f"Based on your height and weight, your build could align with the {archetype.name} archetype. "
        f"{archetype.description} "
        f"This profile spans both Olympic events like {olympic_sport} and Paralympic events like {paralympic_sport}, "
        f"where similar frames have been represented across Team USA's 120-year history."
    )

    # Include archetype insight if available
    insight = getattr(archetype, "insight", None)

    return {
        "primary_archetype": {
            "name": archetype.name,
            "description": archetype.description,
            "historical_context": historical_context,
            "confidence": confidence,
            "insight": insight,
        },
        "secondary_archetypes": secondary_archetypes,
        "olympic_sports": sport_matches["olympic_sports"],
        "paralympic_sports": sport_matches["paralympic_sports"],
        "digital_mirror": {
            "user_position": match_result["user_position"],
            "centroid_positions": match_result["centroid_positions"],
            "distribution_data": [],
        },
        "narrative": narrative,
    }


@router.post("/match", response_model=MatchResponse)
async def match_archetype(req: MatchRequest):
    """
    Match user biometrics to an athlete archetype.

    Accepts height, weight, and optional arm span, age range, and activity preferences.
    Returns the closest archetype match with Olympic and Paralympic sport alignments.
    Includes validation trace showing Gemini auditing Gemini for compliance.
    """
    try:
        session_id = str(uuid.uuid4())

        # Compute similarity against 8 archetype centroids
        match_result = compute_archetype_match(req)

        validation_trace_data = None

        if DEV_MODE:
            # Build response directly from match result
            narrative_data = _build_response_from_match(req, match_result)

            # Validate conditional language (Gemini auditing Gemini)
            validation_result = await validate_conditional_language(
                narrative_data["narrative"],
                skip_if_compliant=False,  # Always validate for transparency
            )
            narrative_data["narrative"] = validation_result.validated_text

            # Build validation trace for API response
            validation_trace_data = ValidationTrace(
                model=validation_result.model,
                input_length=validation_result.input_length,
                output_length=validation_result.output_length,
                was_modified=validation_result.was_modified,
                modifications=validation_result.modifications,
                latency_ms=validation_result.latency_ms,
                validation_summary=validation_result.validation_trace,
            )

            _sessions[session_id] = {
                "user_input": req.model_dump(),
                "archetype_result": narrative_data,
                "validation_trace": validation_trace_data.model_dump() if validation_trace_data else None,
                "messages": [],
            }
        else:
            # Use Gemini to generate enhanced narrative
            from app.services.gemini_agent import generate_match_narrative
            from app.services.firestore_service import save_session

            narrative_data = await generate_match_narrative(req, match_result)

            # Validate conditional language
            validation_result = await validate_conditional_language(
                narrative_data["narrative"],
                skip_if_compliant=False,
            )
            narrative_data["narrative"] = validation_result.validated_text

            validation_trace_data = ValidationTrace(
                model=validation_result.model,
                input_length=validation_result.input_length,
                output_length=validation_result.output_length,
                was_modified=validation_result.was_modified,
                modifications=validation_result.modifications,
                latency_ms=validation_result.latency_ms,
                validation_summary=validation_result.validation_trace,
            )

            await save_session(session_id, req.model_dump(), narrative_data)

        response = MatchResponse(
            session_id=session_id,
            primary_archetype=narrative_data["primary_archetype"],
            secondary_archetypes=narrative_data.get("secondary_archetypes", []),
            olympic_sports=narrative_data["olympic_sports"],
            paralympic_sports=narrative_data["paralympic_sports"],
            digital_mirror=narrative_data["digital_mirror"],
            narrative=narrative_data["narrative"],
            validation_trace=validation_trace_data,
            paralympic_discovery_mode=False,
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """
    Retrieve a session result for the results page.

    Returns the archetype match data including sports, narrative, and Digital Mirror positions.
    """
    if DEV_MODE:
        session = _sessions.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session["archetype_result"]
    else:
        from app.services.firestore_service import get_session as fs_get
        session = await fs_get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session["archetype_result"]


# ══════════════════════════════════════════════════════════════════════════════
# DEV HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def get_dev_session(session_id: str) -> dict | None:
    """Get a session from the dev store (for testing)."""
    return _sessions.get(session_id)


def clear_dev_sessions():
    """Clear all dev sessions (for testing)."""
    _sessions.clear()
