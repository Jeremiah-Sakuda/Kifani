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

export type SessionResult = Omit<ArchetypeResult, "session_id">;

export async function getSessionResult(
  sessionId: string
): Promise<SessionResult> {
  const res = await api.get<SessionResult>(`/session/${sessionId}`);
  return res.data;
}

// ══════════════════════════════════════════════════════════════════════════════
// STREAMING API
// ══════════════════════════════════════════════════════════════════════════════

export type StreamEventType =
  | "thinking"
  | "tool_call"
  | "tool_result"
  | "response"
  | "error"
  | "complete";

export interface StreamEvent {
  type: StreamEventType;
  data: Record<string, unknown>;
}

export interface StreamSessionResult {
  session_id: string;
  primary_archetype: {
    name: string;
    description: string;
    historical_context?: string;
    confidence: number;
    mean_height_cm?: number;
    mean_weight_kg?: number;
    athlete_count?: number;
  };
  ranked_archetypes?: Array<{
    name: string;
    match_strength: number;
    description: string;
    is_paralympic_first: boolean;
  }>;
  sport_alignments?: {
    olympic_sports?: SportMatch[];
    paralympic_sports?: SportMatch[];
  };
  user_metrics?: {
    bmi: number;
    position: number[];
  };
  centroid_positions?: Record<string, number[]>;
  narrative: string;
}

/**
 * Stream archetype match with SSE events.
 *
 * Returns an async generator that yields StreamEvents in real-time.
 * Also returns the session_id from response headers.
 */
export async function* streamMatch(
  data: MatchRequest
): AsyncGenerator<StreamEvent & { sessionId?: string }, void, unknown> {
  const baseUrl = import.meta.env.VITE_API_URL || "/api";
  const response = await fetch(`${baseUrl}/stream/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Stream request failed: ${response.statusText}`);
  }

  // Get session ID from headers
  const sessionId = response.headers.get("X-Session-ID") || undefined;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      let currentEvent: Partial<StreamEvent> = {};

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent.type = line.slice(7).trim() as StreamEventType;
        } else if (line.startsWith("data: ")) {
          try {
            currentEvent.data = JSON.parse(line.slice(6));
          } catch {
            currentEvent.data = { raw: line.slice(6) };
          }

          // Emit complete event
          if (currentEvent.type && currentEvent.data) {
            yield {
              type: currentEvent.type,
              data: currentEvent.data,
              sessionId,
            };
            currentEvent = {};
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get streaming session result after stream completes.
 */
export async function getStreamSessionResult(
  sessionId: string
): Promise<StreamSessionResult> {
  const res = await api.get<StreamSessionResult>(
    `/stream/session/${sessionId}`
  );
  return res.data;
}

// ══════════════════════════════════════════════════════════════════════════════
// MULTIMODAL API
// ══════════════════════════════════════════════════════════════════════════════

export interface PhotoAnalysisResult {
  success: boolean;
  confidence?: number;
  estimates?: {
    height_cm: number | null;
    weight_kg: number | null;
    height_range_cm: [number, number] | null;
    weight_range_kg: [number, number] | null;
    build_type: string | null;
    arm_span_ratio: number | null;
  };
  observations?: string[];
  limitations?: string[];
  requires_confirmation?: boolean;
  error?: string;
}

export interface VoiceAnalysisResult {
  success: boolean;
  transcript?: string;
  confidence?: number;
  extracted?: {
    height_cm: number | null;
    weight_kg: number | null;
    arm_span_cm: number | null;
    activity_preferences: string[];
    build_description: string | null;
  };
  missing_required?: string[];
  clarification_needed?: string[];
  requires_confirmation?: boolean;
  error?: string;
}

/**
 * Analyze a photo for body proportion estimation.
 * Accepts base64-encoded image data.
 */
export async function analyzePhoto(
  imageData: string,
  mimeType: string = "image/jpeg"
): Promise<PhotoAnalysisResult> {
  const res = await api.post<PhotoAnalysisResult>("/analyze/photo/base64", {
    image_data: imageData,
    mime_type: mimeType,
  });
  return res.data;
}

/**
 * Analyze a voice recording for biometric extraction.
 * Accepts base64-encoded audio data.
 */
export async function analyzeVoice(
  audioData: string,
  mimeType: string = "audio/webm"
): Promise<VoiceAnalysisResult> {
  const res = await api.post<VoiceAnalysisResult>("/analyze/voice/base64", {
    audio_data: audioData,
    mime_type: mimeType,
  });
  return res.data;
}

export default api;
