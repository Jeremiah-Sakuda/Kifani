"""
FORGED — Paralympic Spotlight Mode endpoints.

Provides Paralympic-first exploration paths including classification browsing,
side-by-side parity comparisons, and dedicated Paralympic archetype discovery.
"""

import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.archetypes import ARCHETYPES, get_archetype_by_name
from app.tools.classify_paralympic import CLASSIFICATIONS, classify_paralympic_tool, ClassifyParalympicArgs


router = APIRouter(prefix="/explore/paralympic", tags=["paralympic"])

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"


# ══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ══════════════════════════════════════════════════════════════════════════════

class ClassificationExploreRequest(BaseModel):
    """Request to explore a Paralympic classification family."""
    classification_family: str  # e.g., "T53", "S6-S10", "wheelchair sprint"
    archetype: str | None = None  # Optional archetype filter


class ParityComparisonRequest(BaseModel):
    """Request for side-by-side Olympic/Paralympic event comparison."""
    event_type: str  # e.g., "100m sprint", "swimming", "throws"
    archetype: str | None = None


class ClassificationInfo(BaseModel):
    """Detailed classification information."""
    code: str
    sport: str
    category: str
    description: str
    eligibility: str
    events: list[str]


class ParityComparison(BaseModel):
    """Side-by-side comparison of Olympic and Paralympic events."""
    event_category: str
    olympic_events: list[dict[str, Any]]
    paralympic_events: list[dict[str, Any]]
    parity_note: str


class ExploreResponse(BaseModel):
    """Response for Paralympic exploration."""
    classifications: list[ClassificationInfo]
    matching_archetypes: list[str]
    context: str


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/classifications")
async def list_classifications() -> dict[str, Any]:
    """
    List all available Paralympic classification codes.

    Groups classifications by sport and category for exploration.
    """
    by_sport: dict[str, list[dict]] = {}

    for code, info in CLASSIFICATIONS.items():
        sport = info["sport"]
        if sport not in by_sport:
            by_sport[sport] = []
        by_sport[sport].append({
            "code": code,
            "category": info["category"],
            "description": info["description"][:100] + "...",
        })

    return {
        "sports": list(by_sport.keys()),
        "classifications_by_sport": by_sport,
        "total_classifications": len(CLASSIFICATIONS),
    }


@router.post("/explore")
async def explore_classification(req: ClassificationExploreRequest) -> ExploreResponse:
    """
    Explore Paralympic sports by classification family.

    Returns matching classifications, archetypes, and context.
    """
    family_lower = req.classification_family.lower()

    # Find matching classifications
    matching = []
    for code, info in CLASSIFICATIONS.items():
        code_lower = code.lower()
        category_lower = info["category"].lower()
        desc_lower = info["description"].lower()

        if (family_lower in code_lower or
            family_lower in category_lower or
            family_lower in desc_lower):
            matching.append(ClassificationInfo(
                code=code,
                sport=info["sport"],
                category=info["category"],
                description=info["description"],
                eligibility=info["eligibility"],
                events=info["events"],
            ))

    if not matching:
        raise HTTPException(
            status_code=404,
            detail=f"No classifications found for '{req.classification_family}'",
        )

    # Find archetypes that include these classifications
    matching_archetypes = []
    for archetype in ARCHETYPES:
        if archetype.sports_paralympic:
            for sport in archetype.sports_paralympic:
                if sport.classification:
                    for m in matching:
                        if m.code in sport.classification:
                            if archetype.name not in matching_archetypes:
                                matching_archetypes.append(archetype.name)
                            break

    # Build context narrative
    sports = list(set(m.sport for m in matching))
    context = (
        f"Found {len(matching)} classification(s) matching '{req.classification_family}'. "
        f"These span {', '.join(sports)}. "
        f"Athletes in these classifications share functional profiles that may align with "
        f"the {', '.join(matching_archetypes) if matching_archetypes else 'various'} archetype(s)."
    )

    return ExploreResponse(
        classifications=matching,
        matching_archetypes=matching_archetypes,
        context=context,
    )


@router.get("/archetypes")
async def list_paralympic_archetypes() -> dict[str, Any]:
    """
    List archetypes with strong Paralympic representation.

    Returns all archetypes sorted by Paralympic sport coverage.
    """
    results = []

    for archetype in ARCHETYPES:
        para_sports = [s.sport for s in archetype.sports_paralympic]
        olympic_sports = [s.sport for s in archetype.sports_olympic]

        is_paralympic_first = len(archetype.sports_olympic) == 0

        results.append({
            "name": archetype.name,
            "description": archetype.description,
            "is_paralympic_first": is_paralympic_first,
            "paralympic_sports": para_sports,
            "olympic_sports": olympic_sports,
            "sample_weight": archetype.sample_weight,
            "athlete_count": archetype.athlete_count,
        })

    # Sort: Paralympic-first archetypes first, then by Paralympic sport count
    results.sort(
        key=lambda x: (not x["is_paralympic_first"], -len(x["paralympic_sports"]))
    )

    return {
        "archetypes": results,
        "paralympic_first_count": sum(1 for r in results if r["is_paralympic_first"]),
        "total": len(results),
    }


