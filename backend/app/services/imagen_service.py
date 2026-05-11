"""
FORGED — Portrait Generation Service

Uses Gemini 2.5 Flash Image to generate stylized archetype portraits.
Non-photorealistic, artistic representations of athletic archetypes.
"""

import os
import base64
from dataclasses import dataclass
from typing import Any

from google import genai
from google.genai import types

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.5-flash"

# Archetype-specific prompt elements - fully abstract, no human figures
ARCHETYPE_STYLES: dict[str, dict[str, str]] = {
    "Powerhouse": {
        "energy": "explosive force radiating outward, heavy and grounded",
        "colors": "deep crimson, bronze, and molten gold",
        "shapes": "bold angular blocks, sharp triangles, dense geometric clusters",
        "motion": "outward explosion, expanding force, seismic waves",
    },
    "Aerobic Engine": {
        "energy": "continuous flowing rhythm, perpetual motion",
        "colors": "forest green, silver, and cool blue",
        "shapes": "long flowing curves, continuous ribbons, spiral patterns",
        "motion": "endless forward flow, rhythmic waves, sustained momentum",
    },
    "Precision Athlete": {
        "energy": "focused stillness, pinpoint concentration",
        "colors": "deep navy blue, white, and steel gray",
        "shapes": "precise circles, perfect lines, crosshair patterns, targets",
        "motion": "converging lines to a single point, crystalline structure",
    },
    "Explosive Mover": {
        "energy": "lightning-fast bursts, spring-loaded tension release",
        "colors": "bright orange, electric gold, and hot yellow",
        "shapes": "sharp zigzags, starburst patterns, angular fragments",
        "motion": "sudden acceleration, spark explosions, rapid trajectories",
    },
    "Coordinated Specialist": {
        "energy": "graceful balance, harmonious flow",
        "colors": "royal purple, silver, and soft violet",
        "shapes": "elegant spirals, interlocking curves, balanced symmetry",
        "motion": "fluid rotations, graceful arcs, pendulum swings",
    },
    "Tactical Endurance": {
        "energy": "strategic patience, sustained intensity",
        "colors": "steel gray, deep blue, and titanium",
        "shapes": "layered waves, strategic grid patterns, interconnected nodes",
        "motion": "steady progression, building momentum, wave after wave",
    },
    "Adaptive Power": {
        "energy": "resilient strength, transformative force",
        "colors": "bronze, deep amber, and burnished copper",
        "shapes": "interlocking geometric forms, adaptive tessellations",
        "motion": "transformation, shape-shifting energy, breakthrough moments",
    },
    "Adaptive Endurance": {
        "energy": "persistent flow, unstoppable determination",
        "colors": "teal, aquamarine, and ocean blue",
        "shapes": "flowing water patterns, adaptive curves, morphing streams",
        "motion": "continuous adaptation, flowing around obstacles, relentless forward motion",
    },
}

# Base prompt template - purely abstract, no human figures
BASE_PROMPT = """Create an abstract geometric artwork representing the essence of "{archetype}" energy.

Style: Modern abstract digital art. Bold geometric shapes and dynamic patterns.
NO human figures, faces, bodies, or silhouettes. Purely abstract shapes and energy.

Visual elements:
- Energy feeling: {energy}
- Color palette: {colors}
- Shape language: {shapes}
- Motion/flow: {motion}

Composition:
- Dynamic abstract composition with depth and movement
- Dramatic lighting and color gradients
- Modern poster aesthetic with bold geometry
- Sense of power and athleticism through abstract forms only

Critical requirements:
- ABSOLUTELY NO human figures, bodies, faces, or silhouettes
- ONLY geometric shapes, patterns, lines, and abstract forms
- Think: abstract expressionism meets sports energy
- Professional, inspiring, suitable for all audiences
"""


@dataclass
class ImagenResult:
    """Result from image generation."""
    success: bool
    image_base64: str | None = None
    mime_type: str = "image/png"
    prompt_used: str | None = None
    error: str | None = None


def _get_client() -> genai.Client:
    """Initialize Gemini client for Vertex AI."""
    return genai.Client(
        vertexai=True,
        project=PROJECT_ID,
        location=LOCATION,
    )


def _build_prompt(archetype: str) -> str:
    """Build the generation prompt for an archetype."""
    style = ARCHETYPE_STYLES.get(archetype, ARCHETYPE_STYLES["Powerhouse"])

    return BASE_PROMPT.format(
        archetype=archetype,
        energy=style["energy"],
        colors=style["colors"],
        shapes=style["shapes"],
        motion=style["motion"],
    )


async def generate_portrait(
    archetype: str,
    session_id: str | None = None,
) -> ImagenResult:
    """
    Generate a stylized archetype portrait using Gemini.

    Args:
        archetype: Name of the archetype
        session_id: Optional session ID for caching

    Returns:
        ImagenResult with base64-encoded image
    """
    try:
        client = _get_client()
        prompt = _build_prompt(archetype)

        # Generate image using Imagen - pure abstract art, no human figures in prompt
        response = client.models.generate_images(
            model="imagen-3.0-fast-generate-001",
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/jpeg",
            ),
        )

        # Extract image from response
        if not response.generated_images:
            return ImagenResult(
                success=False,
                error="No images generated",
                prompt_used=prompt,
            )

        # Base64 encode the returned image bytes
        image_bytes = response.generated_images[0].image.image_bytes
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        
        return ImagenResult(
            success=True,
            image_base64=image_base64,
            mime_type="image/jpeg",
            prompt_used=prompt,
        )

    except Exception as e:
        import traceback
        error_str = str(e)
        
        # Fallback to SVG placeholder if quota is exhausted
        if "429" in error_str or "Quota" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            print(f"[IMAGEN QUOTA EXCEEDED] Falling back to SVG placeholder. Error: {error_str}")
            placeholder_data_url = generate_placeholder_svg(archetype)
            encoded = placeholder_data_url.split("base64,")[1]
            return ImagenResult(
                success=True,
                image_base64=encoded,
                mime_type="image/svg+xml",
                prompt_used=prompt if 'prompt' in locals() else None,
            )

        error_details = f"{type(e).__name__}: {error_str}"
        print(f"[GEMINI IMAGE ERROR] {error_details}")
        print(f"[GEMINI IMAGE TRACEBACK] {traceback.format_exc()}")
        return ImagenResult(
            success=False,
            error=error_details,
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

  <!-- Stylized stars (Team USA) -->
  <polygon points="130,370 132,376 138,376 133,380 135,386 130,382 125,386 127,380 122,376 128,376" fill="#d4a012" opacity="0.6"/>
  <polygon points="150,365 152,371 158,371 153,375 155,381 150,377 145,381 147,375 142,371 148,371" fill="#d4a012" opacity="0.7"/>
  <polygon points="170,370 172,376 178,376 173,380 175,386 170,382 165,386 167,380 162,376 168,376" fill="#d4a012" opacity="0.6"/>

  <!-- Archetype text -->
  <text x="150" y="30" text-anchor="middle" fill="white" font-family="serif" font-size="14" opacity="0.8">
    {archetype}
  </text>
</svg>'''

    # Encode as data URL
    encoded = base64.b64encode(svg.encode()).decode()
    return f"data:image/svg+xml;base64,{encoded}"
