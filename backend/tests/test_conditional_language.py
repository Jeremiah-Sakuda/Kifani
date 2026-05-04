"""
Tests for conditional language service — compliance critical.

This service ensures all outputs use appropriate hedging language
per hackathon rules (e.g., "could align with" not "would be good at").
"""

import pytest
from app.services.conditional_language import (
    get_confidence_level,
    get_language_modifiers,
    get_subject_phrase,
    get_verb_phrase,
    get_qualifier,
    get_confidence_descriptor,
    get_recommendation_phrase,
    build_conditional_statement,
    format_confidence_for_display,
    enrich_match_result_with_language,
    get_confidence_aware_prompt_injection,
    LANGUAGE_MODIFIERS,
)


class TestConfidenceLevelDetermination:
    """Test confidence level classification."""

    def test_high_confidence_threshold(self):
        """Test that >= 0.75 maps to high."""
        assert get_confidence_level(0.75) == "high"
        assert get_confidence_level(0.85) == "high"
        assert get_confidence_level(1.0) == "high"

    def test_moderate_confidence_threshold(self):
        """Test that 0.50-0.74 maps to moderate."""
        assert get_confidence_level(0.50) == "moderate"
        assert get_confidence_level(0.65) == "moderate"
        assert get_confidence_level(0.74) == "moderate"

    def test_low_confidence_threshold(self):
        """Test that 0.30-0.49 maps to low."""
        assert get_confidence_level(0.30) == "low"
        assert get_confidence_level(0.40) == "low"
        assert get_confidence_level(0.49) == "low"

    def test_uncertain_confidence_threshold(self):
        """Test that < 0.30 maps to uncertain."""
        assert get_confidence_level(0.0) == "uncertain"
        assert get_confidence_level(0.15) == "uncertain"
        assert get_confidence_level(0.29) == "uncertain"


class TestLanguageModifiers:
    """Test language modifier retrieval."""

    def test_all_levels_have_modifiers(self):
        """Verify all confidence levels have defined modifiers."""
        for level in ["high", "moderate", "low", "uncertain"]:
            assert level in LANGUAGE_MODIFIERS
            modifiers = LANGUAGE_MODIFIERS[level]
            assert len(modifiers.subject_phrases) > 0
            assert len(modifiers.verb_phrases) > 0
            assert len(modifiers.qualifiers) > 0
            assert len(modifiers.recommendation_phrases) > 0

    def test_get_modifiers_returns_correct_level(self):
        """Test that get_language_modifiers returns correct level."""
        modifiers = get_language_modifiers(0.80)
        assert modifiers.level == "high"

        modifiers = get_language_modifiers(0.60)
        assert modifiers.level == "moderate"

    def test_confidence_ranges_are_correct(self):
        """Verify confidence ranges are properly defined."""
        assert LANGUAGE_MODIFIERS["high"].confidence_range == (0.75, 1.0)
        assert LANGUAGE_MODIFIERS["moderate"].confidence_range == (0.50, 0.75)
        assert LANGUAGE_MODIFIERS["low"].confidence_range == (0.30, 0.50)
        assert LANGUAGE_MODIFIERS["uncertain"].confidence_range == (0.0, 0.30)


class TestConditionalPhrasing:
    """Test that phrases use appropriate conditional language."""

    def test_high_confidence_uses_conditional_language(self):
        """Even high confidence should use conditional phrasing."""
        phrase = get_subject_phrase(0.90)
        # Should not contain absolute language
        assert "will" not in phrase.lower()
        assert "definitely" not in phrase.lower()
        # Should contain conditional language
        assert any(word in phrase.lower() for word in ["aligns", "match", "shows"])

    def test_moderate_confidence_uses_could_language(self):
        """Moderate confidence should use 'could' style phrasing."""
        phrase = get_subject_phrase(0.60)
        assert any(word in phrase.lower() for word in ["could", "suggests", "indicate"])

    def test_low_confidence_uses_tentative_language(self):
        """Low confidence should use tentative language."""
        phrase = get_subject_phrase(0.35)
        assert any(word in phrase.lower() for word in ["may", "possible", "hints"])

    def test_recommendation_phrases_avoid_guarantees(self):
        """Recommendation phrases should never guarantee outcomes."""
        for level in ["high", "moderate", "low", "uncertain"]:
            modifiers = LANGUAGE_MODIFIERS[level]
            for phrase in modifiers.recommendation_phrases:
                # Should not contain guarantee language
                assert "will" not in phrase.lower()
                assert "guaranteed" not in phrase.lower()
                assert "definitely" not in phrase.lower()


