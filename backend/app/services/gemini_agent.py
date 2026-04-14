"""
Gemini agent integration via Vertex AI.

Handles two modes:
  1. Match Mode — generates narrative for archetype results
  2. Conversational Mode — follow-up Q&A with function calling
"""

import os
import json

from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Tool, FunctionDeclaration

from app.models.schemas import MatchRequest
from app.prompts.system_prompt import SYSTEM_PROMPT
from app.prompts.match_prompt import build_match_prompt
from app.services.bigquery_service import (
    query_athletes_by_sport,
    get_archetype_stats,
    get_classification_info,
)

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.5-pro"


def _get_model() -> GenerativeModel:
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(
        MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )


# ── Function declarations for conversational mode ──

_bq_tools = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="query_athletes",
            description="Query historical Team USA athlete data by sport, era, and games type.",
            parameters={
                "type": "object",
                "properties": {
                    "sport": {"type": "string", "description": "Sport name"},
                    "era": {"type": "string", "description": "Era filter: pre-1950, 1950-1980, 1980-2000, 2000+"},
                    "games_type": {"type": "string", "description": "O for Olympic, P for Paralympic, or both"},
                },
                "required": ["sport"],
            },
        ),
        FunctionDeclaration(
            name="get_archetype_stats",
            description="Get statistical profile for an archetype cluster.",
            parameters={
                "type": "object",
                "properties": {
                    "archetype_name": {"type": "string", "description": "Name of the archetype"},
                },
                "required": ["archetype_name"],
            },
        ),
        FunctionDeclaration(
            name="get_classification_info",
            description="Get details about a Paralympic classification code.",
            parameters={
                "type": "object",
                "properties": {
                    "classification_code": {"type": "string", "description": "Classification code e.g. T44, S6"},
                },
                "required": ["classification_code"],
            },
        ),
    ]
)


async def generate_match_narrative(req: MatchRequest, match_result: dict) -> dict:
    """Generate a personalized archetype narrative using Gemini."""
    model = _get_model()

    prompt = build_match_prompt(req, match_result)
    response = model.generate_content(prompt)

    # Parse structured JSON from Gemini response
    text = response.text
    # Try to extract JSON from the response
    try:
        # Look for JSON block in response
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            json_str = text.split("```")[1].split("```")[0].strip()
        else:
            json_str = text.strip()
        data = json.loads(json_str)
    except (json.JSONDecodeError, IndexError):
        # Fallback: construct from match_result + raw narrative
        archetype = match_result["archetype"]
        data = {
            "primary_archetype": {
                "name": archetype.name,
                "description": archetype.description,
                "historical_context": text[:500],
                "confidence": match_result["confidence"],
            },
            "olympic_sports": [
                {"sport": s, "event": s, "why": "Aligned with your build profile."}
                for s in archetype.sports_olympic[:3]
            ],
            "paralympic_sports": [
                {"sport": s, "event": s, "why": "Aligned with your build profile."}
                for s in archetype.sports_paralympic[:3]
            ],
            "digital_mirror": {
                "user_position": match_result["user_position"],
                "centroid_positions": match_result["centroid_positions"],
                "distribution_data": [],
            },
            "narrative": text,
        }

    # Ensure digital mirror data is always present
    data.setdefault("digital_mirror", {
        "user_position": match_result["user_position"],
        "centroid_positions": match_result["centroid_positions"],
        "distribution_data": [],
    })

    return data


# ── Function call handlers ──

_FUNCTION_HANDLERS = {
    "query_athletes": lambda args: query_athletes_by_sport(**args),
    "get_archetype_stats": lambda args: get_archetype_stats(**args),
    "get_classification_info": lambda args: get_classification_info(**args),
}


async def handle_chat_message(
    session_id: str,
    message: str,
    session_context: dict,
) -> str:
    """Handle a conversational follow-up with function calling."""
    model = _get_model()

    # Build conversation history
    history = []
    archetype_context = json.dumps(session_context.get("archetype_result", {}), default=str)

    history.append({
        "role": "user",
        "parts": [f"[Context: User matched archetype data: {archetype_context}]"],
    })

    for msg in session_context.get("messages", []):
        history.append({"role": msg["role"], "parts": [msg["content"]]})

    chat = model.start_chat(history=history)
    response = chat.send_message(message, tools=[_bq_tools])

    # Handle function calls if present
    if response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if hasattr(part, "function_call") and part.function_call:
                fn_name = part.function_call.name
                fn_args = dict(part.function_call.args)
                handler = _FUNCTION_HANDLERS.get(fn_name)
                if handler:
                    result = await handler(fn_args)
                    response = chat.send_message(
                        {"function_response": {"name": fn_name, "response": result}},
                        tools=[_bq_tools],
                    )

    return response.text
