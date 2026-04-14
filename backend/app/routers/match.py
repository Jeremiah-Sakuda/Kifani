import os
import uuid

from fastapi import APIRouter, HTTPException

from app.models.schemas import MatchRequest, MatchResponse
from app.services.clustering import compute_archetype_match

router = APIRouter()

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# In-memory session store for dev mode
_sessions: dict[str, dict] = {}


def _build_mock_narrative(req: MatchRequest, match_result: dict) -> dict:
    """Build a full response from clustering results without Gemini."""
    archetype = match_result["archetype"]
    confidence = match_result["confidence"]

    olympic_sports = [
        {
            "sport": s,
            "event": s,
            "why": f"Your build profile could align with athletes in {s}, based on similar height-to-weight ratios seen across Team USA history.",
        }
        for s in archetype.sports_olympic[:3]
    ]

    paralympic_classifications = {
        "Para Powerlifting": ("Open", "Open class — athletes compete by body weight across all impairment types that affect the lower limbs or hip."),
        "Wheelchair Rugby": ("Mixed", "Played by athletes with impairments in at least three limbs, classified on a point system from 0.5 to 3.5 based on functional ability."),
        "Para Judo": ("J1/J2", "J1 and J2 classifications cover athletes with visual impairments, from total blindness to partial sight."),
        "Para Athletics (T46 Marathon)": ("T46", "T46 covers athletes with upper limb deficiency — such as amputation or limb difference affecting one or both arms."),
        "Para Cycling": ("C1-C5", "C1 through C5 classifications cover cyclists with limb deficiencies, muscle weakness, or coordination impairments, with C1 being the most impaired."),
        "Para Triathlon": ("PTS2-PTS5", "PTS categories cover athletes with physical impairments affecting limbs, ranging from severe (PTS2) to mild (PTS5)."),
        "Para Archery": ("W1/Open", "W1 is for athletes with impairments in both arms and legs; Open class is for athletes with leg impairments who use wheelchairs."),
        "Para Shooting": ("SH1/SH2", "SH1 athletes can support the weight of the firearm; SH2 athletes need a support stand due to upper limb impairment."),
        "Boccia": ("BC1-BC4", "Boccia is for athletes with severe physical impairments. BC1-BC2 have cerebral palsy; BC3-BC4 have other impairments."),
        "Para Table Tennis": ("1-11", "Classes 1-5 are for wheelchair users; 6-10 for standing athletes; 11 for athletes with intellectual impairments."),
        "Para Athletics (T44 100m)": ("T44", "T44 covers athletes with below-knee limb deficiency or impairment affecting one or both legs. Athletes often compete with running prostheses."),
        "Para Athletics (T64 Long Jump)": ("T64", "T64 is for athletes with below-knee limb deficiency using running prostheses, similar to T44 but specifically for prosthetic users."),
        "Wheelchair Basketball": ("1.0-4.5", "Players are classified from 1.0 (least functional ability) to 4.5 (most), with team totals capped to ensure competitive balance."),
        "Sitting Volleyball": ("VS1/VS2", "VS1 athletes have a more severe impairment than VS2. All players must sit on the court during play."),
        "Para Swimming": ("S1-S14", "S1-S10 cover physical impairments (S1 most severe); S11-S13 visual impairments; S14 intellectual impairments."),
        "Para Swimming (S6-S8)": ("S6-S8", "S6-S8 covers swimmers with moderate physical impairments affecting limbs or trunk, allowing varied but limited mobility in water."),
        "Wheelchair Fencing": ("A/B", "Category A fencers have good trunk control and balance; Category B fencers have impaired trunk movement and rely on arm reach."),
        "Para Badminton": ("WH1/WH2/SL3-SU5", "WH1-WH2 for wheelchair users; SL3-SL4 for standing lower limb impairments; SU5 for upper limb impairments."),
    }

    paralympic_sports = []
    for s in archetype.sports_paralympic[:2]:
        code, explainer = paralympic_classifications.get(s, ("", ""))
        paralympic_sports.append({
            "sport": s,
            "event": f"{code} events" if code else s,
            "classification": code,
            "classification_explainer": explainer,
            "why": f"Athletes with similar builds have competed in {s}, where this body type could offer biomechanical advantages.",
        })

    return {
        "primary_archetype": {
            "name": archetype.name,
            "description": archetype.description,
            "historical_context": f"The {archetype.name} archetype has been a consistent presence across Team USA's 120-year Olympic and Paralympic history, appearing in both summer and winter programs.",
            "confidence": confidence,
        },
        "olympic_sports": olympic_sports,
        "paralympic_sports": paralympic_sports,
        "digital_mirror": {
            "user_position": match_result["user_position"],
            "centroid_positions": match_result["centroid_positions"],
            "distribution_data": [],
        },
        "narrative": f"Based on your height and weight, your build could align with the {archetype.name} archetype. {archetype.description} This profile spans both Olympic events like {archetype.sports_olympic[0]} and Paralympic events like {archetype.sports_paralympic[0]}, where similar frames have been represented across multiple eras of Team USA competition.",
    }


@router.post("/match", response_model=MatchResponse)
async def match_archetype(req: MatchRequest):
    """Match user biometrics to an athlete archetype."""
    try:
        session_id = str(uuid.uuid4())

        # Compute similarity against archetype centroids (works without GCP)
        match_result = compute_archetype_match(req)

        if DEV_MODE:
            narrative_data = _build_mock_narrative(req, match_result)
            _sessions[session_id] = {
                "user_input": req.model_dump(),
                "archetype_result": narrative_data,
                "messages": [],
            }
        else:
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
    """Retrieve a session result for the results page."""
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
