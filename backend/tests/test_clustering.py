"""
Tests for archetype matching and clustering logic.
"""

from app.services.clustering import (
    compute_archetype_match,
    format_sport_matches,
    _normalize,
)
from app.models.schemas import MatchRequest


class TestNormalization:
    """Test the normalization helper function."""

    def test_normalize_middle_value(self):
        """Test normalizing a value in the middle of the range."""
        result = _normalize(175.0, 140.0, 210.0)
        assert 0.4 < result < 0.6

    def test_normalize_at_min(self):
        """Test normalizing at minimum boundary."""
        result = _normalize(140.0, 140.0, 210.0)
        assert result == 0.0

    def test_normalize_at_max(self):
        """Test normalizing at maximum boundary."""
        result = _normalize(210.0, 140.0, 210.0)
        assert result == 1.0

    def test_normalize_below_min_clamps(self):
        """Test that values below min are clamped."""
        result = _normalize(100.0, 140.0, 210.0)
        assert result == 0.0

    def test_normalize_above_max_clamps(self):
        """Test that values above max are clamped."""
        result = _normalize(250.0, 140.0, 210.0)
        assert result == 1.0

    def test_normalize_equal_range(self):
        """Test behavior when min equals max."""
        result = _normalize(100.0, 100.0, 100.0)
        assert result == 0.5


class TestArchetypeMatching:
    """Test the archetype matching algorithm."""

    def test_powerhouse_match(self, sample_powerhouse_request):
        """Test that Powerhouse biometrics match Powerhouse archetype."""
        request = MatchRequest(**sample_powerhouse_request)
        result = compute_archetype_match(request)

        assert result["archetype"].name == "Powerhouse"
        assert result["confidence"] > 0.7

    def test_aerobic_engine_match(self, sample_aerobic_engine_request):
        """Test that lean endurance biometrics match Aerobic Engine."""
        request = MatchRequest(**sample_aerobic_engine_request)
        result = compute_archetype_match(request)

        assert result["archetype"].name == "Aerobic Engine"
        assert result["confidence"] > 0.6

    def test_coordinated_specialist_match(self, sample_coordinated_specialist_request):
        """Test that compact biometrics match Coordinated Specialist."""
        request = MatchRequest(**sample_coordinated_specialist_request)
        result = compute_archetype_match(request)

        assert result["archetype"].name == "Coordinated Specialist"
        assert result["confidence"] > 0.7

    def test_match_returns_required_fields(self, sample_match_request):
        """Test that match result contains all required fields."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        assert "archetype" in result
        assert "confidence" in result
        assert "all_distances" in result
        assert "secondary_archetypes" in result
        assert "user_position" in result
        assert "centroid_positions" in result
        assert "user_bmi" in result

    def test_all_distances_includes_all_archetypes(self, sample_match_request):
        """Test that distances are computed for all 8 archetypes."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        assert len(result["all_distances"]) == 8

    def test_distances_are_sorted(self, sample_match_request):
        """Test that distances are sorted closest to farthest."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        distances = [d for _, d in result["all_distances"]]
        assert distances == sorted(distances)

    def test_confidence_in_valid_range(self, sample_match_request):
        """Test that confidence is in expected range."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        assert 0.55 <= result["confidence"] <= 0.98

    def test_user_position_normalized(self, sample_match_request):
        """Test that user position values are normalized to 0-1."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        x, y = result["user_position"]
        assert 0.0 <= x <= 1.0
        assert 0.0 <= y <= 1.0

    def test_centroid_positions_for_all_archetypes(self, sample_match_request):
        """Test that centroid positions exist for all archetypes."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        assert len(result["centroid_positions"]) == 8
        for name, pos in result["centroid_positions"].items():
            assert len(pos) == 2
            assert 0.0 <= pos[0] <= 1.0
            assert 0.0 <= pos[1] <= 1.0

    def test_secondary_archetypes_provided(self, sample_match_request):
        """Test that secondary archetypes are included."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)

        # Should have 3 secondary archetypes
        assert len(result["secondary_archetypes"]) == 3

    def test_bmi_calculated_correctly(self):
        """Test that BMI is calculated correctly."""
        request = MatchRequest(height_cm=180.0, weight_kg=81.0)
        result = compute_archetype_match(request)

        # BMI = 81 / (1.8)^2 = 25.0
        assert result["user_bmi"] == 25.0


class TestSportFormatting:
    """Test sport mapping formatting."""

    def test_format_includes_olympic_sports(self, sample_match_request):
        """Test that Olympic sports are included in formatting."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)
        sports = format_sport_matches(result["archetype"])

        if result["archetype"].sports_olympic:
            assert len(sports["olympic_sports"]) > 0

    def test_format_includes_paralympic_sports(self, sample_match_request):
        """Test that Paralympic sports are included in formatting."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)
        sports = format_sport_matches(result["archetype"])

        assert len(sports["paralympic_sports"]) > 0

    def test_format_respects_max_limits(self, sample_powerhouse_request):
        """Test that sport counts respect max limits."""
        request = MatchRequest(**sample_powerhouse_request)
        result = compute_archetype_match(request)
        sports = format_sport_matches(
            result["archetype"],
            max_olympic=2,
            max_paralympic=1
        )

        assert len(sports["olympic_sports"]) <= 2
        assert len(sports["paralympic_sports"]) <= 1

    def test_sport_format_has_required_fields(self, sample_match_request):
        """Test that formatted sports have required fields."""
        request = MatchRequest(**sample_match_request)
        result = compute_archetype_match(request)
        sports = format_sport_matches(result["archetype"])

        for sport in sports["paralympic_sports"]:
            assert "sport" in sport
            assert "event" in sport
            assert "why" in sport
            assert "classification" in sport
            assert "classification_explainer" in sport
