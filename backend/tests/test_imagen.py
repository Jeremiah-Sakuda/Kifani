"""
Tests for Imagen portrait generation service.

Tests focus on prompt building, archetype styles, and result handling,
as actual Imagen calls require GCP credentials.
"""

import pytest
from app.services.imagen_service import (
    ARCHETYPE_STYLES,
    BASE_PROMPT,
    ImagenResult,
    result_to_dict,
    _build_prompt,
    generate_placeholder_svg,
)


class TestArchetypeStyles:
    """Test archetype style definitions."""

    def test_all_archetypes_have_styles(self):
        """Verify all 8 archetypes have defined styles."""
        expected_archetypes = [
            "Powerhouse",
            "Aerobic Engine",
            "Precision Athlete",
            "Explosive Mover",
            "Coordinated Specialist",
            "Tactical Endurance",
            "Adaptive Power",
            "Adaptive Endurance",
        ]

        for archetype in expected_archetypes:
            assert archetype in ARCHETYPE_STYLES, f"Missing style for {archetype}"

    def test_style_has_required_fields(self):
        """Test that each style has all required fields."""
        required_fields = ["body_type", "energy", "colors", "sport_elements"]

        for archetype, style in ARCHETYPE_STYLES.items():
            for field in required_fields:
                assert field in style, f"{archetype} missing {field}"
                assert len(style[field]) > 0, f"{archetype} has empty {field}"

    def test_adaptive_styles_reference_adaptive_sports(self):
        """Test that Adaptive archetypes reference Paralympic sports."""
        adaptive_power = ARCHETYPE_STYLES["Adaptive Power"]
        adaptive_endurance = ARCHETYPE_STYLES["Adaptive Endurance"]

        # Should mention adaptive/Paralympic sports
        assert "wheelchair" in adaptive_power["sport_elements"].lower() or \
               "para" in adaptive_power["sport_elements"].lower()
        assert "wheelchair" in adaptive_endurance["sport_elements"].lower() or \
               "para" in adaptive_endurance["sport_elements"].lower()

    def test_colors_are_distinct(self):
        """Test that each archetype has a distinct color palette."""
        color_sets = set()
        for archetype, style in ARCHETYPE_STYLES.items():
            color_sets.add(style["colors"])

        # All 8 archetypes should have unique color descriptions
        assert len(color_sets) == 8


class TestPromptBuilding:
    """Test prompt construction for Imagen."""

    def test_base_prompt_contains_key_instructions(self):
        """Test that base prompt has essential instructions."""
        assert "non-photorealistic" in BASE_PROMPT.lower()
        assert "not a photograph" in BASE_PROMPT.lower()
        assert "stylized" in BASE_PROMPT.lower()
        assert "artistic" in BASE_PROMPT.lower()

    def test_base_prompt_avoids_real_people(self):
        """Test that base prompt instructs to avoid real people."""
        assert "real person" in BASE_PROMPT.lower() or \
               "not photorealistic" in BASE_PROMPT.lower()

    def test_build_prompt_includes_archetype_name(self):
        """Test that built prompt includes archetype name."""
        prompt = _build_prompt("Powerhouse")
        assert "Powerhouse" in prompt

    def test_build_prompt_includes_style_elements(self):
        """Test that built prompt includes style elements."""
        prompt = _build_prompt("Aerobic Engine")

        style = ARCHETYPE_STYLES["Aerobic Engine"]
        assert style["body_type"] in prompt
        assert style["colors"] in prompt

    def test_build_prompt_fallback_for_unknown_archetype(self):
        """Test that unknown archetype falls back to Powerhouse style."""
        prompt = _build_prompt("NonexistentArchetype")

        # Should use Powerhouse as fallback
        powerhouse_style = ARCHETYPE_STYLES["Powerhouse"]
        assert powerhouse_style["body_type"] in prompt


class TestImagenResult:
    """Test ImagenResult data structure."""

    def test_successful_result_structure(self):
        """Test creating a successful Imagen result."""
        result = ImagenResult(
            success=True,
            image_base64="base64encodeddata==",
            mime_type="image/png",
            prompt_used="Test prompt",
        )

        assert result.success is True
        assert result.image_base64 == "base64encodeddata=="
        assert result.mime_type == "image/png"
        assert result.error is None

    def test_failed_result_structure(self):
        """Test creating a failed Imagen result."""
        result = ImagenResult(
            success=False,
            error="Safety filter triggered"
        )

        assert result.success is False
        assert result.error == "Safety filter triggered"
        assert result.image_base64 is None

    def test_default_mime_type(self):
        """Test default mime type is PNG."""
        result = ImagenResult(success=True, image_base64="data")
        assert result.mime_type == "image/png"