class TestPhraseRetrieval:
    """Test individual phrase retrieval functions."""

    def test_get_subject_phrase_wraps_index(self):
        """Test that index wrapping works for phrase selection."""
        phrase_0 = get_subject_phrase(0.80, index=0)
        phrase_3 = get_subject_phrase(0.80, index=3)  # Should wrap
        assert isinstance(phrase_0, str)
        assert isinstance(phrase_3, str)

    def test_get_verb_phrase_returns_string(self):
        """Test verb phrase retrieval."""
        phrase = get_verb_phrase(0.60)
        assert isinstance(phrase, str)
        assert len(phrase) > 0

    def test_get_qualifier_returns_string(self):
        """Test qualifier retrieval."""
        qualifier = get_qualifier(0.40)
        assert isinstance(qualifier, str)
        assert len(qualifier) > 0

    def test_get_confidence_descriptor_returns_string(self):
        """Test confidence descriptor retrieval."""
        descriptor = get_confidence_descriptor(0.80)
        assert isinstance(descriptor, str)
        assert len(descriptor) > 0

    def test_get_recommendation_phrase_returns_string(self):
        """Test recommendation phrase retrieval."""
        phrase = get_recommendation_phrase(0.25)
        assert isinstance(phrase, str)
        assert len(phrase) > 0


class TestConditionalStatementBuilder:
    """Test complete conditional statement building."""

    def test_build_basic_statement(self):
        """Test building a basic conditional statement."""
        statement = build_conditional_statement(0.70, "Powerhouse")
        assert "Powerhouse" in statement
        assert len(statement) > 20  # Should be a complete sentence

    def test_build_statement_with_traits(self):
        """Test statement with trait description."""
        statement = build_conditional_statement(
            0.80,
            "Aerobic Engine",
            "Your lean build and height"
        )
        assert "Aerobic Engine" in statement
        assert "lean build" in statement

    def test_statement_varies_by_confidence(self):
        """Test that statements differ based on confidence level."""
        high_stmt = build_conditional_statement(0.90, "Test")
        low_stmt = build_conditional_statement(0.35, "Test")
        assert high_stmt != low_stmt


class TestDisplayFormatting:
    """Test confidence display formatting."""

    def test_format_includes_required_fields(self):
        """Test that format includes all required display fields."""
        display = format_confidence_for_display(0.65)

        assert "value" in display
        assert "percentage" in display
        assert "level" in display
        assert "descriptor" in display
        assert "explanation" in display
        assert "style" in display

    def test_percentage_is_integer(self):
        """Test that percentage is an integer."""
        display = format_confidence_for_display(0.756)
        assert display["percentage"] == 75
        assert isinstance(display["percentage"], int)

    def test_style_has_color_and_icon(self):
        """Test that style hints include color and icon."""
        display = format_confidence_for_display(0.80)
        assert "color" in display["style"]
        assert "icon" in display["style"]

    def test_each_level_has_unique_style(self):
        """Test that each confidence level has distinct styling."""
        styles = set()
        for conf in [0.90, 0.60, 0.40, 0.15]:
            display = format_confidence_for_display(conf)
            styles.add(display["style"]["color"])
        assert len(styles) == 4


class TestMatchResultEnrichment:
    """Test match result enrichment with language context."""

    def test_enrichment_adds_language_context(self):
        """Test that enrichment adds language_context field."""
        match_result = {
            "primary_archetype": {
                "name": "Powerhouse",
                "confidence": 0.85
            }
        }

        enriched = enrich_match_result_with_language(match_result)

        assert "language_context" in enriched
        assert "confidence_level" in enriched["language_context"]
        assert "suggested_phrases" in enriched["language_context"]
        assert "opening_statement" in enriched["language_context"]

    def test_enrichment_preserves_original_data(self):
        """Test that enrichment doesn't remove original data."""
        match_result = {
            "primary_archetype": {
                "name": "Powerhouse",
                "confidence": 0.85
            },
            "other_field": "preserved"
        }

        enriched = enrich_match_result_with_language(match_result)

        assert enriched["other_field"] == "preserved"
        assert enriched["primary_archetype"]["name"] == "Powerhouse"

    def test_suggested_phrases_structure(self):
        """Test that suggested phrases have correct structure."""
        match_result = {
            "primary_archetype": {
                "name": "Test",
                "confidence": 0.70
            }
        }

        enriched = enrich_match_result_with_language(match_result)
        phrases = enriched["language_context"]["suggested_phrases"]

        assert "subject" in phrases
        assert "verb" in phrases
        assert "qualifier" in phrases
        assert "recommendation" in phrases


