"""
FORGED — Multimodal Input Endpoints

Handles photo and voice input processing with Gemini Vision and Audio APIs.
Returns extracted biometric estimates for archetype matching.
"""

import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from app.services.photo_analysis import (
    analyze_photo,
    analyze_photo_base64,
    result_to_dict as photo_result_to_dict,
)
from app.services.voice_analysis import (
    analyze_voice,
    analyze_voice_base64,
    result_to_dict as voice_result_to_dict,
)
from app.services.imagen_service import (
    generate_portrait,
    generate_placeholder_svg,
    result_to_dict as imagen_result_to_dict,
)

router = APIRouter()

DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"


class PhotoBase64Request(BaseModel):
    """Request with base64-encoded photo."""
    image_data: str  # Base64-encoded image (with or without data URL prefix)
    mime_type: str = "image/jpeg"


class VoiceBase64Request(BaseModel):
    """Request with base64-encoded audio."""
    audio_data: str  # Base64-encoded audio (with or without data URL prefix)
    mime_type: str = "audio/webm"


# ══════════════════════════════════════════════════════════════════════════════
# PHOTO ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════


@router.post("/analyze/photo")
async def analyze_photo_upload(
    file: UploadFile = File(...),
):
    """
    Analyze an uploaded photo for body proportion estimation.

    Accepts multipart/form-data with an image file.
    Returns estimated height, weight, and build characteristics.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    if DEV_MODE:
        # Return mock data in dev mode
        return _mock_photo_response()

    try:
        contents = await file.read()
        result = await analyze_photo(contents, file.content_type)
        return photo_result_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/photo/base64")
async def analyze_photo_base64_endpoint(req: PhotoBase64Request):
    """
    Analyze a base64-encoded photo for body proportion estimation.

    Accepts JSON with base64-encoded image data.
    """
    if DEV_MODE:
        return _mock_photo_response()

    try:
        result = await analyze_photo_base64(req.image_data, req.mime_type)
        return photo_result_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# VOICE ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════


@router.post("/analyze/voice")
async def analyze_voice_upload(
    file: UploadFile = File(...),
):
    """
    Analyze an uploaded voice recording for biometric extraction.

    Accepts multipart/form-data with an audio file.
    Returns transcript and extracted measurements.
    """
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be audio")

    if DEV_MODE:
        return _mock_voice_response()

    try:
        contents = await file.read()
        result = await analyze_voice(contents, file.content_type)
        return voice_result_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze/voice/base64")
async def analyze_voice_base64_endpoint(req: VoiceBase64Request):
    """
    Analyze base64-encoded audio for biometric extraction.

    Accepts JSON with base64-encoded audio data.
    """
    if DEV_MODE:
        return _mock_voice_response()

    try:
        result = await analyze_voice_base64(req.audio_data, req.mime_type)
        return voice_result_to_dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# DEV MODE MOCK RESPONSES
# ══════════════════════════════════════════════════════════════════════════════


def _mock_photo_response() -> dict:
    """Mock photo analysis response for dev mode."""
    return {
        "success": True,
        "confidence": 0.75,
        "estimates": {
            "height_cm": 178.0,
            "weight_kg": 75.0,
            "height_range_cm": [175.0, 182.0],
            "weight_range_kg": [72.0, 80.0],
            "build_type": "average",
            "arm_span_ratio": 1.01,
        },
        "observations": [
            "Athletic build with balanced proportions",
            "Upper body appears well-developed",
            "Limb proportions suggest good reach-to-height ratio",
        ],
        "limitations": [
            "Estimate based on apparent clothing fit",
            "Pose angle may affect height estimate",
        ],
        "requires_confirmation": True,
    }


def _mock_voice_response() -> dict:
    """Mock voice analysis response for dev mode."""
    return {
        "success": True,
        "transcript": "I'm about 5 foot 10, around 175 pounds. I played basketball in college and still do a lot of running now. My arm span is a bit longer than my height, maybe 6 feet.",
        "confidence": 0.85,
        "extracted": {
            "height_cm": 177.8,  # 5'10" in cm
            "weight_kg": 79.4,  # 175 lbs in kg
            "arm_span_cm": 182.9,  # 6 feet in cm
            "activity_preferences": ["basketball", "running"],
            "build_description": "Athletic, played basketball, longer arm span",
        },
        "missing_required": [],
        "clarification_needed": [],
        "requires_confirmation": False,
    }


# ══════════════════════════════════════════════════════════════════════════════
# IMAGEN PORTRAIT ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════


class ImagenRequest(BaseModel):
    """Request for Imagen portrait generation."""
    archetype: str
    session_id: str | None = None


@router.post("/imagen/portrait")
async def generate_archetype_portrait(req: ImagenRequest):
    """
    Generate a stylized archetype portrait using Imagen.

    Returns a non-photorealistic artistic representation of the archetype.
    The image is an abstract, Olympic-poster-style visualization.
    """
    if DEV_MODE:
        # Return SVG placeholder in dev mode
        return {
            "success": True,
            "image_data": generate_placeholder_svg(req.archetype),
            "mime_type": "image/svg+xml",
            "is_placeholder": True,
        }

    try:
        result = await generate_portrait(req.archetype, req.session_id)
        response = imagen_result_to_dict(result)
        response["is_placeholder"] = False
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/imagen/portrait/{archetype}")
async def get_archetype_portrait(archetype: str, session_id: str | None = None):
    """
    Get or generate an archetype portrait.

    GET version for easy embedding and caching.
    """
    if DEV_MODE:
        return {
            "success": True,
            "image_data": generate_placeholder_svg(archetype),
            "mime_type": "image/svg+xml",
            "is_placeholder": True,
        }

    try:
        result = await generate_portrait(archetype, session_id)
        response = imagen_result_to_dict(result)
        response["is_placeholder"] = False
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
