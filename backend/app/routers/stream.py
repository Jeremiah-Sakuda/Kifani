"""
FORGED — SSE Streaming endpoint for real-time reasoning trace.

Provides Server-Sent Events (SSE) stream of agent reasoning,
tool calls, and results for the Processing screen UI.
"""

import json
import os
import uuid
from typing import AsyncIterator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.adk_agent import run_agent_stream, StreamEvent

router = APIRouter()

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"

# Session store for dev mode
_stream_sessions: dict[str, dict] = {}


class StreamMatchRequest(BaseModel):
    """Request body for streaming match endpoint."""
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    arm_span_cm: float | None = Field(None, gt=0, description="Arm span in centimeters")
    activity_preferences: list[str] | None = Field(None, description="Activity preferences")


class StreamChatRequest(BaseModel):
    """Request body for streaming chat endpoint."""
    session_id: str
    message: str


async def _stream_events(
    events: AsyncIterator[StreamEvent],
    session_id: str,
) -> AsyncIterator[str]:
    """
    Convert StreamEvents to SSE format.

    Yields SSE-formatted strings that can be consumed by EventSource on the frontend.
    """
    try:
        async for event in events:
            yield event.to_sse()

            # Store results in session for later retrieval
            if event.event_type.value == "tool_result":
                tool = event.data.get("tool")
                if tool == "match_archetype":
                    if session_id in _stream_sessions:
                        _stream_sessions[session_id]["match_result"] = event.data.get("full_result")

            elif event.event_type.value == "response":
                if session_id in _stream_sessions:
                    _stream_sessions[session_id]["narrative"] = event.data.get("narrative")

    except Exception as e:
        error_event = StreamEvent(
            event_type="error",
            data={"error": str(e)}
        )
        yield error_event.to_sse()


@router.post("/stream/match")
async def stream_match(req: StreamMatchRequest):
    """
    Stream archetype matching with real-time reasoning trace.

    Returns SSE stream with events:
    - thinking: Agent is processing
    - tool_call: Agent is calling a tool
    - tool_result: Tool returned a result
    - response: Final narrative response
    - complete: Stream finished
    - error: An error occurred
    """
    session_id = str(uuid.uuid4())

    # Initialize session
    _stream_sessions[session_id] = {
        "user_input": req.model_dump(),
        "messages": [],
        "match_result": None,
        "narrative": None,
    }

    user_input = {
        "height_cm": req.height_cm,
        "weight_kg": req.weight_kg,
        "arm_span_cm": req.arm_span_cm,
        "activity_preferences": req.activity_preferences,
    }

    if DEV_MODE:
        # Use mock streaming in dev mode
        events = _mock_stream_events(session_id, user_input)
    else:
        # Use real ADK agent
        events = run_agent_stream(session_id, user_input)

    return StreamingResponse(
        _stream_events(events, session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Session-ID": session_id,
        },
    )


