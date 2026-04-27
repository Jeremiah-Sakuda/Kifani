"""
FORGED — ADK Agent Orchestrator

Orchestrates the 4 archetype tools with Gemini 2.5 Pro using Google's ADK pattern.
Yields streaming events for real-time reasoning trace display.
"""

import asyncio
import json
import os
from dataclasses import dataclass
from typing import Any, AsyncIterator
from enum import Enum

from google.cloud import aiplatform
from vertexai.generative_models import (
    GenerativeModel,
    Tool,
    FunctionDeclaration,
    Part,
    Content,
)

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.tools.match_archetype import (
    match_archetype_tool,
    MatchArchetypeArgs,
    TOOL_DESCRIPTION as MATCH_DESCRIPTION,
    TOOL_PARAMETERS as MATCH_PARAMS,
)
from app.tools.classify_paralympic import (
    classify_paralympic_tool,
    ClassifyParalympicArgs,
    TOOL_DESCRIPTION as CLASSIFY_DESCRIPTION,
    TOOL_PARAMETERS as CLASSIFY_PARAMS,
)
from app.tools.regional_context import (
    regional_context_tool,
    RegionalContextArgs,
    TOOL_DESCRIPTION as REGIONAL_DESCRIPTION,
    TOOL_PARAMETERS as REGIONAL_PARAMS,
)
from app.tools.generate_followups import (
    generate_followups_tool,
    GenerateFollowupsArgs,
    TOOL_DESCRIPTION as FOLLOWUP_DESCRIPTION,
    TOOL_PARAMETERS as FOLLOWUP_PARAMS,
)


PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.5-pro"


class EventType(str, Enum):
    """SSE event types for reasoning trace."""
    THINKING = "thinking"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    RESPONSE = "response"
    ERROR = "error"
    COMPLETE = "complete"


@dataclass
class StreamEvent:
    """A single SSE event in the reasoning trace."""
    event_type: EventType
    data: dict[str, Any]

    def to_sse(self) -> str:
        """Format as SSE message."""
        return f"event: {self.event_type.value}\ndata: {json.dumps(self.data)}\n\n"


# ── Tool Definitions for Gemini ──

def _build_tools() -> Tool:
    """Build the Gemini Tool object with all 4 function declarations."""
    return Tool(
        function_declarations=[
            FunctionDeclaration(
                name="match_archetype",
                description=MATCH_DESCRIPTION,
                parameters=MATCH_PARAMS,
            ),
            FunctionDeclaration(
                name="classify_paralympic",
                description=CLASSIFY_DESCRIPTION,
                parameters=CLASSIFY_PARAMS,
            ),
            FunctionDeclaration(
                name="regional_context",
                description=REGIONAL_DESCRIPTION,
                parameters=REGIONAL_PARAMS,
            ),
            FunctionDeclaration(
                name="generate_followups",
                description=FOLLOWUP_DESCRIPTION,
                parameters=FOLLOWUP_PARAMS,
            ),
        ]
    )


# ── Tool Handlers ──

def _execute_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    """Execute a tool by name and return the result."""
    if name == "match_archetype":
        tool_args = MatchArchetypeArgs(
            height_cm=args["height_cm"],
            weight_kg=args["weight_kg"],
            arm_span_cm=args.get("arm_span_cm"),
            activity_preferences=args.get("activity_preferences"),
        )
        return match_archetype_tool(tool_args)

    elif name == "classify_paralympic":
        tool_args = ClassifyParalympicArgs(
            archetype=args["archetype"],
            classification_context=args.get("classification_context"),
            disability_type=args.get("disability_type"),
        )
        return classify_paralympic_tool(tool_args)

    elif name == "regional_context":
        tool_args = RegionalContextArgs(
            archetype=args["archetype"],
            region=args["region"],
        )
        return regional_context_tool(tool_args)

    elif name == "generate_followups":
        tool_args = GenerateFollowupsArgs(
            session_id=args["session_id"],
            archetype=args["archetype"],
            sports_discussed=args.get("sports_discussed"),
            topics_covered=args.get("topics_covered"),
        )
        return generate_followups_tool(tool_args)

    else:
        return {"error": f"Unknown tool: {name}"}


