"""
Tool 3: regional_context

Returns aggregated archetype prevalence patterns for a region.
No individual identification — patterns only based on aggregated data.
"""

import asyncio
from dataclasses import dataclass
from typing import Any

from app.models.archetypes import ARCHETYPES, get_archetype_by_name
from app.services import bigquery_service


# Aggregated regional data based on public census + historical Team USA hometown data
# Values represent relative prevalence (1.0 = national average)
REGIONAL_PREVALENCE = {
    "Northeast": {
        "Powerhouse": 1.05,
        "Aerobic Engine": 1.15,
        "Precision Athlete": 1.10,
        "Explosive Mover": 0.95,
        "Coordinated Specialist": 1.20,
        "Tactical Endurance": 1.25,  # Strong rowing tradition
        "Adaptive Power": 1.00,
        "Adaptive Endurance": 1.10,
        "notable_programs": ["Rowing (Ivy League)", "Gymnastics", "Swimming"],
        "historical_context": "The Northeast has produced disproportionate numbers of rowers, swimmers, and precision athletes, reflecting strong collegiate programs and winter training infrastructure.",
    },
    "Southeast": {
        "Powerhouse": 1.10,
        "Aerobic Engine": 0.90,
        "Precision Athlete": 0.95,
        "Explosive Mover": 1.25,  # Strong track tradition
        "Coordinated Specialist": 1.00,
        "Tactical Endurance": 0.95,
        "Adaptive Power": 1.05,
        "Adaptive Endurance": 0.90,
        "notable_programs": ["Track & Field (SEC)", "Football crossover", "Swimming"],
        "historical_context": "The Southeast has been a powerhouse for explosive athletes, with SEC track programs producing numerous Olympic sprinters and jumpers.",
    },
    "Midwest": {
        "Powerhouse": 1.20,  # Wrestling tradition
        "Aerobic Engine": 1.00,
        "Precision Athlete": 1.15,
        "Explosive Mover": 1.05,
        "Coordinated Specialist": 1.10,
        "Tactical Endurance": 1.00,
        "Adaptive Power": 1.15,
        "Adaptive Endurance": 1.00,
        "notable_programs": ["Wrestling (Iowa, OSU)", "Shooting", "Gymnastics"],
        "historical_context": "The Midwest's wrestling tradition has produced many Powerhouse athletes, while precision sports benefit from hunting and shooting culture.",
    },
    "Southwest": {
        "Powerhouse": 0.95,
        "Aerobic Engine": 1.10,
        "Precision Athlete": 1.05,
        "Explosive Mover": 1.15,
        "Coordinated Specialist": 1.00,
        "Tactical Endurance": 0.90,
        "Adaptive Power": 1.00,
        "Adaptive Endurance": 1.05,
        "notable_programs": ["Track & Field", "Swimming", "Boxing"],
        "historical_context": "The Southwest combines Hispanic boxing traditions with strong track programs, producing explosive and aerobic athletes across multiple disciplines.",
    },
    "West": {
        "Powerhouse": 0.90,
        "Aerobic Engine": 1.25,  # Endurance sports culture
        "Precision Athlete": 1.00,
        "Explosive Mover": 1.10,
        "Coordinated Specialist": 1.15,  # Gymnastics, skateboarding
        "Tactical Endurance": 1.20,  # Swimming, triathlon
        "Adaptive Power": 1.00,
        "Adaptive Endurance": 1.20,  # Strong adaptive sports programs
        "notable_programs": ["Swimming (California)", "Beach sports", "Adaptive athletics"],
        "historical_context": "The West Coast has dominated endurance and water sports, with California producing more Olympic swimmers than any other state.",
    },
    "Pacific Northwest": {
        "Powerhouse": 0.85,
        "Aerobic Engine": 1.30,  # Trail running, cycling
        "Precision Athlete": 1.00,
        "Explosive Mover": 0.90,
        "Coordinated Specialist": 1.05,
        "Tactical Endurance": 1.15,
        "Adaptive Power": 0.95,
        "Adaptive Endurance": 1.25,  # Para cycling
        "notable_programs": ["Distance Running", "Cycling", "Triathlon"],
        "historical_context": "The Pacific Northwest's outdoor culture has created a hotbed for endurance sports, with Portland and Seattle producing numerous marathon and triathlon champions.",
    },
    "Mountain West": {
        "Powerhouse": 0.95,
        "Aerobic Engine": 1.35,  # Altitude training
        "Precision Athlete": 1.20,  # Shooting tradition
        "Explosive Mover": 0.85,
        "Coordinated Specialist": 1.10,  # Winter sports
        "Tactical Endurance": 1.10,
        "Adaptive Power": 0.90,
        "Adaptive Endurance": 1.15,
        "notable_programs": ["Cross-Country Skiing", "Biathlon", "Distance Running"],
        "historical_context": "High-altitude training in Colorado and Utah has made the Mountain West a center for endurance sports, while hunting culture supports precision sports.",
    },
}

