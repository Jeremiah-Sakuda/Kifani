from pydantic import BaseModel, Field


class MatchRequest(BaseModel):
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    arm_span_cm: float | None = Field(None, gt=0, description="Arm span in centimeters")
    age_range: str | None = Field(None, description="Age range bucket")
    activity_preference: list[str] | None = Field(None, description="Preferred activity types")


class SportMatch(BaseModel):
    sport: str
    event: str
    why: str
    classification: str | None = None
    classification_explainer: str | None = None


class ArchetypeInfo(BaseModel):
    name: str
    description: str
    historical_context: str
    confidence: float
    insight: str | None = None  # Non-obvious analytical insight


class SecondaryArchetype(BaseModel):
    """Secondary archetype match for discovery."""
    name: str
    confidence: float
    description: str
    is_paralympic_first: bool = False


class ValidationTrace(BaseModel):
    """Exposed validation trace for transparency — Gemini auditing Gemini."""
    model: str = "gemini-3.1-flash"
    input_length: int
    output_length: int
    was_modified: bool
    modifications: list[str] = []
    latency_ms: float
    validation_summary: str = ""


class DigitalMirrorData(BaseModel):
    user_position: list[float]
    centroid_positions: dict[str, list[float]]
    distribution_data: list[dict]


class MatchResponse(BaseModel):
    session_id: str
    primary_archetype: ArchetypeInfo
    secondary_archetypes: list[SecondaryArchetype] = []  # For discovery panel
    olympic_sports: list[SportMatch]
    paralympic_sports: list[SportMatch]
    digital_mirror: DigitalMirrorData
    narrative: str
    validation_trace: ValidationTrace | None = None  # Gemini auditing Gemini
    paralympic_discovery_mode: bool = False  # Track if Para mode was used


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] | None = None


# ══════════════════════════════════════════════════════════════════════════════
# STREAMING SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════


class StreamMatchRequest(BaseModel):
    """Request body for streaming match endpoint."""
    height_cm: float = Field(..., gt=0, description="Height in centimeters")
    weight_kg: float = Field(..., gt=0, description="Weight in kilograms")
    arm_span_cm: float | None = Field(None, gt=0, description="Arm span in centimeters")
    activity_preferences: list[str] | None = Field(None, description="Activity preferences")
    paralympic_discovery: bool = Field(False, description="Enable Paralympic Discovery Mode")


class StreamChatRequest(BaseModel):
    """Request body for streaming chat endpoint."""
    session_id: str
    message: str


class RankedArchetype(BaseModel):
    """Archetype in ranked list."""
    name: str
    match_strength: float
    description: str
    is_paralympic_first: bool = False


class StreamSessionResponse(BaseModel):
    """Response from stream session endpoint."""
    session_id: str
    primary_archetype: dict
    secondary_archetypes: list[SecondaryArchetype] = []  # For discovery panel
    ranked_archetypes: list[RankedArchetype] = []
    sport_alignments: dict = {}
    user_metrics: dict = {}
    centroid_positions: dict = {}
    narrative: str = ""
    validation_trace: ValidationTrace | None = None  # Gemini auditing Gemini
    paralympic_discovery_mode: bool = False
