import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getSessionResult, type SessionResult } from "../services/api";
import ArchetypeCard from "./ArchetypeCard";
import DigitalMirror from "./DigitalMirror";
import ChatInterface from "./ChatInterface";

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    getSessionResult(sessionId)
      .then(setResult)
      .catch(() => setError("Could not load results. Please try again."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 mx-auto animate-spin rounded-full border-4 border-navy-mid border-t-gold" />
          <p className="font-heading text-lg text-slate">Analyzing your build...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-usa">{error || "Something went wrong."}</p>
          <Link to="/" className="font-heading text-gold underline">Try again</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Back link */}
      <Link to="/" className="mb-8 inline-block font-heading text-sm text-slate hover:text-gold transition">
        &larr; Start Over
      </Link>

      {/* Archetype Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-2 font-heading text-sm font-medium uppercase tracking-[0.2em] text-gold">
          Your Archetype
        </p>
        <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
          {result.primary_archetype.name}
        </h1>
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <div className="h-1.5 rounded-full bg-gold" style={{ width: `${result.primary_archetype.confidence * 100}%`, maxWidth: "200px" }} />
          <span className="font-heading text-xs text-slate">
            {Math.round(result.primary_archetype.confidence * 100)}% match
          </span>
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate">
          {result.primary_archetype.description}
        </p>
      </motion.div>

      {/* Digital Mirror */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <DigitalMirror data={result.digital_mirror} />
      </motion.section>

      {/* Narrative */}
      {result.narrative && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass mb-16 rounded-2xl p-8"
        >
          <p className="text-lg leading-relaxed text-silver italic">
            "{result.narrative}"
          </p>
        </motion.section>
      )}

      {/* Sports — Olympic & Paralympic side by side */}
      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">
            Olympic Sports
          </h2>
          <div className="space-y-4">
            {result.olympic_sports.map((s, i) => (
              <ArchetypeCard
                key={i}
                sport={s.sport}
                event={s.event}
                why={s.why}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">
            Paralympic Sports
          </h2>
          <div className="space-y-4">
            {result.paralympic_sports.map((s, i) => (
              <ArchetypeCard
                key={i}
                sport={s.sport}
                event={s.event}
                why={s.why}
                classification={s.classification}
                classificationExplainer={s.classification_explainer}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Historical Context */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass mb-16 rounded-2xl p-8"
      >
        <h2 className="mb-3 text-xl font-bold text-white">
          Historical Context
        </h2>
        <p className="leading-relaxed text-silver">
          {result.primary_archetype.historical_context}
        </p>
      </motion.section>

      {/* Chat */}
      <ChatInterface sessionId={sessionId || ""} />
    </main>
  );
}