@router.post("/stream/chat")
async def stream_chat(req: StreamChatRequest):
    """
    Stream chat follow-up with real-time reasoning trace.

    Continues an existing session with a new user message.
    """
    session = _stream_sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Add user message to history
    session["messages"].append({"role": "user", "content": req.message})

    user_input = session["user_input"]
    history = session["messages"]

    if DEV_MODE:
        events = _mock_chat_events(req.session_id, req.message, session)
    else:
        events = run_agent_stream(
            session_id=req.session_id,
            user_input=user_input,
            message=req.message,
            history=history,
        )

    return StreamingResponse(
        _stream_events(events, req.session_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/stream/session/{session_id}")
async def get_stream_session(session_id: str):
    """
    Retrieve session data after streaming completes.

    Returns the final match result and narrative for the Results page.
    """
    session = _stream_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    match_result = session.get("match_result", {})
    narrative = session.get("narrative", "")

    # Build response in the format expected by Results page
    primary = match_result.get("primary_archetype", {})

    return {
        "session_id": session_id,
        "primary_archetype": primary,
        "ranked_archetypes": match_result.get("ranked_archetypes", []),
        "sport_alignments": match_result.get("sport_alignments", {}),
        "user_metrics": match_result.get("user_metrics", {}),
        "centroid_positions": match_result.get("centroid_positions", {}),
        "narrative": narrative,
    }


# ══════════════════════════════════════════════════════════════════════════════
# DEV MODE MOCK STREAMING
# ══════════════════════════════════════════════════════════════════════════════

async def _mock_stream_events(
    session_id: str,
    user_input: dict,
) -> AsyncIterator[StreamEvent]:
    """Mock streaming events for dev mode testing."""
    import asyncio
    from app.services.adk_agent import EventType, StreamEvent
    from app.tools.match_archetype import match_archetype_tool, MatchArchetypeArgs
    from app.tools.classify_paralympic import classify_paralympic_tool, ClassifyParalympicArgs
    from app.tools.generate_followups import generate_followups_tool, GenerateFollowupsArgs

    # Thinking event
    yield StreamEvent(
        event_type=EventType.THINKING,
        data={"message": "Analyzing your profile against Team USA archetypes..."}
    )
    await asyncio.sleep(0.5)

    # Tool call: match_archetype
    yield StreamEvent(
        event_type=EventType.TOOL_CALL,
        data={
            "tool": "match_archetype",
            "args": {
                "height_cm": user_input["height_cm"],
                "weight_kg": user_input["weight_kg"],
            },
            "description": "Matching your build to Team USA archetypes",
        }
    )
    await asyncio.sleep(0.3)

    # Execute match
    match_args = MatchArchetypeArgs(
        height_cm=user_input["height_cm"],
        weight_kg=user_input["weight_kg"],
        arm_span_cm=user_input.get("arm_span_cm"),
        activity_preferences=user_input.get("activity_preferences"),
    )
    match_result = match_archetype_tool(match_args)

    archetype_name = match_result["primary_archetype"]["name"]
    confidence = match_result["primary_archetype"]["confidence"]

    yield StreamEvent(
        event_type=EventType.TOOL_RESULT,
        data={
            "tool": "match_archetype",
            "result_summary": f"Matched to {archetype_name} archetype ({confidence:.0%} confidence)",
            "full_result": match_result,
        }
    )
    await asyncio.sleep(0.4)

    # Tool call: classify_paralympic
    yield StreamEvent(
        event_type=EventType.THINKING,
        data={"message": "Analyzing Paralympic sport alignments..."}
    )
    await asyncio.sleep(0.3)

    yield StreamEvent(
        event_type=EventType.TOOL_CALL,
        data={
            "tool": "classify_paralympic",
            "args": {"archetype": archetype_name},
            "description": "Analyzing Paralympic classification depth",
        }
    )
    await asyncio.sleep(0.3)

    # Execute classify
    classify_args = ClassifyParalympicArgs(archetype=archetype_name)
    classify_result = classify_paralympic_tool(classify_args)

    yield StreamEvent(
        event_type=EventType.TOOL_RESULT,
        data={
            "tool": "classify_paralympic",
            "result_summary": f"Found {len(classify_result.get('archetype_sports', []))} Paralympic sports",
            "full_result": classify_result,
        }
    )
    await asyncio.sleep(0.3)

    # Tool call: generate_followups
    yield StreamEvent(
        event_type=EventType.TOOL_CALL,
        data={
            "tool": "generate_followups",
            "args": {
                "session_id": session_id,
                "archetype": archetype_name,
            },
            "description": "Generating personalized follow-up questions",
        }
    )
    await asyncio.sleep(0.2)

    followup_args = GenerateFollowupsArgs(
        session_id=session_id,
        archetype=archetype_name,
    )
    followup_result = generate_followups_tool(followup_args)

    yield StreamEvent(
        event_type=EventType.TOOL_RESULT,
        data={
            "tool": "generate_followups",
            "result_summary": f"Generated {len(followup_result.get('suggested_questions', []))} questions",
            "full_result": followup_result,
        }
    )
    await asyncio.sleep(0.3)

    # Final response
    primary = match_result["primary_archetype"]
    sports = match_result.get("sport_alignments", {})
    olympic_sports = sports.get("olympic_sports", [])
    paralympic_sports = sports.get("paralympic_sports", [])

    olympic_list = ", ".join([s["sport"] for s in olympic_sports[:2]]) if olympic_sports else "various Olympic events"
    paralympic_list = ", ".join([s["sport"] for s in paralympic_sports[:2]]) if paralympic_sports else "various Paralympic events"

    narrative = (
        f"Based on your height and weight, your build could align with the {archetype_name} archetype. "
        f"{primary.get('description', '')} "
        f"\n\n"
        f"This profile spans both Olympic events like {olympic_list} and Paralympic events like {paralympic_list}, "
        f"where similar frames have been represented across Team USA's 120-year history. "
        f"\n\n"
        f"{primary.get('historical_context', '')}"
    )

    yield StreamEvent(
        event_type=EventType.RESPONSE,
        data={"narrative": narrative}
    )

    yield StreamEvent(
        event_type=EventType.COMPLETE,
        data={"session_id": session_id}
    )


async def _mock_chat_events(
    session_id: str,
    message: str,
    session: dict,
) -> AsyncIterator[StreamEvent]:
    """Mock chat streaming events for dev mode."""
    import asyncio
    from app.services.adk_agent import EventType, StreamEvent

    match_result = session.get("match_result", {})
    archetype_name = match_result.get("primary_archetype", {}).get("name", "your matched")

    yield StreamEvent(
        event_type=EventType.THINKING,
        data={"message": f"Considering your question about {archetype_name}..."}
    )
    await asyncio.sleep(0.5)

    # Simple response for dev mode
    reply = (
        f"Great question! Based on your {archetype_name} archetype profile, "
        f"I can share that athletes with similar builds have historically competed "
        f"across a range of Team USA events. The patterns show interesting variations "
        f"across different eras of Olympic and Paralympic competition."
    )

    yield StreamEvent(
        event_type=EventType.RESPONSE,
        data={"narrative": reply}
    )

    yield StreamEvent(
        event_type=EventType.COMPLETE,
        data={"session_id": session_id}
    )
