"""
FORGED — Photo Analysis Service

Uses Gemini Vision to estimate body proportions from full-body photos.
Returns extracted measurements with confidence scores.
"""

import os
import base64
from dataclasses import dataclass
from typing import Any

from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, Part, Image

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.0-flash"

# Extraction prompt for body proportion analysis
EXTRACTION_PROMPT = """Analyze this full-body photo and estimate the person's physical proportions.

IMPORTANT: You are estimating proportions for athletic archetype matching, not medical diagnosis.
Be conservative with estimates and indicate low confidence if the image quality or pose makes accurate estimation difficult.

Return a JSON object with:
{
  "success": true/false,
  "confidence": 0.0-1.0 (overall confidence in estimates),
  "estimates": {
    "height_range": {
      "low_cm": number,
      "high_cm": number,
      "best_estimate_cm": number,
      "confidence": 0.0-1.0
    },
    "weight_range": {
      "low_kg": number,
      "high_kg": number,
      "best_estimate_kg": number,
      "confidence": 0.0-1.0
    },
    "build_type": "lean" | "average" | "muscular" | "heavy",
    "proportions": {
      "arm_span_ratio": number (ratio to height, typically 0.95-1.05),
      "leg_to_torso_ratio": "short" | "average" | "long"
    }
  },
  "observations": [
    "string describing notable physical characteristics"
  ],
  "limitations": [
    "string describing why confidence might be lower"
  ]
}

If you cannot make reasonable estimates (e.g., not a full-body photo, obscured view, etc.),
return: {"success": false, "reason": "explanation"}

Only output valid JSON, no other text."""


@dataclass
class PhotoAnalysisResult:
    """Result from photo analysis."""
    success: bool
    confidence: float = 0.0
    height_cm: float | None = None
    weight_kg: float | None = None
    height_range: tuple[float, float] | None = None
    weight_range: tuple[float, float] | None = None
    build_type: str | None = None
    arm_span_ratio: float | None = None
    observations: list[str] | None = None
    limitations: list[str] | None = None
    error: str | None = None


def _get_model() -> GenerativeModel:
    """Initialize Gemini Vision model."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(MODEL_NAME)


async def analyze_photo(image_data: bytes, mime_type: str = "image/jpeg") -> PhotoAnalysisResult:
    """
    Analyze a full-body photo to estimate body proportions.

    Args:
        image_data: Raw image bytes
        mime_type: Image MIME type (image/jpeg, image/png, etc.)

    Returns:
        PhotoAnalysisResult with estimated measurements and confidence
    """
    try:
        model = _get_model()

        # Create image part from bytes
        image_part = Part.from_image(Image.from_bytes(image_data))

        # Generate analysis
        response = model.generate_content(
            [EXTRACTION_PROMPT, image_part],
            generation_config={
                "temperature": 0.1,  # Low temperature for consistent extraction
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

        if not data.get("success", False):
            return PhotoAnalysisResult(
                success=False,
                error=data.get("reason", "Could not analyze photo")
            )

        estimates = data.get("estimates", {})
        height_data = estimates.get("height_range", {})
        weight_data = estimates.get("weight_range", {})
        proportions = estimates.get("proportions", {})

        return PhotoAnalysisResult(
            success=True,
            confidence=data.get("confidence", 0.0),
            height_cm=height_data.get("best_estimate_cm"),
            weight_kg=weight_data.get("best_estimate_kg"),
            height_range=(
                height_data.get("low_cm", 0),
                height_data.get("high_cm", 0)
            ) if height_data else None,
            weight_range=(
                weight_data.get("low_kg", 0),
                weight_data.get("high_kg", 0)
            ) if weight_data else None,
            build_type=estimates.get("build_type"),
            arm_span_ratio=proportions.get("arm_span_ratio"),
            observations=data.get("observations", []),
            limitations=data.get("limitations", []),
        )

    except json.JSONDecodeError as e:
        return PhotoAnalysisResult(
            success=False,
            error=f"Failed to parse response: {str(e)}"
        )
    except Exception as e:
        return PhotoAnalysisResult(
            success=False,
            error=f"Analysis failed: {str(e)}"
        )


async def analyze_photo_base64(base64_data: str, mime_type: str = "image/jpeg") -> PhotoAnalysisResult:
    """
    Analyze a base64-encoded photo.

    Args:
        base64_data: Base64-encoded image (with or without data URL prefix)
        mime_type: Image MIME type

    Returns:
        PhotoAnalysisResult with estimated measurements
    """
    # Strip data URL prefix if present
    if "," in base64_data:
        header, base64_data = base64_data.split(",", 1)
        # Extract mime type from header if present
        if "image/" in header:
            mime_type = header.split(";")[0].split(":")[1]

    image_bytes = base64.b64decode(base64_data)
    return await analyze_photo(image_bytes, mime_type)


def result_to_dict(result: PhotoAnalysisResult) -> dict[str, Any]:
    """Convert PhotoAnalysisResult to API response dict."""
    if not result.success:
        return {
            "success": False,
            "error": result.error,
        }

    return {
        "success": True,
        "confidence": result.confidence,
        "estimates": {
            "height_cm": result.height_cm,
            "weight_kg": result.weight_kg,
            "height_range_cm": list(result.height_range) if result.height_range else None,
            "weight_range_kg": list(result.weight_range) if result.weight_range else None,
            "build_type": result.build_type,
            "arm_span_ratio": result.arm_span_ratio,
        },
        "observations": result.observations,
        "limitations": result.limitations,
        "requires_confirmation": result.confidence < 0.7,
    }