class TestPromptInjection:
    """Test confidence-aware prompt injection generation."""

    def test_prompt_injection_includes_confidence(self):
        """Test that prompt injection includes confidence percentage."""
        prompt = get_confidence_aware_prompt_injection(0.85)
        assert "85%" in prompt
        assert "HIGH" in prompt

    def test_prompt_injection_varies_by_level(self):
        """Test different confidence levels produce different prompts."""
        high_prompt = get_confidence_aware_prompt_injection(0.90)
        low_prompt = get_confidence_aware_prompt_injection(0.35)

        assert "HIGH" in high_prompt
        assert "LOW" in low_prompt
        assert high_prompt != low_prompt

    def test_prompt_injection_includes_example_phrases(self):
        """Test that prompt injection includes example phrases."""
        prompt = get_confidence_aware_prompt_injection(0.60)
        assert "could" in prompt.lower() or "suggests" in prompt.lower()

    def test_all_levels_generate_valid_prompts(self):
        """Test that all confidence levels generate non-empty prompts."""
        for conf in [0.95, 0.65, 0.40, 0.15]:
            prompt = get_confidence_aware_prompt_injection(conf)
            assert isinstance(prompt, str)
            assert len(prompt) > 50  # Should be substantial


class TestComplianceRequirements:
    """
    Tests specifically for hackathon compliance requirements.

    Rule: "Ensure all archetypes and insights are presented using
    conditional phrasing like 'could lead to' rather than guaranteeing
    specific performance results."
    """

    def test_no_absolute_claims_in_any_phrases(self):
        """Verify no phrases make absolute claims about performance."""
        # Use word boundaries to avoid false positives like "uncertainty"
        import re
        forbidden_patterns = [
            r"\bwill\b", r"\bdefinitely\b", r"\bguaranteed\b",
            r"\bcertain\b", r"\balways\b", r"\bmust\b",
            r"\bsurely\b", r"\babsolutely\b", r"\bundoubtedly\b"
        ]

        for level, modifiers in LANGUAGE_MODIFIERS.items():
            all_phrases = (
                modifiers.subject_phrases +
                modifiers.verb_phrases +
                modifiers.qualifiers +
                modifiers.recommendation_phrases
            )
            for phrase in all_phrases:
                phrase_lower = phrase.lower()
                for pattern in forbidden_patterns:
                    match = re.search(pattern, phrase_lower)
                    assert match is None, (
                        f"Found forbidden word in {level} phrase: {phrase}"
                    )

    def test_conditional_words_present(self):
        """Verify conditional words are used throughout."""
        conditional_words = [
            "could", "may", "might", "suggests", "indicates",
            "aligns", "shares", "shows", "potential", "possible"
        ]

        for level, modifiers in LANGUAGE_MODIFIERS.items():
            all_phrases = " ".join(
                modifiers.subject_phrases +
                modifiers.recommendation_phrases
            ).lower()

            has_conditional = any(word in all_phrases for word in conditional_words)
            assert has_conditional, (
                f"Level '{level}' missing conditional language"
            )

    def test_recommendation_phrases_never_promise_results(self):
        """Verify recommendations don't promise athletic outcomes."""
        result_words = ["succeed", "win", "medal", "champion", "best"]

        for level, modifiers in LANGUAGE_MODIFIERS.items():
            for phrase in modifiers.recommendation_phrases:
                phrase_lower = phrase.lower()
                for word in result_words:
                    assert word not in phrase_lower, (
                        f"Found result-promising word '{word}' in: {phrase}"
                    )

    def test_no_banned_phrases_in_output(self):
        """
        Verify output never contains explicitly banned phrases.

        Per hackathon rules, these phrases imply performance guarantees
        and must never appear in any generated output.
        """
        banned_phrases = [
            "would excel",
            "you will",
            "guaranteed",
            "best at",
            "would likely excel",
            "has strong potential for",
        ]

        for level, modifiers in LANGUAGE_MODIFIERS.items():
            all_phrases = (
                modifiers.subject_phrases +
                modifiers.verb_phrases +
                modifiers.qualifiers +
                modifiers.recommendation_phrases +
                modifiers.confidence_descriptors
            )
            for phrase in all_phrases:
                phrase_lower = phrase.lower()
                for banned in banned_phrases:
                    assert banned not in phrase_lower, (
                        f"Found banned phrase '{banned}' in {level}: {phrase}"
                    )
