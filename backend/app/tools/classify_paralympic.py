"""
Tool 2: classify_paralympic

Generates Paralympic sport mappings with classification depth.
Explains classification codes (T54, T11, S6, etc.) with analytical rigor.
"""

from dataclasses import dataclass
from typing import Any

from app.models.archetypes import get_archetype_by_name, ARCHETYPES


# Comprehensive classification database
CLASSIFICATIONS = {
    # Para Athletics - Track (T)
    "T11": {
        "sport": "Para Athletics",
        "category": "Visual Impairment",
        "description": "Athletes with total or near-total blindness. Compete with a guide runner connected by a tether.",
        "eligibility": "Visual acuity less than 2.60 LogMAR",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon", "Long Jump"],
    },
    "T12": {
        "sport": "Para Athletics",
        "category": "Visual Impairment",
        "description": "Athletes with partial sight. May compete with or without a guide.",
        "eligibility": "Visual acuity from 1.50 to 2.60 LogMAR or visual field less than 10 degrees",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon", "Long Jump"],
    },
    "T13": {
        "sport": "Para Athletics",
        "category": "Visual Impairment",
        "description": "Athletes with the mildest visual impairment in Para Athletics.",
        "eligibility": "Visual acuity from 1.00 to 1.50 LogMAR or visual field less than 40 degrees",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon"],
    },
    "T20": {
        "sport": "Para Athletics",
        "category": "Intellectual Impairment",
        "description": "Athletes with intellectual impairment affecting athletic performance.",
        "eligibility": "IQ below 75 with limitations in adaptive behavior",
        "events": ["400m", "1500m", "Long Jump", "Shot Put"],
    },
    "T33": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Wheelchair)",
        "description": "Wheelchair athletes with coordination impairments affecting all four limbs. Moderate trunk control.",
        "eligibility": "Typically cerebral palsy affecting all limbs with moderate trunk control",
        "events": ["100m", "200m", "400m", "800m"],
    },
    "T34": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Wheelchair)",
        "description": "Wheelchair athletes with coordination impairments but good trunk control.",
        "eligibility": "Cerebral palsy with good sitting balance and trunk control",
        "events": ["100m", "200m", "400m", "800m"],
    },
    "T35": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Ambulant)",
        "description": "Athletes with coordination impairments who can run with some difficulty.",
        "eligibility": "Hypertonia, ataxia, or athetosis affecting all four limbs",
        "events": ["100m", "200m", "400m"],
    },
    "T36": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Ambulant)",
        "description": "Athletes with coordination impairments with moderate walking ability.",
        "eligibility": "Athetosis, ataxia, or hypertonia affecting all four limbs",
        "events": ["100m", "200m", "400m", "800m"],
    },
    "T37": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Ambulant)",
        "description": "Athletes who walk and run with asymmetric gait. Affects one side.",
        "eligibility": "Hemiplegia — coordination impairment on one side of body",
        "events": ["100m", "200m", "400m"],
    },
    "T38": {
        "sport": "Para Athletics",
        "category": "Coordination Impairment (Ambulant)",
        "description": "Athletes with mild coordination issues. Close to full running ability.",
        "eligibility": "Mild hypertonia, ataxia, or athetosis",
        "events": ["100m", "200m", "400m", "Long Jump"],
    },
    "T42": {
        "sport": "Para Athletics",
        "category": "Limb Deficiency (Ambulant)",
        "description": "Athletes with single above-knee amputation or equivalent. Compete without prosthesis.",
        "eligibility": "Single above-knee amputation or limb deficiency",
        "events": ["100m", "200m", "400m", "Long Jump", "High Jump"],
    },
    "T44": {
        "sport": "Para Athletics",
        "category": "Limb Deficiency (Ambulant)",
        "description": "Athletes with below-knee amputation affecting one or both legs. Running prostheses common.",
        "eligibility": "Below-knee amputation or limb impairment",
        "events": ["100m", "200m", "400m", "800m", "Long Jump"],
    },
    "T46": {
        "sport": "Para Athletics",
        "category": "Limb Deficiency (Ambulant)",
        "description": "Athletes with upper limb deficiency affecting one or both arms.",
        "eligibility": "Arm amputation or limb difference",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon"],
    },
    "T51": {
        "sport": "Para Athletics",
        "category": "Spinal Cord Injury (Wheelchair)",
        "description": "Wheelchair racers with limited shoulder and arm function. No trunk or leg function.",
        "eligibility": "C5-C6 spinal cord injury or equivalent",
        "events": ["100m", "200m", "400m", "800m"],
    },
    "T52": {
        "sport": "Para Athletics",
        "category": "Spinal Cord Injury (Wheelchair)",
        "description": "Wheelchair racers with functional arms but no trunk or leg function.",
        "eligibility": "C7-C8 spinal cord injury or equivalent",
        "events": ["100m", "200m", "400m", "800m", "1500m"],
    },
    "T53": {
        "sport": "Para Athletics",
        "category": "Spinal Cord Injury (Wheelchair)",
        "description": "Wheelchair racers with full arm function and some trunk control. No leg function.",
        "eligibility": "T1-T7 spinal cord injury or equivalent",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon"],
    },
    "T54": {
        "sport": "Para Athletics",
        "category": "Spinal Cord Injury (Wheelchair)",
        "description": "Wheelchair racers with full arm and partial trunk function. Most functional wheelchair class.",
        "eligibility": "T8-S2 spinal cord injury or equivalent",
        "events": ["100m", "200m", "400m", "800m", "1500m", "5000m", "Marathon"],
    },
    "T61": {
        "sport": "Para Athletics",
        "category": "Running Prosthesis (Bilateral)",
        "description": "Athletes with bilateral below-knee amputation using running prostheses.",
        "eligibility": "Double below-knee amputation",
        "events": ["100m", "200m"],
    },
    "T63": {
        "sport": "Para Athletics",
        "category": "Running Prosthesis (Unilateral)",
        "description": "Athletes with unilateral above-knee amputation using a running prosthesis.",
        "eligibility": "Single above-knee amputation",
        "events": ["100m", "200m", "400m"],
    },
    "T64": {
        "sport": "Para Athletics",
        "category": "Running Prosthesis (Unilateral)",
        "description": "Athletes with unilateral below-knee amputation using running prostheses.",
        "eligibility": "Single below-knee amputation or equivalent",
        "events": ["100m", "200m", "400m", "Long Jump"],
    },

    # Para Swimming (S)
    "S1": {
        "sport": "Para Swimming",
        "category": "Physical Impairment (Severe)",
        "description": "Swimmers with significant physical impairment in all limbs. Most limited functional ability.",
        "eligibility": "Very limited use of arms and legs, minimal trunk control",
        "events": ["50m Freestyle", "50m Backstroke"],
    },
    "S6": {
        "sport": "Para Swimming",
        "category": "Physical Impairment (Moderate)",
        "description": "Swimmers with moderate physical impairments. Some trunk control and limited leg function.",
        "eligibility": "May have short stature, limb deficiency, or coordination impairment",
        "events": ["50m Freestyle", "100m Freestyle", "400m Freestyle", "100m Backstroke"],
    },
    "S10": {
        "sport": "Para Swimming",
        "category": "Physical Impairment (Mild)",
        "description": "Swimmers with minimal physical impairment affecting swimming.",
        "eligibility": "Minimal limb deficiency or mild coordination impairment",
        "events": ["50m Freestyle", "100m Freestyle", "400m Freestyle", "100m Butterfly"],
    },
    "S11": {
        "sport": "Para Swimming",
        "category": "Visual Impairment",
        "description": "Swimmers with total or near-total visual impairment. Wear blackout goggles.",
        "eligibility": "No light perception in either eye",
        "events": ["50m Freestyle", "100m Freestyle", "400m Freestyle", "100m Backstroke"],
    },
    "S14": {
        "sport": "Para Swimming",
        "category": "Intellectual Impairment",
        "description": "Swimmers with intellectual impairment affecting swimming performance.",
        "eligibility": "IQ below 75 with limitations in adaptive behavior",
        "events": ["100m Freestyle", "200m Freestyle"],
    },

    # Wheelchair Basketball
    "WH1": {
        "sport": "Wheelchair Basketball",
        "category": "Classification Point System",
        "description": "Players with most significant functional limitations. Minimal trunk movement.",
        "eligibility": "1.0-1.5 points — high spinal cord injury or equivalent",
        "events": ["Team Competition"],
    },
    "WH4": {
        "sport": "Wheelchair Basketball",
        "category": "Classification Point System",
        "description": "Players with good trunk control and some leg function. Most functional class.",
        "eligibility": "4.0-4.5 points — lower spinal injury, amputation, or other eligible impairment",
        "events": ["Team Competition"],
    },

    # Boccia
    "BC1": {
        "sport": "Boccia",
        "category": "Cerebral Palsy",
        "description": "Athletes with cerebral palsy who can throw the ball. May use hands or feet.",
        "eligibility": "Cerebral palsy with severe functional limitations in all four limbs",
        "events": ["Individual", "Pairs", "Team"],
    },
    "BC3": {
        "sport": "Boccia",
        "category": "Severe Physical Impairment",
        "description": "Athletes with severe impairment in all four limbs. Use a ramp to propel the ball.",
        "eligibility": "Requires assistant to adjust ramp; cannot throw independently",
        "events": ["Individual", "Pairs"],
    },
    "BC4": {
        "sport": "Boccia",
        "category": "Other Physical Impairment",
        "description": "Athletes with severe physical impairment (non-cerebral palsy). May use a ramp.",
        "eligibility": "Muscular dystrophy, spinal cord injury, or other conditions",
        "events": ["Individual", "Pairs"],
    },
}


