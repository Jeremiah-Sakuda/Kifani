"""
Tool: era_evolution

Shows how athletes of a given archetype have evolved across four eras.
Returns aggregate stats and Gemini-generated era narratives.
"""

import os
from dataclasses import dataclass
from typing import Any

from app.models.archetypes import ARCHETYPES, get_archetype_by_name


# Era definitions
ERAS = {
    "pre-1950": {"label": "Pioneer Era", "years": (1896, 1949), "color": "#8B4513"},
    "1950-1980": {"label": "Golden Era", "years": (1950, 1980), "color": "#CD853F"},
    "1980-2000": {"label": "Modern Era", "years": (1981, 2000), "color": "#DAA520"},
    "2000+": {"label": "Contemporary Era", "years": (2001, 2030), "color": "#FFD700"},
}

# Simulated era evolution data by archetype
# In production, this would be queried from BigQuery
ERA_EVOLUTION_DATA = {
    "Powerhouse": {
        "pre-1950": {
            "avg_height_cm": 175.0,
            "avg_weight_kg": 92.0,
            "avg_bmi": 30.0,
            "athlete_count": 124,
            "top_sports": ["Wrestling", "Weightlifting"],
            "narrative": "Early Powerhouse athletes competed in an era before modern strength training. Olympic lifting and wrestling dominated, with athletes relying on natural strength.",
        },
        "1950-1980": {
            "avg_height_cm": 178.0,
            "avg_weight_kg": 97.0,
            "avg_bmi": 30.6,
            "athlete_count": 412,
            "top_sports": ["Weightlifting", "Wrestling", "Shot Put"],
            "narrative": "The introduction of systematic weight training transformed Powerhouse athletes. Average weight increased 5kg as training science evolved.",
        },
        "1980-2000": {
            "avg_height_cm": 181.0,
            "avg_weight_kg": 101.0,
            "avg_bmi": 30.8,
            "athlete_count": 589,
            "top_sports": ["Weightlifting", "Wrestling", "Judo"],
            "narrative": "Sports science reached new heights. Powerhouse athletes became taller and heavier, with periodized training becoming standard.",
        },
        "2000+": {
            "avg_height_cm": 183.0,
            "avg_weight_kg": 103.0,
            "avg_bmi": 30.8,
            "athlete_count": 717,
            "top_sports": ["Weightlifting", "Wrestling", "Shot Put", "Para Powerlifting"],
            "narrative": "Contemporary Powerhouse athletes benefit from advanced nutrition and recovery protocols. Paralympic Powerlifting emerged as a major pathway.",
        },
    },
    "Aerobic Engine": {
        "pre-1950": {
            "avg_height_cm": 172.0,
            "avg_weight_kg": 65.0,
            "avg_bmi": 22.0,
            "athlete_count": 89,
            "top_sports": ["Marathon", "Cross Country"],
            "narrative": "Early endurance athletes ran in leather shoes on cinder tracks. Training was intuitive, with limited understanding of physiology.",
        },
        "1950-1980": {
            "avg_height_cm": 175.0,
            "avg_weight_kg": 68.0,
            "avg_bmi": 22.2,
            "athlete_count": 456,
            "top_sports": ["Marathon", "Distance Running", "Cross-Country Skiing"],
            "narrative": "The running boom era transformed distance sports. Aerobic Engine athletes became more specialized as training methods improved.",
        },
        "1980-2000": {
            "avg_height_cm": 177.0,
            "avg_weight_kg": 70.0,
            "avg_bmi": 22.3,
            "athlete_count": 623,
            "top_sports": ["Marathon", "Triathlon", "Cycling"],
            "narrative": "Triathlon emerged, demanding versatility. VO2max testing and lactate threshold training became standard for elite performers.",
        },
        "2000+": {
            "avg_height_cm": 178.0,
            "avg_weight_kg": 72.0,
            "avg_bmi": 22.5,
            "athlete_count": 988,
            "top_sports": ["Marathon", "Triathlon", "Para Cycling", "Para Triathlon"],
            "narrative": "Carbon fiber technology and altitude training camps define the modern era. Paralympic endurance sports have achieved parity recognition.",
        },
    },
    "Explosive Mover": {
        "pre-1950": {
            "avg_height_cm": 174.0,
            "avg_weight_kg": 68.0,
            "avg_bmi": 22.5,
            "athlete_count": 156,
            "top_sports": ["100m Sprint", "Long Jump"],
            "narrative": "Sprinting in the pioneer era relied on pure talent. Starting blocks and modern track surfaces had not yet been invented.",
        },
        "1950-1980": {
            "avg_height_cm": 176.0,
            "avg_weight_kg": 69.0,
            "avg_bmi": 22.3,
            "athlete_count": 534,
            "top_sports": ["100m Sprint", "200m Sprint", "Long Jump"],
            "narrative": "Synthetic tracks revolutionized sprinting. Block starts became standardized and timing became electronic.",
        },
        "1980-2000": {
            "avg_height_cm": 178.0,
            "avg_weight_kg": 71.0,
            "avg_bmi": 22.4,
            "athlete_count": 789,
            "top_sports": ["100m Sprint", "Long Jump", "4x100m Relay"],
            "narrative": "The era of sprinting superstars. Explosive Mover athletes grew taller and maintained lean mass through advanced training.",
        },
        "2000+": {
            "avg_height_cm": 178.0,
            "avg_weight_kg": 70.0,
            "avg_bmi": 22.0,
            "athlete_count": 959,
            "top_sports": ["100m Sprint", "Long Jump", "Para Athletics Sprints"],
            "narrative": "Running prostheses have enabled Paralympic sprinters to approach able-bodied times. The T64 100m has become a showcase event.",
        },
    },
    "Coordinated Specialist": {
        "pre-1950": {
            "avg_height_cm": 158.0,
            "avg_weight_kg": 52.0,
            "avg_bmi": 20.8,
            "athlete_count": 67,
            "top_sports": ["Gymnastics", "Diving"],
            "narrative": "Early gymnastics featured fewer acrobatic elements. Athletes were compact but technique was still developing.",
        },
        "1950-1980": {
            "avg_height_cm": 160.0,
            "avg_weight_kg": 54.0,
            "avg_bmi": 21.1,
            "athlete_count": 234,
            "top_sports": ["Gymnastics", "Diving", "Figure Skating"],
            "narrative": "Television brought gymnastics to mass audiences. Routines became more complex as coaching methods improved.",
        },
        "1980-2000": {
            "avg_height_cm": 163.0,
            "avg_weight_kg": 57.0,
            "avg_bmi": 21.4,
            "athlete_count": 423,
            "top_sports": ["Gymnastics", "Diving", "Figure Skating"],
            "narrative": "The era of perfect 10s and quad jumps. Coordinated Specialists pushed the boundaries of what seemed physically possible.",
        },
        "2000+": {
            "avg_height_cm": 165.0,
            "avg_weight_kg": 59.0,
            "avg_bmi": 21.6,
            "athlete_count": 523,
            "top_sports": ["Gymnastics", "Diving", "Para Swimming", "Wheelchair Fencing"],
            "narrative": "New scoring systems reward complexity. Para Swimming showcases coordination mastery in an adaptive context.",
        },
    },
    "Tactical Endurance": {
        "pre-1950": {
            "avg_height_cm": 180.0,
            "avg_weight_kg": 78.0,
            "avg_bmi": 24.1,
            "athlete_count": 98,
            "top_sports": ["Rowing", "Swimming"],
            "narrative": "Rowing eights dominated collegiate athletics. Early swimmers competed in open water before modern pools existed.",
        },
        "1950-1980": {
            "avg_height_cm": 182.0,
            "avg_weight_kg": 80.0,
            "avg_bmi": 24.2,
            "athlete_count": 389,
            "top_sports": ["Rowing", "Swimming", "Canoeing"],
            "narrative": "Olympic pools standardized at 50m. Rowing technology advanced with fiberglass shells and sliding seats.",
        },
        "1980-2000": {
            "avg_height_cm": 184.0,
            "avg_weight_kg": 81.0,
            "avg_bmi": 23.9,
            "athlete_count": 567,
            "top_sports": ["Rowing", "Swimming", "Triathlon"],
            "narrative": "Video analysis transformed stroke technique. Tactical Endurance athletes became more efficient through biomechanical optimization.",
        },
        "2000+": {
            "avg_height_cm": 185.0,
            "avg_weight_kg": 82.0,
            "avg_bmi": 24.0,
            "athlete_count": 838,
            "top_sports": ["Rowing", "Swimming", "Para Rowing", "Para Swimming"],
            "narrative": "The tallest archetype continues to grow. Para Rowing classifications ensure athletes of all functional abilities can compete.",
        },
    },
    "Precision Athlete": {
        "pre-1950": {
            "avg_height_cm": 173.0,
            "avg_weight_kg": 70.0,
            "avg_bmi": 23.4,
            "athlete_count": 112,
            "top_sports": ["Shooting", "Archery"],
            "narrative": "Precision sports demanded steady nerves in an era before sports psychology. Equipment was rudimentary by modern standards.",
        },
        "1950-1980": {
            "avg_height_cm": 175.0,
            "avg_weight_kg": 72.0,
            "avg_bmi": 23.5,
            "athlete_count": 345,
            "top_sports": ["Shooting", "Archery", "Fencing"],
            "narrative": "Electronic scoring transformed fencing. Shooting equipment became more specialized for competition.",
        },
        "1980-2000": {
            "avg_height_cm": 176.0,
            "avg_weight_kg": 73.0,
            "avg_bmi": 23.6,
            "athlete_count": 489,
            "top_sports": ["Shooting", "Archery", "Fencing"],
            "narrative": "Mental training became as important as physical preparation. Precision Athlete build remained stable.",
        },
        "2000+": {
            "avg_height_cm": 177.0,
            "avg_weight_kg": 74.0,
            "avg_bmi": 23.7,
            "athlete_count": 588,
            "top_sports": ["Shooting", "Archery", "Fencing", "Para Archery", "Boccia"],
            "narrative": "Boccia emerged as a Paralympic precision sport. Technology aids have made archery accessible to athletes with upper limb impairments.",
        },
    },
    "Adaptive Power": {
        "pre-1950": {
            "avg_height_cm": None,
            "avg_weight_kg": None,
            "avg_bmi": None,
            "athlete_count": 0,
            "top_sports": [],
            "narrative": "Paralympic sport had not yet been formalized. Athletes with disabilities had few competitive opportunities.",
        },
        "1950-1980": {
            "avg_height_cm": 172.0,
            "avg_weight_kg": 78.0,
            "avg_bmi": 26.4,
            "athlete_count": 56,
            "top_sports": ["Wheelchair Basketball"],
            "narrative": "The Stoke Mandeville Games laid the foundation for Paralympic sport. Wheelchair basketball emerged from rehabilitation programs.",
        },
        "1980-2000": {
            "avg_height_cm": 174.0,
            "avg_weight_kg": 82.0,
            "avg_bmi": 27.1,
            "athlete_count": 234,
            "top_sports": ["Wheelchair Basketball", "Wheelchair Rugby", "Para Powerlifting"],
            "narrative": "Wheelchair rugby ('murderball') captured public attention. Adaptive Power athletes developed specialized upper body strength programs.",
        },
        "2000+": {
            "avg_height_cm": 175.0,
            "avg_weight_kg": 85.0,
            "avg_bmi": 27.8,
            "athlete_count": 557,
            "top_sports": ["Wheelchair Rugby", "Para Powerlifting", "Seated Throws", "Wheelchair Basketball"],
            "narrative": "Paralympic media coverage has grown exponentially. Adaptive Power athletes now have professional pathways and sponsorship opportunities.",
        },
    },
    "Adaptive Endurance": {
        "pre-1950": {
            "avg_height_cm": None,
            "avg_weight_kg": None,
            "avg_bmi": None,
            "athlete_count": 0,
            "top_sports": [],
            "narrative": "Paralympic sport had not yet been formalized. Endurance events for athletes with disabilities did not exist.",
        },
        "1950-1980": {
            "avg_height_cm": 170.0,
            "avg_weight_kg": 65.0,
            "avg_bmi": 22.5,
            "athlete_count": 34,
            "top_sports": ["Wheelchair Racing"],
            "narrative": "Early wheelchair racing used standard chairs. Athletes pioneered endurance training adapted for upper body propulsion.",
        },
        "1980-2000": {
            "avg_height_cm": 171.0,
            "avg_weight_kg": 66.0,
            "avg_bmi": 22.6,
            "athlete_count": 145,
            "top_sports": ["Wheelchair Marathon", "Para Cycling"],
            "narrative": "Racing wheelchair technology advanced rapidly. Carbon fiber frames and aerodynamic positioning transformed the sport.",
        },
        "2000+": {
            "avg_height_cm": 172.0,
            "avg_weight_kg": 68.0,
            "avg_bmi": 23.0,
            "athlete_count": 433,
            "top_sports": ["Wheelchair Marathon", "Para Cycling", "Para Triathlon", "Para Cross-Country Skiing"],
            "narrative": "Wheelchair marathoners now finish faster than running marathoners. Handcycling has become a major Paralympic discipline.",
        },
    },
}


