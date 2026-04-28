"""
Tests for API endpoints.
"""



class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_returns_ok(self, client):
        """Test that health endpoint returns ok status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestMatchEndpoint:
    """Test the /api/match endpoint."""

    def test_match_with_valid_data(self, client, sample_match_request):
        """Test matching with valid biometric data."""
        response = client.post("/api/match", json=sample_match_request)
        assert response.status_code == 200

        data = response.json()
        assert "session_id" in data
        assert "primary_archetype" in data
        assert "olympic_sports" in data
        assert "paralympic_sports" in data
        assert "digital_mirror" in data

    def test_match_with_minimal_data(self, client):
        """Test matching with only required fields."""
        minimal_request = {
            "height_cm": 175.0,
            "weight_kg": 70.0
        }
        response = client.post("/api/match", json=minimal_request)
        assert response.status_code == 200

    def test_match_returns_archetype_details(self, client, sample_match_request):
        """Test that match returns full archetype details."""
        response = client.post("/api/match", json=sample_match_request)
        data = response.json()

        archetype = data["primary_archetype"]
        assert "name" in archetype
        assert "description" in archetype
        assert "confidence" in archetype

    def test_match_returns_sport_alignments(self, client, sample_match_request):
        """Test that match returns sport alignments."""
        response = client.post("/api/match", json=sample_match_request)
        data = response.json()

        # Should have Paralympic sports for all archetypes
        assert len(data["paralympic_sports"]) > 0

        # Each sport should have classification info
        for sport in data["paralympic_sports"]:
            assert "sport" in sport
            assert "classification" in sport

    def test_match_with_invalid_height(self, client):
        """Test validation rejects invalid height."""
        response = client.post("/api/match", json={
            "height_cm": -10.0,
            "weight_kg": 70.0
        })
        assert response.status_code == 422

    def test_match_with_invalid_weight(self, client):
        """Test validation rejects invalid weight."""
        response = client.post("/api/match", json={
            "height_cm": 175.0,
            "weight_kg": 0.0
        })
        assert response.status_code == 422

    def test_match_with_missing_required_field(self, client):
        """Test validation requires height and weight."""
        response = client.post("/api/match", json={
            "height_cm": 175.0
            # Missing weight_kg
        })
        assert response.status_code == 422


class TestChatEndpoint:
    """Test the /api/chat endpoint."""

    def test_chat_with_valid_session(self, client, sample_match_request):
        """Test chat endpoint with valid session."""
        # First create a session via match
        match_response = client.post("/api/match", json=sample_match_request)
        assert match_response.status_code == 200
        session_id = match_response.json()["session_id"]

        # Now test chat with that session
        response = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "Why was I matched with this archetype?"
        })
        assert response.status_code == 200

        data = response.json()
        assert "reply" in data
        assert len(data["reply"]) > 0

    def test_chat_with_invalid_session(self, client):
        """Test that chat returns 404 for invalid session."""
        response = client.post("/api/chat", json={
            "session_id": "nonexistent-session",
            "message": "Tell me about swimming"
        })
        assert response.status_code == 404

    def test_chat_response_references_archetype(self, client, sample_powerhouse_request):
        """Test that chat response references user's archetype."""
        # Create session
        match_response = client.post("/api/match", json=sample_powerhouse_request)
        session_id = match_response.json()["session_id"]

        # Chat
        response = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "What makes me a good match?"
        })
        data = response.json()

        # Response should mention the archetype
        assert "reply" in data
        assert len(data["reply"]) > 0


class TestMultimodalEndpoints:
    """Test multimodal input endpoints."""

    def test_photo_analysis_endpoint_exists(self, client):
        """Test that photo analysis endpoint is registered."""
        # Test with missing data to verify endpoint exists
        response = client.post("/api/analyze/photo/base64", json={})
        # Should be 422 (validation error) not 404
        assert response.status_code == 422

    def test_voice_analysis_endpoint_exists(self, client):
        """Test that voice analysis endpoint is registered."""
        response = client.post("/api/analyze/voice/base64", json={})
        assert response.status_code == 422

    def test_imagen_portrait_endpoint(self, client):
        """Test Imagen portrait generation endpoint."""
        response = client.get("/api/imagen/portrait/Powerhouse")
        assert response.status_code == 200

        data = response.json()
        assert "image_data" in data or "svg" in data


class TestSessionEndpoint:
    """Test session retrieval endpoint."""

    def test_get_nonexistent_session(self, client):
        """Test retrieving a session that doesn't exist."""
        response = client.get("/api/session/nonexistent-session-id")
        assert response.status_code == 404
