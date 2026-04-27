"""
FORGED — Voice Analysis Service

Uses Gemini to extract biometric information from voice descriptions.
Transcribes audio and parses natural language measurements.
"""

import os
import base64
from dataclasses import dataclass
from typing import Any

from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.0-flash"

# Extraction prompt for voice-described measurements
EXTRACTION_PROMPT = """You are extracting physical measurements from a voice description.
The person is describing their height, weight, and physical characteristics for athletic archetype matching.

Listen to the audio and extract any mentioned physical traits.

Return a JSON object with:
{
  "success": true/false,
  "transcript": "the full transcription of what was said",
  "confidence": 0.0-1.0 (confidence in extracted values),
  "extracted": {
    "height": {
      "value_cm": number or null,
      "raw_text": "what they said about height",
      "confidence": 0.0-1.0
    },
    "weight": {
      "value_kg": number or null,
      "raw_text": "what they said about weight",
      "confidence": 0.0-1.0
    },
    "arm_span": {
      "value_cm": number or null,
      "raw_text": "what they said about arm span",
      "confidence": 0.0-1.0
    },
    "activity_preferences": ["list", "of", "mentioned", "activities"],
    "build_description": "any qualitative description of their build"
  },
  "missing_required": ["height" and/or "weight" if not mentioned],
  "clarification_needed": ["list of things that need clarification"]
}

Unit conversions:
- feet/inches to cm: (feet * 12 + inches) * 2.54
- pounds to kg: lbs * 0.453592

If the audio is unclear or doesn't contain physical descriptions:
{"success": false, "reason": "explanation", "transcript": "best effort transcription"}

Only output valid JSON, no other text."""


@dataclass
class VoiceAnalysisResult:
    """Result from voice analysis."""
    success: bool
    transcript: str | None = None
    confidence: float = 0.0
    height_cm: float | None = None
    weight_kg: float | None = None
    arm_span_cm: float | None = None
    activity_preferences: list[str] | None = None
    build_description: str | None = None
    missing_required: list[str] | None = None
    clarification_needed: list[str] | None = None
    error: str | None = None


def _get_model() -> GenerativeModel:
    """Initialize Gemini model with audio support."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(MODEL_NAME)


async def analyze_voice(audio_data: bytes, mime_type: str = "audio/webm") -> VoiceAnalysisResult:
    """
    Analyze voice recording to extract biometric information.

    Args:
        audio_data: Raw audio bytes
        mime_type: Audio MIME type (audio/webm, audio/wav, etc.)

    Returns:
        VoiceAnalysisResult with extracted measurements
    """
    try:
        model = _get_model()

        # Create audio part
        audio_part = Part.from_data(audio_data, mime_type=mime_type)

        # Generate analysis
        response = model.generate_content(
            [EXTRACTION_PROMPT, audio_part],
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 1024,
            }
        )

        # Parse JSON response
        import json
        text = response.text.strip()

        # Handle markdown code blocks
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        data = json.loads(text)

        transcript = data.get("transcript", "")

        if not data.get("success", False):
            return VoiceAnalysisResult(
                success=False,
                transcript=transcript,
                error=data.get("reason", "Could not extract measurements")
            )

        extracted = data.get("extracted", {})
        height_data = extracted.get("height", {})
        weight_data = extracted.get("weight", {})
        arm_span_data = extracted.get("arm_span", {})

        return VoiceAnalysisResult(
            success=True,
            transcript=transcript,
            confidence=data.get("confidence", 0.0),
            height_cm=height_data.get("value_cm"),
            weight_kg=weight_data.get("value_kg"),
            arm_span_cm=arm_span_data.get("value_cm"),
            activity_preferences=extracted.get("activity_preferences", []),
            build_description=extracted.get("build_description"),
            missing_required=data.get("missing_required", []),
            clarification_needed=data.get("clarification_needed", []),
        )

    except json.JSONDecodeError as e:
        return VoiceAnalysisResult(
            success=False,
            error=f"Failed to parse response: {str(e)}"
        )
    except Exception as e:
        return VoiceAnalysisResult(
            success=False,
            error=f"Analysis failed: {str(e)}"
        )


async def analyze_voice_base64(base64_data: str, mime_type: str = "audio/webm") -> VoiceAnalysisResult:
    """
    Analyze base64-encoded audio.

    Args:
        base64_data: Base64-encoded audio (with or without data URL prefix)
        mime_type: Audio MIME type

    Returns:
        VoiceAnalysisResult with extracted measurements
    """
    # Strip data URL prefix if present
    if "," in base64_data:
        header, base64_data = base64_data.split(",", 1)
        if "audio/" in header:
            mime_type = header.split(";")[0].split(":")[1]

    audio_bytes = base64.b64decode(base64_data)
    return await analyze_voice(audio_bytes, mime_type)


def result_to_dict(result: VoiceAnalysisResult) -> dict[str, Any]:
    """Convert VoiceAnalysisResult to API response dict."""
    response = {
        "success": result.success,
        "transcript": result.transcript,
    }

    if not result.success:
        response["error"] = result.error
        return response

    response.update({
        "confidence": result.confidence,
        "extracted": {
            "height_cm": result.height_cm,
            "weight_kg": result.weight_kg,
            "arm_span_cm": result.arm_span_cm,
            "activity_preferences": result.activity_preferences,
            "build_description": result.build_description,
        },
        "missing_required": result.missing_required,
        "clarification_needed": result.clarification_needed,
        "requires_confirmation": (
            result.confidence < 0.7 or
            bool(result.missing_required) or
            bool(result.clarification_needed)
        ),
    })

    return response
