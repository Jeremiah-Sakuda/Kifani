"""
FORGED — API Routers

- match: Archetype matching endpoint
- chat: Conversational follow-up endpoint
- stream: SSE streaming for real-time reasoning trace
"""

from app.routers import match, chat, stream

__all__ = ["match", "chat", "stream"]
