"""
FORGED — API Routers

- match: Archetype matching endpoint
- chat: Conversational follow-up endpoint
- stream: SSE streaming for real-time reasoning trace
- multimodal: Photo and voice analysis endpoints
"""

from app.routers import match, chat, stream, multimodal

__all__ = ["match", "chat", "stream", "multimodal"]
