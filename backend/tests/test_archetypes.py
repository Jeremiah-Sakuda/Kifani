"""
Tests for archetype definitions and helper functions.
"""

from app.models.archetypes import (
    ARCHETYPES,
    get_archetype_by_name,
    get_all_archetype_names,
    get_olympic_archetypes,
    get_paralympic_archetypes,
)


class TestArchetypeDefinitions:
    """Test that all 8 archetypes are properly defined."""

    def test_eight_archetypes_exist(self):
        """Verify all 8 archetypes are defined."""
        assert len(ARCHETYPES) == 8

    def test_archetype_names(self):
        """Verify expected archetype names are present."""
        names = get_all_archetype_names()
        expected = [
            "Powerhouse",
            "Aerobic Engine",
            "Precision Athlete",
            "Explosive Mover",
            "Coordinated Specialist",
            "Tactical Endurance",
            "Adaptive Power",
            "Adaptive Endurance",
        ]
        assert names == expected

    def test_all_archetypes_have_required_fields(self):
        """Verify each archetype has all required biometric data."""
        for archetype in ARCHETYPES:
            assert archetype.name, "Archetype missing name"
            assert archetype.description, "Archetype missing description"
            assert archetype.historical_context, "Archetype missing historical context"
            assert archetype.mean_height_cm > 0, "Invalid height"
            assert archetype.mean_weight_kg > 0, "Invalid weight"
            assert archetype.mean_bmi > 0, "Invalid BMI"

    def test_paralympic_archetypes_have_sample_weight(self):
        """Verify Paralympic-first archetypes have boosted sample weights."""
        adaptive_power = get_archetype_by_name("Adaptive Power")
        adaptive_endurance = get_archetype_by_name("Adaptive Endurance")

        assert adaptive_power is not None
        assert adaptive_endurance is not None
        assert adaptive_power.sample_weight > 1.0
        assert adaptive_endurance.sample_weight > 1.0

    def test_paralympic_first_archetypes_have_no_olympic_sports(self):
        """Verify Adaptive archetypes are Paralympic-first."""
        adaptive_power = get_archetype_by_name("Adaptive Power")
        adaptive_endurance = get_archetype_by_name("Adaptive Endurance")

        assert adaptive_power is not None
        assert adaptive_endurance is not None
        assert len(adaptive_power.sports_olympic) == 0
        assert len(adaptive_endurance.sports_olympic) == 0

    def test_all_archetypes_have_paralympic_sports(self):
        """Verify all archetypes have Paralympic sport mappings."""
        for archetype in ARCHETYPES:
            assert len(archetype.sports_paralympic) > 0, (
                f"{archetype.name} missing Paralympic sports"
            )


class TestArchetypeHelpers:
    """Test archetype helper functions."""

    def test_get_archetype_by_name_found(self):
        """Test finding archetype by name."""
        powerhouse = get_archetype_by_name("Powerhouse")
        assert powerhouse is not None
        assert powerhouse.name == "Powerhouse"

    def test_get_archetype_by_name_case_insensitive(self):
        """Test case-insensitive name lookup."""
        result = get_archetype_by_name("AEROBIC ENGINE")
        assert result is not None
        assert result.name == "Aerobic Engine"

    def test_get_archetype_by_name_not_found(self):
        """Test behavior when archetype not found."""
        result = get_archetype_by_name("Nonexistent")
        assert result is None

    def test_get_olympic_archetypes(self):
        """Test filtering Olympic archetypes."""
        olympic = get_olympic_archetypes()
        # 6 archetypes have Olympic sports (not Adaptive Power/Endurance)
        assert len(olympic) == 6
        names = [a.name for a in olympic]
        assert "Adaptive Power" not in names
        assert "Adaptive Endurance" not in names

    def test_get_paralympic_archetypes(self):
        """Test filtering Paralympic archetypes."""
        paralympic = get_paralympic_archetypes()
        # All 8 archetypes have Paralympic sports
        assert len(paralympic) == 8


class TestSportMappings:
    """Test sport mapping data integrity."""

    def test_sport_mappings_have_required_fields(self):
        """Verify all sport mappings have required data."""
        for archetype in ARCHETYPES:
            for mapping in archetype.sports_olympic:
                assert mapping.sport, "Olympic sport missing name"
                assert len(mapping.events) > 0, "Olympic sport missing events"
                assert mapping.why, "Olympic sport missing rationale"

            for mapping in archetype.sports_paralympic:
                assert mapping.sport, "Paralympic sport missing name"
                assert len(mapping.events) > 0, "Paralympic sport missing events"
                assert mapping.why, "Paralympic sport missing rationale"
                assert mapping.classification, "Paralympic sport missing classification"
                assert mapping.classification_explainer, (
                    "Paralympic sport missing classification explainer"
                )

    def test_classification_codes_present(self):
        """Verify Paralympic classifications are documented."""
        for archetype in ARCHETYPES:
            for mapping in archetype.sports_paralympic:
                # Classification should contain actual codes
                assert len(mapping.classification) > 0
                # Explainer should describe what codes mean
                assert len(mapping.classification_explainer) > 20