def _get_model() -> GenerativeModel:
    """Initialize and return the Gemini model."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(
        MODEL_NAME,
        system_instruction=SYSTEM_PROMPT,
    )


# ── Agent Orchestration ──

async def run_agent_stream(
    session_id: str,
    user_input: dict[str, Any],
    message: str | None = None,
    history: list[dict] | None = None,
) -> AsyncIterator[StreamEvent]:
    """
    Run the ADK agent loop with streaming events.

    This is the main orchestration function that:
    1. Sends user input to Gemini
    2. Handles tool calls as they come
    3. Yields SSE events for real-time UI updates
    4. Continues until Gemini returns a final response

    Args:
        session_id: Unique session identifier
        user_input: User biometric data (height_cm, weight_kg, etc.)
        message: Optional follow-up message (for chat mode)
        history: Optional conversation history

    Yields:
        StreamEvent objects for SSE transmission
    """
    try:
        model = _get_model()
        tools = _build_tools()

        # Build initial prompt
        if message:
            # Chat mode: use the message directly
            prompt = message
            context_prefix = f"[Session: {session_id}. Previous context available.]\n\n"
        else:
            # Match mode: build from biometric input
            prompt = _build_match_prompt(user_input)
            context_prefix = ""

        # Yield thinking event
        yield StreamEvent(
            event_type=EventType.THINKING,
            data={"message": "Analyzing your profile against Team USA archetypes..."}
        )

        # Start conversation
        conversation_history = []
        if history:
            for msg in history:
                conversation_history.append(
                    Content(
                        role=msg["role"],
                        parts=[Part.from_text(msg["content"])]
                    )
                )

        chat = model.start_chat(history=conversation_history)

        # Send initial message
        full_prompt = context_prefix + prompt
        response = chat.send_message(full_prompt, tools=[tools])

        # Agent loop: handle tool calls until we get a final response
        max_iterations = 10
        iteration = 0
        final_result = None

        while iteration < max_iterations:
            iteration += 1

            # Check if response has function calls
            has_function_call = False
            function_responses = []

            for candidate in response.candidates:
                for part in candidate.content.parts:
                    if hasattr(part, "function_call") and part.function_call:
                        has_function_call = True
                        fn_call = part.function_call
                        fn_name = fn_call.name
                        fn_args = dict(fn_call.args)

                        # Yield tool call event
                        yield StreamEvent(
                            event_type=EventType.TOOL_CALL,
                            data={
                                "tool": fn_name,
                                "args": fn_args,
                                "description": _get_tool_description(fn_name),
                            }
                        )

                        # Execute tool
                        await asyncio.sleep(0.1)  # Small delay for UI
                        result = _execute_tool(fn_name, fn_args)

                        # Yield tool result event
                        yield StreamEvent(
                            event_type=EventType.TOOL_RESULT,
                            data={
                                "tool": fn_name,
                                "result_summary": _summarize_result(fn_name, result),
                                "full_result": result,
                            }
                        )

                        # Build function response
                        function_responses.append({
                            "function_response": {
                                "name": fn_name,
                                "response": result,
                            }
                        })

            if has_function_call:
                # Send function results back to Gemini
                yield StreamEvent(
                    event_type=EventType.THINKING,
                    data={"message": "Processing tool results..."}
                )

                # Send all function responses
                for fn_response in function_responses:
                    response = chat.send_message(fn_response, tools=[tools])
            else:
                # No function calls — we have the final response
                final_text = response.text if hasattr(response, 'text') else ""
                if not final_text:
                    for candidate in response.candidates:
                        for part in candidate.content.parts:
                            if hasattr(part, "text") and part.text:
                                final_text = part.text
                                break

                final_result = final_text
                break

        # Yield final response
        if final_result:
            yield StreamEvent(
                event_type=EventType.RESPONSE,
                data={"narrative": final_result}
            )

        # Yield completion event
        yield StreamEvent(
            event_type=EventType.COMPLETE,
            data={"session_id": session_id}
        )

    except Exception as e:
        yield StreamEvent(
            event_type=EventType.ERROR,
            data={"error": str(e)}
        )


def _build_match_prompt(user_input: dict[str, Any]) -> str:
    """Build the initial match prompt from user biometric input."""
    height = user_input.get("height_cm", 0)
    weight = user_input.get("weight_kg", 0)
    arm_span = user_input.get("arm_span_cm")
    preferences = user_input.get("activity_preferences", [])

    prompt_parts = [
        f"Analyze this user's profile and match them to a Team USA athlete archetype:",
        f"- Height: {height} cm",
        f"- Weight: {weight} kg",
    ]

    if arm_span:
        prompt_parts.append(f"- Arm span: {arm_span} cm")

    if preferences:
        prompt_parts.append(f"- Activity preferences: {', '.join(preferences)}")

    prompt_parts.extend([
        "",
        "Use the match_archetype tool to determine their archetype, then provide:",
        "1. Their primary archetype with confidence score",
        "2. Olympic sports that align with their build",
        "3. Paralympic sports that align with their build (with equal depth)",
        "4. Historical context about this archetype in Team USA history",
        "",
        "Remember to use conditional language ('could align with', 'suggests') per the rules.",
    ])

    return "\n".join(prompt_parts)


def _get_tool_description(tool_name: str) -> str:
    """Get a human-readable description for a tool call."""
    descriptions = {
        "match_archetype": "Matching your build to Team USA archetypes",
        "classify_paralympic": "Analyzing Paralympic classification depth",
        "regional_context": "Checking regional archetype patterns",
        "generate_followups": "Generating personalized follow-up questions",
    }
    return descriptions.get(tool_name, f"Running {tool_name}")


def _summarize_result(tool_name: str, result: dict[str, Any]) -> str:
    """Create a brief summary of a tool result for UI display."""
    if tool_name == "match_archetype":
        primary = result.get("primary_archetype", {})
        name = primary.get("name", "Unknown")
        confidence = primary.get("confidence", 0)
        return f"Matched to {name} archetype ({confidence:.0%} confidence)"

    elif tool_name == "classify_paralympic":
        archetype = result.get("archetype", "Unknown")
        sports_count = len(result.get("archetype_sports", []))
        return f"Found {sports_count} Paralympic sports for {archetype}"

    elif tool_name == "regional_context":
        region = result.get("region", "Unknown")
        prevalence = result.get("prevalence_index", 1.0)
        return f"{region}: {prevalence:.2f}x national average"

    elif tool_name == "generate_followups":
        questions = result.get("suggested_questions", [])
        return f"Generated {len(questions)} follow-up questions"

    return "Tool completed"


# ── Non-Streaming Version ──

async def run_agent(
    session_id: str,
    user_input: dict[str, Any],
    message: str | None = None,
    history: list[dict] | None = None,
) -> dict[str, Any]:
    """
    Run the ADK agent and return the final result (non-streaming).

    Useful for direct API calls that don't need SSE streaming.
    """
    events = []
    final_result = {}

    async for event in run_agent_stream(session_id, user_input, message, history):
        events.append(event)

        if event.event_type == EventType.TOOL_RESULT:
            tool = event.data.get("tool")
            result = event.data.get("full_result", {})

            # Capture match result for the final response
            if tool == "match_archetype":
                final_result["match_result"] = result

        elif event.event_type == EventType.RESPONSE:
            final_result["narrative"] = event.data.get("narrative", "")

        elif event.event_type == EventType.ERROR:
            final_result["error"] = event.data.get("error")

    return final_result