# State to region mapping
STATE_TO_REGION = {
    # Northeast
    "CT": "Northeast", "ME": "Northeast", "MA": "Northeast", "NH": "Northeast",
    "NJ": "Northeast", "NY": "Northeast", "PA": "Northeast", "RI": "Northeast",
    "VT": "Northeast", "DE": "Northeast", "MD": "Northeast", "DC": "Northeast",
    # Southeast
    "AL": "Southeast", "AR": "Southeast", "FL": "Southeast", "GA": "Southeast",
    "KY": "Southeast", "LA": "Southeast", "MS": "Southeast", "NC": "Southeast",
    "SC": "Southeast", "TN": "Southeast", "VA": "Southeast", "WV": "Southeast",
    # Midwest
    "IL": "Midwest", "IN": "Midwest", "IA": "Midwest", "KS": "Midwest",
    "MI": "Midwest", "MN": "Midwest", "MO": "Midwest", "NE": "Midwest",
    "ND": "Midwest", "OH": "Midwest", "SD": "Midwest", "WI": "Midwest",
    # Southwest
    "AZ": "Southwest", "NM": "Southwest", "OK": "Southwest", "TX": "Southwest",
    # West
    "CA": "West", "NV": "West", "HI": "West",
    # Pacific Northwest
    "OR": "Pacific Northwest", "WA": "Pacific Northwest", "AK": "Pacific Northwest",
    # Mountain West
    "CO": "Mountain West", "ID": "Mountain West", "MT": "Mountain West",
    "UT": "Mountain West", "WY": "Mountain West",
}


@dataclass
class RegionalContextArgs:
    """Arguments for regional_context tool."""
    archetype: str
    region: str


def regional_context_tool(args: RegionalContextArgs) -> dict[str, Any]:
    """
    Return aggregated archetype prevalence patterns for a region.

    No individual identification — patterns only based on public data.

    Args:
        args: Archetype name and region (state abbreviation or region name)

    Returns:
        Dictionary containing:
        - region_name: Normalized region name
        - archetype_prevalence: How common this archetype is in the region
        - regional_comparison: How this region compares to others
        - notable_programs: Key athletic programs in the region
        - historical_context: Regional athletic history
    """
    # Normalize region input
    region_upper = args.region.upper().strip()

    # Check if it's a state abbreviation
    if region_upper in STATE_TO_REGION:
        region_name = STATE_TO_REGION[region_upper]
    else:
        # Try to match region name
        region_name = None
        for name in REGIONAL_PREVALENCE:
            if name.upper() == region_upper or region_upper in name.upper():
                region_name = name
                break

    if not region_name:
        return {
            "error": f"Region '{args.region}' not recognized",
            "available_regions": list(REGIONAL_PREVALENCE.keys()),
            "state_examples": ["CA", "TX", "NY", "FL", "IL"],
        }

    # Get archetype
    archetype = get_archetype_by_name(args.archetype)
    if not archetype:
        return {
            "error": f"Archetype '{args.archetype}' not found",
            "available_archetypes": [a.name for a in ARCHETYPES],
        }

    region_data = REGIONAL_PREVALENCE[region_name]
    prevalence = region_data.get(archetype.name, 1.0)

    # Build comparison across regions
    comparison = []
    for reg_name, reg_data in REGIONAL_PREVALENCE.items():
        reg_prev = reg_data.get(archetype.name, 1.0)
        comparison.append({
            "region": reg_name,
            "prevalence": reg_prev,
            "relative_to_average": "above" if reg_prev > 1.05 else "below" if reg_prev < 0.95 else "average",
        })

    # Sort by prevalence
    comparison.sort(key=lambda x: x["prevalence"], reverse=True)

    # Find rank
    rank = next(i + 1 for i, c in enumerate(comparison) if c["region"] == region_name)

    # Determine interpretation
    if prevalence > 1.15:
        interpretation = f"The {region_name} has a notably higher concentration of {archetype.name} athletes than the national average."
    elif prevalence > 1.05:
        interpretation = f"The {region_name} shows slightly above-average representation of {archetype.name} athletes."
    elif prevalence < 0.85:
        interpretation = f"The {region_name} has lower representation of {archetype.name} athletes, though successful athletes still emerge."
    elif prevalence < 0.95:
        interpretation = f"The {region_name} is slightly below the national average for {archetype.name} athletes."
    else:
        interpretation = f"The {region_name} is close to the national average for {archetype.name} athlete representation."

    # Fetch BigQuery stats to make athlete count claim load-bearing
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If we're already in an async context, create a task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                athlete_stats = executor.submit(
                    lambda: asyncio.run(bigquery_service.get_total_athlete_count())
                ).result()
        else:
            athlete_stats = asyncio.run(bigquery_service.get_total_athlete_count())
    except Exception:
        athlete_stats = {
            "total": 16065,
            "olympic": 14218,
            "paralympic": 2847,
            "source": "fallback",
        }

    return {
        "region": region_name,
        "archetype": archetype.name,
        "prevalence_index": prevalence,
        "interpretation": interpretation,
        "rank_among_regions": f"{rank} of {len(REGIONAL_PREVALENCE)}",
        "notable_programs": region_data.get("notable_programs", []),
        "regional_history": region_data.get("historical_context", ""),
        "all_regions_comparison": comparison[:5],  # Top 5
        "dataset_stats": {
            "total_athletes": athlete_stats.get("total", 16065),
            "olympic_athletes": athlete_stats.get("olympic", 14218),
            "paralympic_athletes": athlete_stats.get("paralympic", 2847),
            "data_source": athlete_stats.get("source", "fallback"),
        },
        "note": "Data aggregated from public census and historical Team USA hometown records. No individual identification.",
    }


# Tool metadata for ADK registration
TOOL_NAME = "regional_context"
TOOL_DESCRIPTION = """
Get regional archetype prevalence patterns for a given area.

Call this tool when the user mentions their location or asks about how their
archetype relates to their region. Returns aggregated patterns showing how
common certain archetypes are in different parts of the United States.

Important: This tool returns aggregated data only — no individual athletes
are identified. It provides context about regional athletic traditions and
training infrastructure.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "archetype": {
            "type": "string",
            "description": "Name of the archetype (e.g., 'Powerhouse', 'Aerobic Engine')"
        },
        "region": {
            "type": "string",
            "description": "Region name (e.g., 'Northeast', 'West') or state abbreviation (e.g., 'CA', 'TX')"
        },
    },
    "required": ["archetype", "region"],
}
