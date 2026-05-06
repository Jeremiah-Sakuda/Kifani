"""
FORGED — Conditional Language Validator

Uses Gemini 2.0 Flash to validate and rewrite narratives ensuring
compliant conditional language. All claims must use hedged phrasing
("could align with", "suggests", "may") rather than definitive claims
("you would be good at", "you are").

This is a real validation pass, not static phrase substitution.
"""

import logging
import os
from dataclasses import dataclass
from typing import Optional

from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel, GenerationConfig

logger = logging.getLogger(__name__)

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
MODEL_NAME = "gemini-2.0-flash-001"

VALIDATION_PROMPT = """You are a compliance validator for a sports fan engagement application.

Your task is to review narrative text and ensure ALL claims use conditional, hedged language.

RULES:
1. Replace definitive claims with conditional phrasing:
   - "you would be good at" → "could align with"
   - "you are a" → "your profile suggests"
   - "you should try" → "you might consider exploring"
   - "your body is built for" → "your build shares characteristics with athletes in"
   - "you will succeed" → "patterns suggest potential alignment"

2. Ensure all recommendations use "could", "may", "might", "suggests", "aligns with"

3. Never use:
   - "you would be"
   - "you are destined"
   - "you should"
   - "you will"
   - "perfect for"
   - "ideal for"

4. Preserve the meaning and enthusiasm while hedging the certainty

5. Keep the same length and structure — only adjust phrasing

INPUT TEXT:
{text}

OUTPUT: Return ONLY the revised text with compliant conditional language. Do not include any explanation or metadata."""


@dataclass
class ValidationResult:
    """Result of conditional language validation."""
    original_text: str
    validated_text: str
    was_modified: bool
    validation_trace: str


def _get_flash_model() -> GenerativeModel:
    """Initialize Gemini 2.0 Flash for validation."""
    aiplatform.init(project=PROJECT_ID, location=LOCATION)
    return GenerativeModel(MODEL_NAME)


async def validate_conditional_language(
    text: str,
    skip_if_compliant: bool = True,
) -> ValidationResult:
    """
    Validate and rewrite text to ensure conditional language compliance.

    Args:
        text: The narrative text to validate
        skip_if_compliant: If True, skip validation for already-compliant text

    Returns:
        ValidationResult with original, validated text, and trace
    """
    if not text or not text.strip():
        return ValidationResult(
            original_text=text,
            validated_text=text,
            was_modified=False,
            validation_trace="Empty input — no validation needed",
        )

    # Quick check for obvious compliance issues
    definitive_markers = [
        "you would be good at",
        "you are a ",
        "you should try",
        "your body is built for",
        "you will succeed",
        "perfect for you",
        "ideal for you",
        "you are destined",
    ]

    text_lower = text.lower()
    has_issues = any(marker in text_lower for marker in definitive_markers)

    if skip_if_compliant and not has_issues:
        logger.info("Text appears compliant — skipping Flash validation")
        return ValidationResult(
            original_text=text,
            validated_text=text,
            was_modified=False,
            validation_trace="Quick scan: no definitive markers found — text appears compliant",
        )

    try:
        model = _get_flash_model()

        prompt = VALIDATION_PROMPT.format(text=text)

        generation_config = GenerationConfig(
            temperature=0.1,  # Low temperature for consistent rewrites
            max_output_tokens=2048,
        )

        response = model.generate_content(
            prompt,
            generation_config=generation_config,
        )

        validated_text = response.text.strip() if response.text else text

        was_modified = validated_text != text

        trace_parts = [
            f"Gemini Flash validation completed",
            f"Model: {MODEL_NAME}",
            f"Input length: {len(text)} chars",
            f"Output length: {len(validated_text)} chars",
            f"Modified: {was_modified}",
        ]

        if was_modified:
            # Log what changed for transparency
            trace_parts.append("Changes applied to ensure conditional language compliance")

        logger.info(f"Conditional language validation: modified={was_modified}")

        return ValidationResult(
            original_text=text,
            validated_text=validated_text,
            was_modified=was_modified,
            validation_trace=" | ".join(trace_parts),
        )

    except Exception as e:
        logger.error(f"Flash validation failed: {e}")
        # On error, return original text with error trace
        return ValidationResult(
            original_text=text,
            validated_text=text,
            was_modified=False,
            validation_trace=f"Validation error: {str(e)} — returning original text",
        )


def validate_conditional_language_sync(text: str) -> ValidationResult:
    """
    Synchronous wrapper for conditional language validation.

    For use in non-async contexts.
    """
    import asyncio

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(validate_conditional_language(text))
