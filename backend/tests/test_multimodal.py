"""
Tests for multimodal analysis services (photo and voice).

These tests focus on data structures and result conversion,
as actual Gemini calls are mocked in dev mode.
"""

import pytest
from app.services.photo_analysis import (
    PhotoAnalysisResult,
    result_to_dict as photo_result_to_dict,
)
from app.services.voice_analysis import (
    VoiceAnalysisResult,
    result_to_dict as voice_result_to_dict,
)


class TestPhotoAnalysisResult:
    """Test PhotoAnalysisResult data structure."""

    def test_successful_result_structure(self):
        """Test creating a successful photo analysis result."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.85,
            height_cm=175.0,
            weight_kg=70.0,
            height_range=(170.0, 180.0),
            weight_range=(65.0, 75.0),
            build_type="average",
            arm_span_ratio=1.02,
            observations=["Good posture", "Athletic build"],
            limitations=["Loose clothing"],
        )

        assert result.success is True
        assert result.confidence == 0.85
        assert result.height_cm == 175.0
        assert result.weight_kg == 70.0
        assert result.build_type == "average"

    def test_failed_result_structure(self):
        """Test creating a failed photo analysis result."""
        result = PhotoAnalysisResult(
            success=False,
            error="Not a full-body photo"
        )

        assert result.success is False
        assert result.error == "Not a full-body photo"
        assert result.height_cm is None

    def test_default_values(self):
        """Test default values for PhotoAnalysisResult."""
        result = PhotoAnalysisResult(success=True)

        assert result.confidence == 0.0
        assert result.height_cm is None
        assert result.observations is None


class TestPhotoResultConversion:
    """Test photo result to dict conversion."""

    def test_successful_result_conversion(self):
        """Test converting successful result to dict."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.80,
            height_cm=180.0,
            weight_kg=75.0,
            height_range=(175.0, 185.0),
            weight_range=(70.0, 80.0),
            build_type="athletic",
            arm_span_ratio=1.0,
            observations=["Clear image"],
            limitations=[],
        )

        data = photo_result_to_dict(result)

        assert data["success"] is True
        assert data["confidence"] == 0.80
        assert data["estimates"]["height_cm"] == 180.0
        assert data["estimates"]["weight_kg"] == 75.0
        assert data["estimates"]["build_type"] == "athletic"
        assert data["requires_confirmation"] is False  # confidence >= 0.7

    def test_failed_result_conversion(self):
        """Test converting failed result to dict."""
        result = PhotoAnalysisResult(
            success=False,
            error="Could not detect person"
        )

        data = photo_result_to_dict(result)

        assert data["success"] is False
        assert data["error"] == "Could not detect person"
        assert "estimates" not in data

    def test_low_confidence_requires_confirmation(self):
        """Test that low confidence triggers confirmation requirement."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.50,
            height_cm=175.0,
            weight_kg=70.0,
        )

        data = photo_result_to_dict(result)

        assert data["requires_confirmation"] is True

    def test_height_range_conversion(self):
        """Test that height/weight ranges are converted to lists."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.75,
            height_cm=175.0,
            weight_kg=70.0,
            height_range=(170.0, 180.0),
            weight_range=(65.0, 75.0),
        )

        data = photo_result_to_dict(result)

        assert data["estimates"]["height_range_cm"] == [170.0, 180.0]
        assert data["estimates"]["weight_range_kg"] == [65.0, 75.0]


class TestVoiceAnalysisResult:
    """Test VoiceAnalysisResult data structure."""

    def test_successful_result_structure(self):
        """Test creating a successful voice analysis result."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm 6 feet 2 inches tall and weigh 185 pounds",
            confidence=0.90,
            height_cm=188.0,
            weight_kg=84.0,
            arm_span_cm=None,
            activity_preferences=["running", "basketball"],
            build_description="tall and athletic",
            missing_required=[],
            clarification_needed=[],
        )

        assert result.success is True
        assert result.confidence == 0.90
        assert result.height_cm == 188.0
        assert result.weight_kg == 84.0
        assert "running" in result.activity_preferences

    def test_failed_result_structure(self):
        """Test creating a failed voice analysis result."""
        result = VoiceAnalysisResult(
            success=False,
            transcript="[unintelligible audio]",
            error="Could not extract measurements"
        )

        assert result.success is False
        assert result.transcript == "[unintelligible audio]"
        assert result.error == "Could not extract measurements"

    def test_partial_extraction_result(self):
        """Test result with partial extraction (missing weight)."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm about 5 foot 10",
            confidence=0.70,
            height_cm=178.0,
            weight_kg=None,
            missing_required=["weight"],
        )

        assert result.success is True
        assert result.height_cm == 178.0
        assert result.weight_kg is None
        assert "weight" in result.missing_required


