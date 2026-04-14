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


class DigitalMirrorData(BaseModel):
    user_position: list[float]
    centroid_positions: dict[str, list[float]]
    distribution_data: list[dict]


class MatchResponse(BaseModel):
    session_id: str
    primary_archetype: ArchetypeInfo
    olympic_sports: list[SportMatch]
    paralympic_sports: list[SportMatch]
    digital_mirror: DigitalMirrorData
    narrative: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] | None = None
