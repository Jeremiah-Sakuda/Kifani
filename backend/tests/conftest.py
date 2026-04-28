"""
Pytest configuration and fixtures for FORGED backend tests.
"""

import os
import pytest
from fastapi.testclient import TestClient

# Set dev mode for tests
os.environ["DEV_MODE"] = "true"

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_match_request():
    """Sample biometric data for matching tests."""
    return {
        "height_cm": 180.0,
        "weight_kg": 75.0,
        "arm_span_cm": 182.0,
        "age_range": "25-34",
        "activity_preferences": ["running", "swimming"]
    }


@pytest.fixture
def sample_powerhouse_request():
    """Biometrics typical of Powerhouse archetype."""
    return {
        "height_cm": 183.0,
        "weight_kg": 103.0
    }


@pytest.fixture
def sample_aerobic_engine_request():
    """Biometrics typical of Aerobic Engine archetype."""
    return {
        "height_cm": 178.0,
        "weight_kg": 72.0
    }


@pytest.fixture
def sample_coordinated_specialist_request():
    """Biometrics typical of Coordinated Specialist archetype."""
    return {
        "height_cm": 165.0,
        "weight_kg": 59.0
    }
