import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import MatchRequest, MatchResponse
from app.services.clustering import compute_archetype_match
from app.services.gemini_agent import generate_match_narrative
from app.services.firestore_service import save_session

router = APIRouter()


@router.post("/match", response_model=MatchResponse)
async def match_archetype(req: MatchRequest):
    """Match user biometrics to an athlete archetype."""
    try:
        session_id = str(uuid.uuid4())

        # Compute similarity against archetype centroids
        match_result = compute_archetype_match(req)

        # Generate narrative via Gemini
        narrative_data = await generate_match_narrative(req, match_result)

        response = MatchResponse(
            session_id=session_id,
            primary_archetype=narrative_data["primary_archetype"],
            olympic_sports=narrative_data["olympic_sports"],
            paralympic_sports=narrative_data["paralympic_sports"],
            digital_mirror=narrative_data["digital_mirror"],
            narrative=narrative_data["narrative"],
        )

        # Persist session for conversational follow-ups
        await save_session(session_id, req.model_dump(), response.model_dump())

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
