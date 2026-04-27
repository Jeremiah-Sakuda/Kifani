"""
FORGED — Imagen Portrait Generation Service

Uses Imagen 4 to generate stylized archetype portraits.
Non-photorealistic, artistic representations of athletic archetypes.
"""

import os
import base64
from dataclasses import dataclass
from typing import Any

from google.cloud import aiplatform
from vertexai.preview.vision_models import ImageGenerationModel

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "imagen-3.0-generate-002"  # Imagen 3 (latest available)

# Archetype-specific prompt elements
ARCHETYPE_STYLES: dict[str, dict[str, str]] = {
    "Powerhouse": {
        "body_type": "powerful, muscular athletic build",
        "energy": "raw strength and explosive power",
        "colors": "deep crimson and bronze",
        "sport_elements": "weightlifting, wrestling, throwing events",
    },
    "Aerobic Engine": {
        "body_type": "lean, efficient endurance physique",
        "energy": "flowing movement and sustained power",
        "colors": "forest green and silver",
        "sport_elements": "marathon, cycling, cross-country skiing",
    },
    "Precision Athlete": {
        "body_type": "balanced, controlled athletic form",
        "energy": "focused concentration and steady hands",
        "colors": "deep blue and white",
        "sport_elements": "archery, shooting, fencing",
    },
    "Explosive Mover": {
        "body_type": "dynamic, spring-loaded athletic build",
        "energy": "explosive speed and quick reactions",
        "colors": "bright orange and gold",
        "sport_elements": "sprinting, jumping, gymnastics",
    },
    "Coordinated Specialist": {
        "body_type": "agile, flexible athletic form",
        "energy": "grace and precise coordination",
        "colors": "royal purple and silver",
        "sport_elements": "gymnastics, diving, figure skating",
    },
    "Tactical Endurance": {
        "body_type": "versatile, balanced athletic build",
        "energy": "strategic patience and sustained effort",
        "colors": "steel gray and deep blue",
        "sport_elements": "rowing, swimming, triathlon",
    },
    "Adaptive Power": {
        "body_type": "powerful adaptive athletic build",
        "energy": "determined strength and resilience",
        "colors": "bronze and deep amber",
        "sport_elements": "Paralympic powerlifting, wheelchair rugby, shot put",
    },
    "Adaptive Endurance": {
        "body_type": "efficient adaptive athletic form",
        "energy": "persistent flow and determination",
        "colors": "teal and aquamarine",
        "sport_elements": "Paralympic cycling, wheelchair racing, para-swimming",
    },
}

# Base prompt template
BASE_PROMPT = """Create a stylized, artistic portrait representing the {archetype} athletic archetype.

Style: Non-photorealistic digital art, inspired by Olympic poster art and athletic iconography.
NOT a photograph of a real person. Abstract and symbolic representation.

The figure should embody:
- Body type: {body_type}
- Energy/movement: {energy}
- Color palette: {colors}, with golden accents (Olympic gold)
- Sport imagery: subtle hints of {sport_elements}

Composition:
- Single heroic figure in dynamic pose
- Abstract geometric background suggesting motion
- Olympic rings or torch motif subtly integrated
- Dramatic lighting with {colors} tones
- Art deco or modern Olympic poster aesthetic

Important:
- Must be clearly artistic/stylized, NOT photorealistic
- No specific face features - abstract or silhouette
- Emphasize athletic movement and form
- Professional, inspiring, suitable for all audiences
"""


@dataclass
class ImagenResult:
    """Result from Imagen generation."""
    success: bool
    image_base64: str | None = None
    mime_type: str = "image/png"
    prompt_used: str | None = None
    error: str | None = None