@dataclass
class EraEvolutionArgs:
    """Arguments for era_evolution tool."""
    archetype: str


def era_evolution_tool(args: EraEvolutionArgs) -> dict[str, Any]:
    """
    Return era-by-era evolution data for an archetype.

    Shows how athletes of this archetype have changed across four eras:
    - pre-1950 (Pioneer Era)
    - 1950-1980 (Golden Era)
    - 1980-2000 (Modern Era)
    - 2000+ (Contemporary Era)

    Args:
        args: Archetype name

    Returns:
        Dictionary containing era data with stats and narratives
    """
    archetype = get_archetype_by_name(args.archetype)

    if not archetype:
        return {
            "error": f"Archetype '{args.archetype}' not found",
            "available_archetypes": [a.name for a in ARCHETYPES],
        }

    evolution_data = ERA_EVOLUTION_DATA.get(archetype.name, {})

    eras = []
    for era_key, era_meta in ERAS.items():
        era_data = evolution_data.get(era_key, {})

        eras.append({
            "era": era_key,
            "label": era_meta["label"],
            "years": era_meta["years"],
            "color": era_meta["color"],
            "avg_height_cm": era_data.get("avg_height_cm"),
            "avg_weight_kg": era_data.get("avg_weight_kg"),
            "avg_bmi": era_data.get("avg_bmi"),
            "athlete_count": era_data.get("athlete_count", 0),
            "top_sports": era_data.get("top_sports", []),
            "narrative": era_data.get("narrative", ""),
        })

    # Calculate evolution summary
    first_era = next((e for e in eras if e["avg_height_cm"]), None)
    last_era = eras[-1] if eras[-1]["avg_height_cm"] else None

    summary = None
    if first_era and last_era and first_era != last_era:
        height_change = last_era["avg_height_cm"] - first_era["avg_height_cm"]
        weight_change = last_era["avg_weight_kg"] - first_era["avg_weight_kg"]

        summary = {
            "height_change_cm": round(height_change, 1),
            "weight_change_kg": round(weight_change, 1),
            "total_athlete_growth": sum(e["athlete_count"] for e in eras),
            "direction": "taller and heavier" if height_change > 0 and weight_change > 0 else
                        "taller and leaner" if height_change > 0 and weight_change <= 0 else
                        "stable build" if abs(height_change) < 2 else "evolved",
        }

    return {
        "archetype": archetype.name,
        "description": archetype.description,
        "eras": eras,
        "evolution_summary": summary,
        "current_stats": {
            "mean_height_cm": archetype.mean_height_cm,
            "mean_weight_kg": archetype.mean_weight_kg,
            "mean_bmi": archetype.mean_bmi,
            "athlete_count": archetype.athlete_count,
        },
    }


# Tool metadata for ADK registration
TOOL_NAME = "era_evolution"
TOOL_DESCRIPTION = """
Get historical evolution data for an archetype across four eras.

Call this tool when the user asks about how an archetype has changed over time,
historical trends, or wants to understand the evolution of athlete body types.

Returns era-by-era statistics including height, weight, BMI averages,
athlete counts, top sports, and narrative descriptions of each period.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "archetype": {
            "type": "string",
            "description": "Name of the archetype (e.g., 'Powerhouse', 'Adaptive Endurance')"
        },
    },
    "required": ["archetype"],
}
