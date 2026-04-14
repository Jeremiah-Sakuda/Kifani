import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getSessionResult, type SessionResult } from "../services/api";
import ArchetypeCard from "./ArchetypeCard";
import DigitalMirror from "./DigitalMirror";
import ChatInterface from "./ChatInterface";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-navy-mid border-t-gold" />
          <p className="font-heading text-lg text-slate">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-usa">{error || "Something went wrong."}</p>
          <Link to="/" className="font-heading text-gold underline">
            Try again
          </Link>
        </div>
      </main>
    );
  }

  const confidencePct = Math.round(result.primary_archetype.confidence * 100);

  return (
    <main className="relative mx-auto max-w-5xl px-6 py-12">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-gold/[0.03] blur-[140px]" />
      </div>

      {/* Back link */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Link
          to="/"
          className="mb-10 inline-flex items-center gap-2 font-heading text-sm text-slate transition hover:text-gold"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Start Over
        </Link>
      </motion.div>

      {/* Archetype Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mb-14 text-center"
      >
        <motion.div variants={fadeUp} className="mb-3 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gold/30" />
          <p className="font-heading text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Your Archetype
          </p>
          <div className="h-px w-12 bg-gold/30" />
        </motion.div>

        <motion.h1 variants={fadeUp} className="mb-5 text-5xl font-bold text-white md:text-7xl">
          {result.primary_archetype.name}
        </motion.h1>

        {/* Confidence meter */}
        <motion.div variants={fadeUp} className="mx-auto mb-6 max-w-xs">
          <div className="mb-1.5 flex justify-between">
            <span className="font-heading text-xs text-slate">Match Confidence</span>
            <span className="font-heading text-xs font-semibold text-gold">{confidencePct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy-mid">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright"
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-slate"
        >
          {result.primary_archetype.description}
        </motion.p>
      </motion.div>

      {/* Digital Mirror */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mb-16"
      >
        <DigitalMirror data={result.digital_mirror} />
      </motion.section>

      {/* Narrative */}
      {result.narrative && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass relative mb-16 overflow-hidden rounded-2xl p-8"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold to-transparent" />
          <p className="pl-4 text-lg leading-relaxed text-silver">
            {result.narrative}
          </p>
        </motion.section>
      )}

      {/* Sports — Olympic & Paralympic side by side */}
      <div className="mb-16 grid gap-10 md:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: 0.6 }}
        >
          <motion.div variants={fadeUp} className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <span className="text-sm">O</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Olympic Sports</h2>
          </motion.div>
          <div className="space-y-4">
            {result.olympic_sports.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <ArchetypeCard
                  sport={s.sport}
                  event={s.event}
                  why={s.why}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          transition={{ delayChildren: 0.7 }}
        >
          <motion.div variants={fadeUp} className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <span className="text-sm">P</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Paralympic Sports</h2>
          </motion.div>
          <div className="space-y-4">
            {result.paralympic_sports.map((s, i) => (
              <motion.div key={i} variants={fadeUp}>
                <ArchetypeCard
                  sport={s.sport}
                  event={s.event}
                  why={s.why}
                  classification={s.classification}
                  classificationExplainer={s.classification_explainer}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Historical Context */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass mb-16 rounded-2xl p-8"
      >
        <h2 className="mb-3 font-heading text-xl font-bold text-white">
          Historical Context
        </h2>
        <p className="leading-relaxed text-silver">
          {result.primary_archetype.historical_context}
        </p>
      </motion.section>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <ChatInterface sessionId={sessionId || ""} />
      </motion.div>
    </main>
  );
}
