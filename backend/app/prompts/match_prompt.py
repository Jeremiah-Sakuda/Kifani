"""
Prompt template for Match Mode — generating archetype narratives.
"""

from app.models.schemas import MatchRequest


def build_match_prompt(req: MatchRequest, match_result: dict) -> str:
    archetype = match_result["archetype"]
    confidence = match_result["confidence"]
    all_distances = match_result["all_distances"]

    user_info = f"""
User Physical Profile:
- Height: {req.height_cm} cm
- Weight: {req.weight_kg} kg
- BMI: {match_result['user_bmi']}"""

    if req.arm_span_cm:
        user_info += f"\n- Arm Span: {req.arm_span_cm} cm"
    if req.age_range:
        user_info += f"\n- Age Range: {req.age_range}"
    if req.activity_preference:
        user_info += f"\n- Activity Preferences: {', '.join(req.activity_preference)}"

    distance_summary = "\n".join(
        f"  - {name}: distance {dist}" for name, dist in all_distances
    )

    return f"""Analyze this user's physical profile and generate a personalized archetype result.

{user_info}

Closest Archetype Match: {archetype.name} (confidence: {confidence})
Archetype Description: {archetype.description}

All Archetype Distances (lower = closer match):
{distance_summary}

Generate a JSON response with this exact structure:
```json
{{
  "primary_archetype": {{
    "name": "{archetype.name}",
    "description": "A personalized 2-3 sentence description of why this user's build aligns with this archetype. Use conditional phrasing.",
    "historical_context": "1-2 sentences about this archetype's role in Team USA history, spanning both Olympic and Paralympic athletes.",
    "confidence": {confidence}
  }},
  "olympic_sports": [
    {{
      "sport": "Sport Name",
      "event": "Specific Event",
      "why": "One sentence explaining the biometric alignment. Use conditional phrasing."
    }}
  ],
  "paralympic_sports": [
    {{
      "sport": "Para Sport Name",
      "event": "Classification + Event",
      "classification": "e.g. T44",
      "classification_explainer": "Clear explanation of what this classification means and who competes in it.",
      "why": "One sentence explaining the biometric alignment. Use conditional phrasing."
    }}
  ],
  "narrative": "A 2-3 sentence personalized narrative tying everything together. Warm, analytical, uses conditional phrasing. Mentions both Olympic and Paralympic connections."
}}
```

Include 2-3 Olympic sports and 1-2 Paralympic sports. Ensure Paralympic classifications are explained with the same depth as Olympic event distinctions."""
