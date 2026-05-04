"""
FORGED — Era Time Machine endpoints.

Provides historical evolution data for archetypes across four eras:
pre-1950, 1950-1980, 1980-2000, 2000+.
"""

import os
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.archetypes import ARCHETYPES, get_archetype_by_name
from app.tools.era_evolution import era_evolution_tool, EraEvolutionArgs, ERAS, ERA_EVOLUTION_DATA


router = APIRouter(prefix="/era", tags=["era"])

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"


class EraData(BaseModel):
    """Era statistics for an archetype."""
    era: str
    label: str
    years: tuple[int, int]
    color: str
    avg_height_cm: float | None
    avg_weight_kg: float | None
    avg_bmi: float | None
    athlete_count: int
    top_sports: list[str]
    narrative: str


class EvolutionSummary(BaseModel):
    """Summary of how an archetype evolved."""
    height_change_cm: float
    weight_change_kg: float
    total_athlete_growth: int
    direction: str


class EraEvolutionResponse(BaseModel):
    """Full era evolution response."""
    archetype: str
    description: str
    eras: list[EraData]
    evolution_summary: EvolutionSummary | None
    current_stats: dict[str, Any]


@router.get("/eras")
async def list_eras() -> dict[str, Any]:
    """
    List all era definitions.

    Returns the four eras with their labels, year ranges, and colors.
    """
    return {
        "eras": [
            {
                "key": key,
                "label": data["label"],
                "years": data["years"],
                "color": data["color"],
            }
            for key, data in ERAS.items()
        ],
        "total": len(ERAS),
    }


@router.get("/evolution/{archetype_name}")
async def get_era_evolution(archetype_name: str) -> EraEvolutionResponse:
    """
    Get era-by-era evolution data for an archetype.

    Shows how athletes of this archetype have changed across:
    - pre-1950 (Pioneer Era)
    - 1950-1980 (Golden Era)
    - 1980-2000 (Modern Era)
    - 2000+ (Contemporary Era)
    """
    # Use the tool
    args = EraEvolutionArgs(archetype=archetype_name)
    result = era_evolution_tool(args)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return EraEvolutionResponse(
        archetype=result["archetype"],
        description=result["description"],
        eras=[EraData(**era) for era in result["eras"]],
        evolution_summary=EvolutionSummary(**result["evolution_summary"]) if result["evolution_summary"] else None,
        current_stats=result["current_stats"],
    )


@router.get("/compare")
async def compare_eras_all_archetypes() -> dict[str, Any]:
    """
    Compare era evolution across all archetypes.

    Useful for visualization showing how different archetypes evolved.
    """
    comparisons = []

    for archetype in ARCHETYPES:
        args = EraEvolutionArgs(archetype=archetype.name)
        result = era_evolution_tool(args)

        if "error" not in result:
            comparisons.append({
                "archetype": archetype.name,
                "is_paralympic_first": len(archetype.sports_olympic) == 0,
                "eras": [
                    {
                        "era": era["era"],
                        "height": era["avg_height_cm"],
                        "weight": era["avg_weight_kg"],
                        "count": era["athlete_count"],
                    }
                    for era in result["eras"]
                ],
                "evolution_summary": result.get("evolution_summary"),
            })

    return {
        "archetypes": comparisons,
        "total": len(comparisons),
        "era_labels": {key: data["label"] for key, data in ERAS.items()},
    }


@router.get("/timeline/{era}")
async def get_era_timeline(era: str) -> dict[str, Any]:
    """
    Get all archetypes for a specific era.

    Useful for a single-era view showing all archetype stats.
    """
    if era not in ERAS:
        raise HTTPException(
            status_code=404,
            detail=f"Era '{era}' not found. Available: {list(ERAS.keys())}",
        )

    era_meta = ERAS[era]
    archetypes_in_era = []

    for archetype in ARCHETYPES:
        era_data = ERA_EVOLUTION_DATA.get(archetype.name, {}).get(era, {})

        if era_data and era_data.get("athlete_count", 0) > 0:
            archetypes_in_era.append({
                "archetype": archetype.name,
                "is_paralympic_first": len(archetype.sports_olympic) == 0,
                "avg_height_cm": era_data.get("avg_height_cm"),
                "avg_weight_kg": era_data.get("avg_weight_kg"),
                "avg_bmi": era_data.get("avg_bmi"),
                "athlete_count": era_data.get("athlete_count", 0),
                "top_sports": era_data.get("top_sports", []),
                "narrative": era_data.get("narrative", ""),
            })

    # Sort by athlete count
    archetypes_in_era.sort(key=lambda x: x["athlete_count"], reverse=True)

    return {
        "era": era,
        "label": era_meta["label"],
        "years": era_meta["years"],
        "color": era_meta["color"],
        "archetypes": archetypes_in_era,
        "total_athletes": sum(a["athlete_count"] for a in archetypes_in_era),
    }
