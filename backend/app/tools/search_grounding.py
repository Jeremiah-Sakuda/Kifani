"""
Tool 5: search_grounding

Grounds archetype sports in current Team USA relevance using Google Search.
Returns hedged snippets about recent momentum and news.
"""

import os
from dataclasses import dataclass
from typing import Any

from google.cloud import aiplatform
from vertexai.generative_models import (
    GenerativeModel,
    Tool as VertexTool,
    grounding,
)


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")


@dataclass
class SearchGroundingArgs:
    """Arguments for search_grounding tool."""
    archetype: str
    sports: list[str]
    is_paralympic_focus: bool = False


def search_grounding_tool(args: SearchGroundingArgs) -> dict[str, Any]:
    """
    Ground archetype sports in current Team USA relevance.

    Uses Gemini with Google Search grounding to find recent news
    about Team USA athletes in the matched sports.

    Args:
        args: Archetype name and list of sports to search

    Returns:
        Dictionary containing:
        - grounded_snippets: List of hedged relevance statements
        - search_queries: Queries used for grounding
        - sources: Source attributions
    """
    # Dev mode returns mock data
    if os.getenv("DEV_MODE", "false").lower() == "true":
        return _mock_grounding_result(args)

    try:
        aiplatform.init(project=PROJECT_ID, location=LOCATION)

        # Use Gemini 2.5 Flash for grounding
        model = GenerativeModel("gemini-2.5-flash")

        # Build search-grounded prompt
        sport_type = "Paralympic" if args.is_paralympic_focus else "Olympic"
        sports_list = ", ".join(args.sports[:5])  # Limit to top 5 sports

        prompt = f"""Find recent Team USA news and momentum in these {sport_type} sports: {sports_list}.

Focus on:
- Recent Team USA achievements or notable performances
- Upcoming competitions or qualifications for LA28
- Rising athletes or team developments

Provide 2-3 brief, factual statements about current Team USA relevance.
Use hedged language like "Recent reports suggest..." or "Team USA appears to have momentum in..."
Do NOT mention specific athlete names.
Keep each statement under 50 words."""

        # Create Google Search grounding tool
        google_search_tool = VertexTool.from_google_search_retrieval(
            grounding.GoogleSearchRetrieval()
        )

        # Generate with grounding
        response = model.generate_content(
            prompt,
            tools=[google_search_tool],
        )

        # Extract grounded text
        grounded_text = response.text if hasattr(response, 'text') else ""

        # Parse into snippets (split by newlines or bullet points)
        snippets = []
        for line in grounded_text.split('\n'):
            line = line.strip()
            if line and len(line) > 20:
                # Clean up bullet points
                if line.startswith(('-', '*', '•')):
                    line = line[1:].strip()
                if line.startswith(('1.', '2.', '3.')):
                    line = line[2:].strip()
                snippets.append(line)

        # Extract grounding metadata if available
        sources = []
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata'):
                metadata = candidate.grounding_metadata
                if hasattr(metadata, 'web_search_queries'):
                    sources = list(metadata.web_search_queries)

        return {
            "archetype": args.archetype,
            "sports_searched": args.sports[:5],
            "grounded_snippets": snippets[:3],  # Limit to 3 snippets
            "search_context": f"Team USA {sport_type} momentum",
            "sources": sources,
            "is_grounded": True,
        }

    except Exception as e:
        # Graceful fallback on error
        return {
            "archetype": args.archetype,
            "sports_searched": args.sports[:5],
            "grounded_snippets": [
                f"Team USA continues to develop strong programs in {args.sports[0] if args.sports else 'various sports'}."
            ],
            "search_context": "Grounding unavailable",
            "sources": [],
            "is_grounded": False,
            "error": str(e),
        }


def _mock_grounding_result(args: SearchGroundingArgs) -> dict[str, Any]:
    """Return mock grounding data for dev mode."""
    sport = args.sports[0] if args.sports else "athletics"
    sport_type = "Paralympic" if args.is_paralympic_focus else "Olympic"

    return {
        "archetype": args.archetype,
        "sports_searched": args.sports[:5],
        "grounded_snippets": [
            f"Recent reports suggest Team USA has shown strong momentum in {sport} programs ahead of LA28.",
            f"Team USA {sport_type} programs appear to be expanding training infrastructure for the 2028 Games.",
        ],
        "search_context": f"Team USA {sport_type} momentum",
        "sources": ["google.com/search"],
        "is_grounded": True,
        "dev_mode": True,
    }


# Tool metadata for ADK registration
TOOL_NAME = "search_grounding"
TOOL_DESCRIPTION = """
Ground archetype sports in current Team USA relevance using Google Search.

Call this tool AFTER matching an archetype to add current context about
Team USA momentum in the matched sports. Returns hedged statements about
recent news, achievements, or developments.

This provides "national momentum" context that complements the historical
archetype data with current relevance.
"""

TOOL_PARAMETERS = {
    "type": "object",
    "properties": {
        "archetype": {
            "type": "string",
            "description": "The matched archetype name (e.g., 'Adaptive Endurance')"
        },
        "sports": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of sports aligned with the archetype (e.g., ['Para Cycling', 'Wheelchair Marathon'])"
        },
        "is_paralympic_focus": {
            "type": "boolean",
            "description": "Whether to focus on Paralympic sports momentum"
        },
    },
    "required": ["archetype", "sports"],
}
