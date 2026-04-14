import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export interface MatchRequest {
  height_cm: number;
  weight_kg: number;
  arm_span_cm?: number;
  age_range?: string;
  activity_preference?: string[];
}

export interface SportMatch {
  sport: string;
  event: string;
  why: string;
  classification?: string;
  classification_explainer?: string;
}

export interface ArchetypeResult {
  session_id: string;
  primary_archetype: {
    name: string;
    description: string;
    historical_context: string;
    confidence: number;
  };
  olympic_sports: SportMatch[];
  paralympic_sports: SportMatch[];
  digital_mirror: {
    user_position: number[];
    centroid_positions: Record<string, number[]>;
    distribution_data: Array<{ x: number; y: number; label: string }>;
  };
  narrative: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  sources?: string[];
}

export async function matchArchetype(
  data: MatchRequest
): Promise<ArchetypeResult> {
  const res = await api.post<ArchetypeResult>("/match", data);
  return res.data;
}

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await api.post<ChatResponse>("/chat", {
    session_id: sessionId,
    message,
  });
  return res.data;
}

export default api;
