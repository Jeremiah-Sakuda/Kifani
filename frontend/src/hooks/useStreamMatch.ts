import { useState, useCallback, useRef } from "react";
import {
  streamMatch,
  getStreamSessionResult,
  type MatchRequest,
  type StreamEvent,
  type StreamSessionResult,
} from "../services/api";

export interface ToolCall {
  id: string;
  tool: string;
  status: "calling" | "complete" | "error";
  description?: string;
  resultSummary?: string;
}

export interface ReasoningStep {
  id: string;
  type: "thought" | "tool";
  content: string;
  timestamp: number;
}

export function useStreamMatch() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [narrative, setNarrative] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [result, setResult] = useState<StreamSessionResult | null>(null);

  const stepIdRef = useRef(0);

  const addStep = useCallback((type: "thought" | "tool", content: string) => {
    const id = String(++stepIdRef.current);
    const step: ReasoningStep = {
      id,
      type,
      content,
      timestamp: Date.now(),
    };
    setSteps((prev) => [...prev, step]);
    return id;
  }, []);

  const startStream = useCallback(
    async (data: MatchRequest) => {
      setIsStreaming(true);
      setError(null);
      setSteps([]);
      setToolCalls([]);
      setNarrative("");
      setIsComplete(false);
      setResult(null);

      let capturedSessionId: string | null = null;

      try {
        for await (const event of streamMatch(data)) {
          // Capture session ID from first event
          if (event.sessionId && !capturedSessionId) {
            capturedSessionId = event.sessionId;
            setSessionId(event.sessionId);
          }

          handleEvent(event);
        }

        // Fetch final result after stream completes
        if (capturedSessionId) {
          const finalResult = await getStreamSessionResult(capturedSessionId);
          setResult(finalResult);
        }

        setIsComplete(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Streaming failed";
        setError(message);
      } finally {
        setIsStreaming(false);
      }

      return capturedSessionId;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      switch (event.type) {
        case "thinking": {
          const message = event.data.message as string;
          addStep("thought", message);
          break;
        }

        case "tool_call": {
          const tool = event.data.tool as string;
          const description = event.data.description as string;
          const stepId = addStep("tool", tool);

          setToolCalls((prev) => [
            ...prev,
            {
              id: stepId,
              tool,
              status: "calling",
              description,
            },
          ]);
          break;
        }

        case "tool_result": {
          const tool = event.data.tool as string;
          const resultSummary = event.data.result_summary as string;

          setToolCalls((prev) =>
            prev.map((tc) =>
              tc.tool === tool && tc.status === "calling"
                ? { ...tc, status: "complete", resultSummary }
                : tc
            )
          );
          break;
        }

        case "response": {
          const narrativeText = event.data.narrative as string;
          setNarrative(narrativeText);
          break;
        }

        case "error": {
          const errorMessage = event.data.error as string;
          setError(errorMessage);

          // Mark any pending tool calls as error
          setToolCalls((prev) =>
            prev.map((tc) =>
              tc.status === "calling" ? { ...tc, status: "error" } : tc
            )
          );
          break;
        }

        case "complete": {
          // Stream is done
          break;
        }
      }
    },
    [addStep]
  );

  const reset = useCallback(() => {
    setSessionId(null);
    setSteps([]);
    setToolCalls([]);
    setNarrative("");
    setIsComplete(false);
    setError(null);
    setIsStreaming(false);
    setResult(null);
    stepIdRef.current = 0;
  }, []);

  return {
    sessionId,
    steps,
    toolCalls,
    narrative,
    isComplete,
    error,
    isStreaming,
    result,
    startStream,
    reset,
  };
}
