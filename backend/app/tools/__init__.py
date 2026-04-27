"""
FORGED — ADK Tool Definitions

Four tools for the archetype agent:
1. match_archetype - Match user traits to archetypes
2. classify_paralympic - Get Paralympic classification depth
3. regional_context - Get regional archetype prevalence
4. generate_followups - Generate personalized follow-up questions
"""

from app.tools.match_archetype import match_archetype_tool, MatchArchetypeArgs
from app.tools.classify_paralympic import classify_paralympic_tool, ClassifyParalympicArgs
from app.tools.regional_context import regional_context_tool, RegionalContextArgs
from app.tools.generate_followups import generate_followups_tool, GenerateFollowupsArgs

__all__ = [
    "match_archetype_tool",
    "MatchArchetypeArgs",
    "classify_paralympic_tool",
    "ClassifyParalympicArgs",
    "regional_context_tool",
    "RegionalContextArgs",
    "generate_followups_tool",
    "GenerateFollowupsArgs",
]