class TestVoiceResultConversion:
    """Test voice result to dict conversion."""

    def test_successful_result_conversion(self):
        """Test converting successful result to dict."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm 180 cm and 75 kg",
            confidence=0.85,
            height_cm=180.0,
            weight_kg=75.0,
            activity_preferences=["swimming"],
            build_description="lean",
            missing_required=[],
            clarification_needed=[],
        )

        data = voice_result_to_dict(result)

        assert data["success"] is True
        assert data["transcript"] == "I'm 180 cm and 75 kg"
        assert data["confidence"] == 0.85
        assert data["extracted"]["height_cm"] == 180.0
        assert data["extracted"]["weight_kg"] == 75.0
        assert data["requires_confirmation"] is False

    def test_failed_result_conversion(self):
        """Test converting failed result to dict."""
        result = VoiceAnalysisResult(
            success=False,
            transcript="",
            error="Audio too short"
        )

        data = voice_result_to_dict(result)

        assert data["success"] is False
        assert data["error"] == "Audio too short"
        assert "extracted" not in data

    def test_missing_required_triggers_confirmation(self):
        """Test that missing required fields trigger confirmation."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm tall",
            confidence=0.80,
            height_cm=185.0,
            weight_kg=None,
            missing_required=["weight"],
        )

        data = voice_result_to_dict(result)

        assert data["requires_confirmation"] is True
        assert "weight" in data["missing_required"]

    def test_clarification_needed_triggers_confirmation(self):
        """Test that clarification needs trigger confirmation."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm about six feet, maybe a bit more",
            confidence=0.60,
            height_cm=183.0,
            weight_kg=75.0,
            clarification_needed=["exact height unclear"],
        )

        data = voice_result_to_dict(result)

        assert data["requires_confirmation"] is True
        assert len(data["clarification_needed"]) > 0

    def test_low_confidence_triggers_confirmation(self):
        """Test that low confidence triggers confirmation."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I think I'm around 170",
            confidence=0.50,
            height_cm=170.0,
            weight_kg=70.0,
            missing_required=[],
            clarification_needed=[],
        )

        data = voice_result_to_dict(result)

        assert data["requires_confirmation"] is True


class TestMultimodalEdgeCases:
    """Test edge cases in multimodal processing."""

    def test_photo_result_with_none_ranges(self):
        """Test photo result when ranges are not available."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.60,
            height_cm=175.0,
            weight_kg=70.0,
            height_range=None,
            weight_range=None,
        )

        data = photo_result_to_dict(result)

        assert data["estimates"]["height_range_cm"] is None
        assert data["estimates"]["weight_range_kg"] is None

    def test_voice_result_with_empty_preferences(self):
        """Test voice result with no activity preferences mentioned."""
        result = VoiceAnalysisResult(
            success=True,
            transcript="I'm 175 cm and 70 kg",
            confidence=0.90,
            height_cm=175.0,
            weight_kg=70.0,
            activity_preferences=[],
        )

        data = voice_result_to_dict(result)

        assert data["extracted"]["activity_preferences"] == []

    def test_photo_zero_confidence(self):
        """Test photo result with zero confidence."""
        result = PhotoAnalysisResult(
            success=True,
            confidence=0.0,
            height_cm=175.0,
            weight_kg=70.0,
        )

        data = photo_result_to_dict(result)

        assert data["confidence"] == 0.0
        assert data["requires_confirmation"] is True

    def test_voice_result_preserves_transcript_on_failure(self):
        """Test that transcript is preserved even on failure."""
        result = VoiceAnalysisResult(
            success=False,
            transcript="Some audio content that couldn't be parsed",
            error="No measurements found"
        )

        data = voice_result_to_dict(result)

        assert data["transcript"] == "Some audio content that couldn't be parsed"
        assert data["error"] == "No measurements found"
