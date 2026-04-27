"""
Tool 4: generate_followups

Generates personalized follow-up questions based on session context.
Questions help users explore their archetype match in depth.
"""

from dataclasses import dataclass
from typing import Any


@dataclass
class GenerateFollowupsArgs:
    """Arguments for generate_followups tool."""
    session_id: str
    archetype: str
    sports_discussed: list[str] | None = None
    topics_covered: list[str] | None = None


# Question templates by category
QUESTION_TEMPLATES = {
    "sport_specific": [
        "What specific events within {sport} might align with my build?",
        "How has the typical body type for {sport} changed over the past 50 years?",
        "What training adaptations would someone with my build need for {sport}?",
        "Which Team USA {sport} athletes had a similar build to mine?",
    ],
    "paralympic_depth": [
        "What classification would I look up if I had a {impairment_type}?",
        "How do Paralympic {sport} athletes train differently than Olympic athletes?",
        "What adaptive equipment is used in {sport}?",
        "Which Paralympic classifications best match my body type?",
    ],
    "historical": [
        "How has the {archetype} archetype evolved over 120 years?",
        "What was the most successful era for {archetype} athletes?",
        "Which decade produced the most medals for athletes like me?",
        "How did training methods change for {archetype} athletes over time?",
    ],
    "comparative": [
        "Why {sport1} and not {sport2} for my build?",
        "What's the difference between {archetype} and {secondary_archetype}?",
        "How close am I to the {secondary_archetype} archetype?",
        "What would I need to change to better fit the {secondary_archetype} profile?",
    ],
    "personal_exploration": [
        "What activities could help me develop my {archetype} potential?",
        "Are there recreational versions of these sports I could try?",
        "What youth sports align with my archetype?",
        "How do my activity preferences affect my archetype match?",
    ],
    "endurance_specific": [
        "What's the ideal BMI range for endurance events?",
        "How does altitude training benefit {archetype} athletes?",
        "What's the difference between marathon and ultramarathon body types?",
        "How important is VO2 max for my archetype?",
    ],
    "power_specific": [
        "What's the relationship between mass and force production for my archetype?",
        "How do throwing athletes train differently from lifters?",
        "What role does fast-twitch muscle fiber play for {archetype}?",
        "How does age affect power output for my archetype?",
    ],
    "precision_specific": [
        "How important is hand steadiness for {sport}?",
        "What mental training do precision athletes use?",
        "How does body awareness factor into {sport}?",
        "What fine motor skills are most important for my archetype?",
    ],
}

# Impairment types for Paralympic questions
IMPAIRMENT_TYPES = [
    "leg amputation",
    "arm amputation",
    "spinal cord injury",
    "visual impairment",
    "coordination impairment",
    "limb difference",
]


def generate_followups_tool(args: GenerateFollowupsArgs) -> dict[str, Any]:
    """
    Generate personalized follow-up questions based on session context.

    Creates relevant, contextual questions that help users explore their
    archetype match and understand Team USA athletic history.

    Args:
        args: Session context including archetype and topics already covered

    Returns:
        Dictionary containing:
        - suggested_questions: List of personalized questions
        - categories: Question categories available
        - context: Why these questions were selected
    """
    archetype = args.archetype
    sports_discussed = args.sports_discussed or []
    topics_covered = args.topics_covered or []

    questions = []
    categories_used = []

    # Determine archetype category for specialized questions
    archetype_lower = archetype.lower()

    if "power" in archetype_lower:
        category = "power_specific"
    elif "endurance" in archetype_lower or "aerobic" in archetype_lower:
        category = "endurance_specific"
    elif "precision" in archetype_lower:
        category = "precision_specific"
    else:
        category = "personal_exploration"

    # Add sport-specific questions if sports were discussed
    if sports_discussed:
        sport = sports_discussed[0]
        templates = QUESTION_TEMPLATES["sport_specific"]
        questions.append(templates[0].format(sport=sport))
        questions.append(templates[2].format(sport=sport))
        categories_used.append("sport_specific")

    # Add Paralympic depth questions (always relevant for parity)
    if "paralympic" not in [t.lower() for t in topics_covered]:
        impairment = IMPAIRMENT_TYPES[hash(args.session_id) % len(IMPAIRMENT_TYPES)]
        templates = QUESTION_TEMPLATES["paralympic_depth"]
        questions.append(templates[0].format(impairment_type=impairment))
        categories_used.append("paralympic_depth")

    # Add historical question
    if "history" not in [t.lower() for t in topics_covered]:
        templates = QUESTION_TEMPLATES["historical"]
        questions.append(templates[0].format(archetype=archetype))
        categories_used.append("historical")

    # Add archetype-specific questions
    templates = QUESTION_TEMPLATES[category]
    questions.append(templates[0].format(archetype=archetype))
    categories_used.append(category)

    # Add comparative question
    comparative_templates = QUESTION_TEMPLATES["comparative"]
    # Pick a plausible secondary archetype
    secondary = {
        "Powerhouse": "Tactical Endurance",
        "Aerobic Engine": "Explosive Mover",
        "Precision Athlete": "Coordinated Specialist",
        "Explosive Mover": "Aerobic Engine",
        "Coordinated Specialist": "Precision Athlete",
        "Tactical Endurance": "Powerhouse",
        "Adaptive Power": "Powerhouse",
        "Adaptive Endurance": "Aerobic Engine",
    }.get(archetype, "Precision Athlete")

    questions.append(comparative_templates[1].format(
        archetype=archetype,
        secondary_archetype=secondary
    ))
    categories_used.append("comparative")

    # Ensure we have 4-6 questions
    if len(questions) < 4:
        personal_templates = QUESTION_TEMPLATES["personal_exploration"]
        questions.append(personal_templates[0].format(archetype=archetype))
        categories_used.append("personal_exploration")

    # Limit to 6 questions
    questions = questions[:6]

    return {
        "suggested_questions": questions,
        "categories_used": list(set(categories_used)),
        "total_available_categories": list(QUESTION_TEMPLATES.keys()),
        "context": f"Questions generated for {archetype} archetype based on session history.",
        "note": "These questions are designed to help explore the archetype match and Team USA athletic history.",
    }


# Tool metadata for ADK registration
TOOL_NAME = "generate_followups"
TOOL_DESCRIPTION = """
Generate personalized follow-up questions based on session context.

Call this tool when the conversation could benefit from suggested questions
or when the user seems unsure what to ask next. Returns relevant, contextual
questions based on the user's archetype and what topics have already been
discussed.

The questions help users explore their archetype match, understand Paralympic
classifications, and learn about Team USA athletic history.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "session_id": {
            "type": "string",
            "description": "The session ID for personalization"
        },
        "archetype": {
            "type": "string",
            "description": "The user's matched archetype name"
        },
        "sports_discussed": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Sports already discussed in the conversation"
        },
        "topics_covered": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Topics already covered (e.g., 'history', 'paralympic')"
        },
    },
    "required": ["session_id", "archetype"],
}
