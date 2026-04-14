"""
Firestore session persistence for conversational continuity.
"""

import os
from datetime import datetime, timezone

from google.cloud import firestore

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
COLLECTION = "sessions"


def _get_client() -> firestore.AsyncClient:
    return firestore.AsyncClient(project=PROJECT_ID)


async def save_session(session_id: str, user_input: dict, archetype_result: dict) -> None:
    """Create a new session document."""
    client = _get_client()
    doc_ref = client.collection(COLLECTION).document(session_id)
    await doc_ref.set({
        "user_input": user_input,
        "archetype_result": archetype_result,
        "messages": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })


async def get_session(session_id: str) -> dict | None:
    """Retrieve a session by ID."""
    client = _get_client()
    doc_ref = client.collection(COLLECTION).document(session_id)
    doc = await doc_ref.get()
    return doc.to_dict() if doc.exists else None


async def update_session_messages(session_id: str, user_message: str, assistant_reply: str) -> None:
    """Append a message exchange to the session."""
    client = _get_client()
    doc_ref = client.collection(COLLECTION).document(session_id)
    await doc_ref.update({
        "messages": firestore.ArrayUnion([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_reply},
        ]),
        "updated_at": datetime.now(timezone.utc),
    })