@router.post("/parity-compare")
async def compare_parity(req: ParityComparisonRequest) -> ParityComparison:
    """
    Generate side-by-side Olympic/Paralympic event comparison.

    Shows how the same event type manifests across both programs,
    demonstrating structural parity in the archetype system.
    """
    event_lower = req.event_type.lower()

    # Event mappings for parity comparison
    parity_mappings = {
        "sprint": {
            "category": "Sprint Events",
            "olympic": [
                {"event": "100m", "description": "Explosive speed over one straightaway"},
                {"event": "200m", "description": "Speed endurance around the curve"},
            ],
            "paralympic": [
                {"event": "T64 100m", "classification": "T64", "description": "Running prosthesis sprint"},
                {"event": "T54 100m", "classification": "T54", "description": "Wheelchair sprint racing"},
                {"event": "T38 100m", "classification": "T38", "description": "Coordination impairment sprint"},
            ],
            "note": "Paralympic sprints showcase the same explosive qualities across different movement modalities.",
        },
        "100m": {
            "category": "100m Sprint",
            "olympic": [
                {"event": "100m", "description": "The ultimate test of human speed"},
            ],
            "paralympic": [
                {"event": "T64 100m", "classification": "T64", "description": "Running prosthesis — often sub-11 seconds"},
                {"event": "T54 100m", "classification": "T54", "description": "Wheelchair — often sub-14 seconds"},
                {"event": "T11 100m", "classification": "T11", "description": "Visual impairment with guide runner"},
            ],
            "note": "Multiple Paralympic 100m classes demonstrate diverse expressions of sprinting excellence.",
        },
        "swimming": {
            "category": "Swimming Events",
            "olympic": [
                {"event": "100m Freestyle", "description": "Pure speed in the water"},
                {"event": "200m IM", "description": "All four strokes in sequence"},
            ],
            "paralympic": [
                {"event": "S6 100m Freestyle", "classification": "S6", "description": "Moderate physical impairment"},
                {"event": "S10 100m Freestyle", "classification": "S10", "description": "Mild physical impairment"},
                {"event": "S11 100m Freestyle", "classification": "S11", "description": "Visual impairment — blackout goggles"},
            ],
            "note": "Para Swimming classifications ensure fair competition while showcasing aquatic excellence.",
        },
        "throws": {
            "category": "Throwing Events",
            "olympic": [
                {"event": "Shot Put", "description": "Maximum power into a 16lb sphere"},
                {"event": "Discus", "description": "Rotational force and release timing"},
            ],
            "paralympic": [
                {"event": "F34 Shot Put", "classification": "F34", "description": "Seated throw — coordination impairment"},
                {"event": "F57 Shot Put", "classification": "F57", "description": "Seated throw — spinal cord injury"},
                {"event": "F64 Shot Put", "classification": "F64", "description": "Standing — running prosthesis"},
            ],
            "note": "Seated throws isolate upper body power, creating a distinct but parallel athletic challenge.",
        },
        "marathon": {
            "category": "Marathon",
            "olympic": [
                {"event": "Marathon", "description": "26.2 miles of sustained effort"},
            ],
            "paralympic": [
                {"event": "T54 Marathon", "classification": "T54", "description": "Wheelchair marathon — often faster than running"},
                {"event": "T12 Marathon", "classification": "T12", "description": "Visual impairment with guide"},
            ],
            "note": "Wheelchair marathoners regularly finish before running marathoners, showcasing elite aerobic capacity.",
        },
    }

    # Find matching category
    match = None
    for key, data in parity_mappings.items():
        if key in event_lower or event_lower in key:
            match = data
            break

    if not match:
        # Return generic comparison
        match = {
            "category": req.event_type.title(),
            "olympic": [{"event": req.event_type, "description": "Olympic event format"}],
            "paralympic": [{"event": f"Para {req.event_type}", "description": "Paralympic event format"}],
            "note": "Both Olympic and Paralympic programs feature this event type with adapted formats.",
        }

    return ParityComparison(
        event_category=match["category"],
        olympic_events=match["olympic"],
        paralympic_events=match["paralympic"],
        parity_note=match["note"],
    )


@router.get("/archetype/{archetype_name}")
async def get_paralympic_details(archetype_name: str) -> dict[str, Any]:
    """
    Get detailed Paralympic information for a specific archetype.

    Returns all Paralympic sports, classifications, and context.
    """
    archetype = get_archetype_by_name(archetype_name)

    if not archetype:
        raise HTTPException(status_code=404, detail=f"Archetype '{archetype_name}' not found")

    # Use the classify_paralympic tool
    args = ClassifyParalympicArgs(archetype=archetype_name)
    result = classify_paralympic_tool(args)

    return {
        "archetype": archetype.name,
        "description": archetype.description,
        "is_paralympic_first": len(archetype.sports_olympic) == 0,
        "sample_weight": archetype.sample_weight,
        "paralympic_sports": result.get("archetype_sports", []),
        "context_note": result.get("context_note", ""),
        "classifications_available": result.get("total_classifications_available", 0),
    }
