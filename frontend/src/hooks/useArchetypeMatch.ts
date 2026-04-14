import { useState } from "react";
import { matchArchetype, type MatchRequest, type ArchetypeResult } from "../services/api";

export function useArchetypeMatch() {
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitMatch(data: MatchRequest) {
    setLoading(true);
    setError(null);
    try {
      const res = await matchArchetype(data);
      setResult(res);
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, submitMatch };
}