@dataclass
class ClassifyParalympicArgs:
    """Arguments for classify_paralympic tool."""
    archetype: str
    classification_context: str | None = None
    disability_type: str | None = None


def classify_paralympic_tool(args: ClassifyParalympicArgs) -> dict[str, Any]:
    """
    Generate Paralympic sport mappings with classification depth.

    Explains classification codes with the same analytical rigor
    as Olympic event categorization.

    Args:
        args: Archetype name and optional disability context

    Returns:
        Dictionary containing:
        - archetype_sports: Paralympic sports for this archetype
        - classifications: Detailed classification explanations
        - context_specific: Sports filtered by disability type if provided
    """
    archetype = get_archetype_by_name(args.archetype)

    if not archetype:
        return {
            "error": f"Archetype '{args.archetype}' not found",
            "available_archetypes": [a.name for a in ARCHETYPES],
        }

    # Get all Paralympic sports for this archetype
    sports = []
    for sport_mapping in archetype.sports_paralympic:
        sport_data = {
            "sport": sport_mapping.sport,
            "events": sport_mapping.events,
            "why": sport_mapping.why,
            "classification_code": sport_mapping.classification,
            "classification_explainer": sport_mapping.classification_explainer,
        }

        # Add detailed classification info if available
        if sport_mapping.classification:
            codes = sport_mapping.classification.replace(" ", "").split(",")
            detailed = []
            for code in codes[:3]:  # Limit to 3 codes
                code_upper = code.upper().strip()
                if code_upper in CLASSIFICATIONS:
                    detailed.append({
                        "code": code_upper,
                        **CLASSIFICATIONS[code_upper],
                    })
            sport_data["classification_details"] = detailed

        sports.append(sport_data)

    # Filter by disability type if provided
    context_specific = []
    if args.disability_type:
        disability_lower = args.disability_type.lower()
        for code, info in CLASSIFICATIONS.items():
            category_lower = info["category"].lower()
            if (disability_lower in category_lower or
                disability_lower in info["description"].lower()):
                context_specific.append({
                    "code": code,
                    **info,
                })

    # Build classification context narrative
    if args.classification_context:
        context_note = (
            f"Based on the context '{args.classification_context}', "
            f"classifications in the {archetype.name} archetype typically "
            f"cover athletes who can leverage their build in Paralympic-specific "
            f"adaptations of these sports."
        )
    else:
        context_note = (
            f"The {archetype.name} archetype includes Paralympic athletes "
            f"across various classifications who share similar body composition "
            f"while competing in adapted formats."
        )

    return {
        "archetype": archetype.name,
        "archetype_sports": sports,
        "context_note": context_note,
        "context_specific_classifications": context_specific if context_specific else None,
        "total_classifications_available": len(CLASSIFICATIONS),
    }


# Tool metadata for ADK registration
TOOL_NAME = "classify_paralympic"
TOOL_DESCRIPTION = """
Get Paralympic sport mappings with classification depth for an archetype.

Call this tool when the user asks about Paralympic sports, classification codes,
or wants to understand what sports might align with a specific disability type.

The tool explains classification codes (T54, S6, BC1, etc.) with the same
analytical rigor as Olympic event categorization. It returns detailed
eligibility criteria and typical events for each classification.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "archetype": {
            "type": "string",
            "description": "Name of the archetype (e.g., 'Adaptive Power', 'Aerobic Engine')"
        },
        "classification_context": {
            "type": "string",
            "description": "Optional context about the user's question (e.g., 'wheelchair sprint racing')"
        },
        "disability_type": {
            "type": "string",
            "description": "Optional disability type to filter classifications (e.g., 'visual impairment', 'limb deficiency', 'spinal cord')"
        },
    },
    "required": ["archetype"],
}