def _get_model() -> ImageGenerationModel:
    """Initialize Imagen model."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return ImageGenerationModel.from_pretrained(MODEL_NAME)


def _build_prompt(archetype: str) -> str:
    """Build the generation prompt for an archetype."""
    style = ARCHETYPE_STYLES.get(archetype, ARCHETYPE_STYLES["Powerhouse"])

    return BASE_PROMPT.format(
        archetype=archetype,
        body_type=style["body_type"],
        energy=style["energy"],
        colors=style["colors"],
        sport_elements=style["sport_elements"],
    )


async def generate_portrait(
    archetype: str,
    session_id: str | None = None,
) -> ImagenResult:
    """
    Generate a stylized archetype portrait using Imagen.

    Args:
        archetype: Name of the archetype
        session_id: Optional session ID for caching

    Returns:
        ImagenResult with base64-encoded image
    """
    try:
        model = _get_model()
        prompt = _build_prompt(archetype)

        # Generate image
        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="3:4",  # Portrait orientation
            safety_filter_level="block_some",
            person_generation="dont_allow",  # No photorealistic people
        )

        if not response.images:
            return ImagenResult(
                success=False,
                error="No images generated",
                prompt_used=prompt,
            )

        # Get the first image
        image = response.images[0]

        # Convert to base64
        image_bytes = image._image_bytes
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        return ImagenResult(
            success=True,
            image_base64=image_base64,
            mime_type="image/png",
            prompt_used=prompt,
        )

    except Exception as e:
        return ImagenResult(
            success=False,
            error=str(e),
        )


def result_to_dict(result: ImagenResult) -> dict[str, Any]:
    """Convert ImagenResult to API response dict."""
    if not result.success:
        return {
            "success": False,
            "error": result.error,
        }

    return {
        "success": True,
        "image_data": f"data:{result.mime_type};base64,{result.image_base64}",
        "mime_type": result.mime_type,
    }


# ══════════════════════════════════════════════════════════════════════════════
# PLACEHOLDER GENERATION (for dev mode)
# ══════════════════════════════════════════════════════════════════════════════

def generate_placeholder_svg(archetype: str) -> str:
    """
    Generate an SVG placeholder for dev mode.
    Returns a data URL with an archetype-themed abstract design.
    """
    colors = {
        "Powerhouse": ("#8b0000", "#dc143c", "#ff6347"),
        "Aerobic Engine": ("#006400", "#228b22", "#90ee90"),
        "Precision Athlete": ("#191970", "#4169e1", "#87ceeb"),
        "Explosive Mover": ("#ff8c00", "#ffa500", "#ffd700"),
        "Coordinated Specialist": ("#8b008b", "#da70d6", "#dda0dd"),
        "Tactical Endurance": ("#2f4f4f", "#708090", "#c0c0c0"),
        "Adaptive Power": ("#8b4513", "#cd853f", "#deb887"),
        "Adaptive Endurance": ("#008080", "#20b2aa", "#40e0d0"),
    }

    c1, c2, c3 = colors.get(archetype, colors["Powerhouse"])

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{c1}"/>
      <stop offset="50%" style="stop-color:{c2}"/>
      <stop offset="100%" style="stop-color:{c3}"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d4a012"/>
      <stop offset="100%" style="stop-color:#ffd700"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>

  <!-- Abstract athletic figure silhouette -->
  <ellipse cx="150" cy="100" rx="35" ry="40" fill="url(#gold)" opacity="0.9"/>
  <path d="M150,140 L150,250 M120,180 L180,180 M150,250 L120,350 M150,250 L180,350"
        stroke="url(#gold)" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.9"/>

  <!-- Dynamic motion lines -->
  <path d="M50,200 Q150,150 250,200" stroke="{c3}" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M50,220 Q150,170 250,220" stroke="{c3}" stroke-width="2" fill="none" opacity="0.4"/>
  <path d="M50,240 Q150,190 250,240" stroke="{c3}" stroke-width="2" fill="none" opacity="0.3"/>

  <!-- Olympic rings hint -->
  <circle cx="130" cy="370" r="12" stroke="#d4a012" stroke-width="2" fill="none" opacity="0.6"/>
  <circle cx="150" cy="370" r="12" stroke="#d4a012" stroke-width="2" fill="none" opacity="0.6"/>
  <circle cx="170" cy="370" r="12" stroke="#d4a012" stroke-width="2" fill="none" opacity="0.6"/>

  <!-- Archetype text -->
  <text x="150" y="30" text-anchor="middle" fill="white" font-family="serif" font-size="14" opacity="0.8">
    {archetype}
  </text>
</svg>'''

    # Encode as data URL
    encoded = base64.b64encode(svg.encode()).decode()
    return f"data:image/svg+xml;base64,{encoded}"
