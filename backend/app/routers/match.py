"""
FORGED — Match endpoint for archetype matching.

Accepts user biometrics and returns the closest archetype match
with sport alignments, historical context, and Digital Mirror data.
"""

import os
import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import MatchRequest, MatchResponse
from app.services.clustering import (
    compute_archetype_match,
    format_sport_matches,
    get_historical_context,
)

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

    # Build conditional narrative (uses "could" phrasing per challenge rules)
    olympic_sport = archetype.sports_olympic[0].sport if archetype.sports_olympic else "various Olympic events"
    paralympic_sport = archetype.sports_paralympic[0].sport if archetype.sports_paralympic else "various Paralympic events"

    narrative = (
        f"Based on your height and weight, your build could align with the {archetype.name} archetype. "
        f"{archetype.description} "
        f"This profile spans both Olympic events like {olympic_sport} and Paralympic events like {paralympic_sport}, "
        f"where similar frames have been represented across Team USA's 120-year history."
    )

    return {
        "primary_archetype": {
            "name": archetype.name,
            "description": archetype.description,
            "historical_context": historical_context,
            "confidence": confidence,
        },
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
    """
    try:
        session_id = str(uuid.uuid4())

        # Compute similarity against 8 archetype centroids
        match_result = compute_archetype_match(req)

        if DEV_MODE:
            # Build response directly from match result
            narrative_data = _build_response_from_match(req, match_result)
            _sessions[session_id] = {
                "user_input": req.model_dump(),
                "archetype_result": narrative_data,
                "messages": [],
            }
        else:
            # Use Gemini to generate enhanced narrative
            from app.services.gemini_agent import generate_match_narrative
            from app.services.firestore_service import save_session

            narrative_data = await generate_match_narrative(req, match_result)
            await save_session(session_id, req.model_dump(), narrative_data)

        response = MatchResponse(
            session_id=session_id,
            primary_archetype=narrative_data["primary_archetype"],
            olympic_sports=narrative_data["olympic_sports"],
            paralympic_sports=narrative_data["paralympic_sports"],
            digital_mirror=narrative_data["digital_mirror"],
            narrative=narrative_data["narrative"],
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
