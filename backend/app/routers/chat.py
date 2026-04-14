from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.gemini_agent import handle_chat_message
from app.services.firestore_service import get_session, update_session_messages

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Handle conversational follow-up questions."""
    session = await get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        reply = await handle_chat_message(
            session_id=req.session_id,
            message=req.message,
            session_context=session,
        )

        await update_session_messages(req.session_id, req.message, reply)

        return ChatResponse(reply=reply)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