class TestResultConversion:
    """Test Imagen result to dict conversion."""

    def test_successful_result_conversion(self):
        """Test converting successful result to dict."""
        result = ImagenResult(
            success=True,
            image_base64="SGVsbG8gV29ybGQ=",
            mime_type="image/png",
        )

        data = result_to_dict(result)

        assert data["success"] is True
        assert "image_data" in data
        assert data["image_data"].startswith("data:image/png;base64,")
        assert "SGVsbG8gV29ybGQ=" in data["image_data"]

    def test_failed_result_conversion(self):
        """Test converting failed result to dict."""
        result = ImagenResult(
            success=False,
            error="Generation blocked"
        )

        data = result_to_dict(result)

        assert data["success"] is False
        assert data["error"] == "Generation blocked"
        assert "image_data" not in data


class TestPlaceholderSVG:
    """Test placeholder SVG generation for dev mode."""

    def test_placeholder_generates_data_url(self):
        """Test that placeholder generates a data URL."""
        svg = generate_placeholder_svg("Powerhouse")

        assert svg.startswith("data:image/svg+xml;base64,")

    def test_placeholder_includes_archetype_name(self):
        """Test that placeholder SVG includes archetype name."""
        import base64

        svg_data_url = generate_placeholder_svg("Aerobic Engine")

        # Decode the base64 to check content
        base64_part = svg_data_url.split(",")[1]
        svg_content = base64.b64decode(base64_part).decode()

        assert "Aerobic Engine" in svg_content

    def test_all_archetypes_have_unique_colors(self):
        """Test that each archetype placeholder has different colors."""
        import base64

        svgs = {}
        for archetype in ARCHETYPE_STYLES.keys():
            svg_data_url = generate_placeholder_svg(archetype)
            base64_part = svg_data_url.split(",")[1]
            svg_content = base64.b64decode(base64_part).decode()
            svgs[archetype] = svg_content

        # Check that SVGs are different
        unique_svgs = set(svgs.values())
        assert len(unique_svgs) == 8

    def test_placeholder_fallback_for_unknown_archetype(self):
        """Test that unknown archetype gets Powerhouse colors."""
        svg = generate_placeholder_svg("Unknown")

        # Should still generate valid SVG
        assert svg.startswith("data:image/svg+xml;base64,")

    def test_placeholder_is_valid_svg(self):
        """Test that generated placeholder is valid SVG."""
        import base64

        svg_data_url = generate_placeholder_svg("Powerhouse")
        base64_part = svg_data_url.split(",")[1]
        svg_content = base64.b64decode(base64_part).decode()

        assert "<svg" in svg_content
        assert "</svg>" in svg_content
        assert "xmlns=" in svg_content


class TestComplianceRequirements:
    """
    Tests for hackathon compliance in image generation.

    Rule: "For any generative media (AI-generated images or video),
    participants must use animations only. Submissions must not feature
    real people or any likeness of actual individuals whatsoever."
    """

    def test_prompt_specifies_non_photorealistic(self):
        """Verify prompt explicitly requests non-photorealistic output."""
        assert "non-photorealistic" in BASE_PROMPT.lower()
        assert "not a photograph" in BASE_PROMPT.lower()

    def test_prompt_avoids_real_faces(self):
        """Verify prompt instructs to avoid identifiable faces."""
        prompt_lower = BASE_PROMPT.lower()
        assert "abstract" in prompt_lower or "silhouette" in prompt_lower
        assert "no specific face" in prompt_lower or "abstract" in prompt_lower

    def test_prompt_requests_stylized_output(self):
        """Verify prompt requests stylized/artistic rendering."""
        prompt_lower = BASE_PROMPT.lower()
        assert "stylized" in prompt_lower
        assert "artistic" in prompt_lower

    def test_placeholder_uses_silhouette(self):
        """Verify placeholder SVG uses abstract silhouette."""
        import base64

        svg_data_url = generate_placeholder_svg("Powerhouse")
        base64_part = svg_data_url.split(",")[1]
        svg_content = base64.b64decode(base64_part).decode()

        # Should have abstract figure elements, not detailed face
        assert "ellipse" in svg_content or "path" in svg_content
        # Should not have detailed facial features
        assert "eye" not in svg_content.lower()
        assert "nose" not in svg_content.lower()
        assert "mouth" not in svg_content.lower()
