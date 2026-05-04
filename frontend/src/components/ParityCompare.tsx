import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { compareParityEvents, type ParityComparison } from "../services/api";

interface ParityCompareProps {
  eventType?: string;
  onClose?: () => void;
}

const QUICK_COMPARISONS = [
  { label: "100m Sprint", value: "100m" },
  { label: "Swimming", value: "swimming" },
  { label: "Marathon", value: "marathon" },
  { label: "Throws", value: "throws" },
];

export default function ParityCompare({ eventType, onClose }: ParityCompareProps) {
  const [selectedEvent, setSelectedEvent] = useState(eventType || "100m");
  const [comparison, setComparison] = useState<ParityComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true);
      setError(null);
      try {
        const data = await compareParityEvents(selectedEvent);
        setComparison(data);
      } catch (err) {
        setError("Failed to load comparison");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [selectedEvent]);

  return (
    <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-white">Parity Comparison</h3>
          <p className="mt-1 text-sm text-smoke">
            See how Olympic and Paralympic events align
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ash transition hover:bg-forge-iron hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick Selection */}
      <div className="mb-6 flex flex-wrap gap-2">
        {QUICK_COMPARISONS.map((item) => (
          <button
            key={item.value}
            onClick={() => setSelectedEvent(item.value)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              selectedEvent === item.value
                ? "bg-gold-core text-forge-black"
                : "bg-forge-iron text-smoke hover:bg-forge-graphite hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-core border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/20 p-4 text-red-400">
          {error}
        </div>
      )}

      {comparison && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h4 className="text-center font-display text-lg text-gold-core">
            {comparison.event_category}
          </h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Olympic Events */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="font-mono text-xs uppercase tracking-wider text-blue-400">
                  Olympic
                </span>
              </div>
              <div className="space-y-3">
                {comparison.olympic_events.map((event, idx) => (
                  <div key={idx} className="rounded-lg bg-forge-black/30 p-3">
                    <div className="font-medium text-white">{event.event}</div>
                    <div className="mt-1 text-sm text-smoke">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Paralympic Events */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="font-mono text-xs uppercase tracking-wider text-amber-400">
                  Paralympic
                </span>
              </div>
              <div className="space-y-3">
                {comparison.paralympic_events.map((event, idx) => (
                  <div key={idx} className="rounded-lg bg-forge-black/30 p-3">
                    <div className="flex items-start justify-between">
                      <div className="font-medium text-white">{event.event}</div>
                      {event.classification && (
                        <span className="rounded bg-amber-600/30 px-2 py-0.5 text-xs text-amber-300">
                          {event.classification}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-smoke">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parity Note */}
          <div className="rounded-lg bg-forge-iron/50 p-4">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-smoke">{comparison.parity_note}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
