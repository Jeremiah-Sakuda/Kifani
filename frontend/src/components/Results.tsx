import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSessionResult,
  getStreamSessionResult,
  type SessionResult,
  type StreamSessionResult,
} from "../services/api";
import DigitalMirror from "./DigitalMirror";
import SportCard from "./SportCard";
import ChatInterface from "./ChatInterface";
import MirrorReveal from "./MirrorReveal";
import ConfidenceMeter from "./ConfidenceMeter";

// Normalize streaming result to match expected format
function normalizeResult(
  streamResult: StreamSessionResult
): SessionResult {
  const sports = streamResult.sport_alignments || {};
  return {
    primary_archetype: {
      name: streamResult.primary_archetype.name,
      description: streamResult.primary_archetype.description,
      historical_context: streamResult.primary_archetype.historical_context || "",
      confidence: streamResult.primary_archetype.confidence,
    },
    olympic_sports: sports.olympic_sports || [],
    paralympic_sports: sports.paralympic_sports || [],
    digital_mirror: {
      user_position: streamResult.user_metrics?.position || [0, 0],
      centroid_positions: streamResult.centroid_positions || {},
      distribution_data: [],
    },
    narrative: streamResult.narrative,
  };
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  },
};

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mirrorRevealed, setMirrorRevealed] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchResult() {
      if (!sessionId) return;
      try {
        // Try streaming session endpoint first (new flow)
        const streamResult = await getStreamSessionResult(sessionId);
        setResult(normalizeResult(streamResult));
      } catch {
        try {
          // Fall back to regular session endpoint (old flow)
          const regularResult = await getSessionResult(sessionId);
          setResult(regularResult);
        } catch {
          setError("Could not load results. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <motion.div
            className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-forge-steel border-t-gold-core"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="font-display text-xl text-smoke">Loading your results...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-6 text-xl text-ember-bright">{error || "Something went wrong."}</p>
          <Link to="/" className="btn btn-primary">
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  const confidence = result.primary_archetype.confidence;

  return (
    <main className="relative min-h-screen">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute right-0 top-0 h-[800px] w-[800px] -translate-y-1/4 translate-x-1/4 rounded-full bg-gold-core/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-y-1/4 -translate-x-1/4 rounded-full bg-ember-glow/[0.02] blur-[120px]" />
      </div>

      <div className="shell relative z-10 py-12 lg:py-16">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 text-sm text-smoke transition hover:text-gold-core"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Start Over
          </Link>
        </motion.div>

        {/* Hero Section - Archetype Reveal */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-20 text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-core/50" />
            <span className="badge badge-gold">Your Archetype</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-core/50" />
          </motion.div>

          {/* Archetype Name */}
          <motion.h1
            variants={fadeUp}
            className="mb-6 font-display text-6xl text-white md:text-8xl"
          >
            <span className="text-gradient-gold glow-text-gold">
              {result.primary_archetype.name}
            </span>
          </motion.h1>

          {/* Confidence Meter */}
          <motion.div variants={fadeUp} className="mx-auto mb-8 max-w-md">
            <ConfidenceMeter confidence={confidence} showExplanation />
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-2xl text-lg leading-relaxed text-silver"
          >
            {result.primary_archetype.description}
          </motion.p>
        </motion.section>

        {/* Imagen Mirror Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <MirrorReveal
            archetype={result.primary_archetype.name}
            sessionId={sessionId || ""}
            onReveal={() => setMirrorRevealed(true)}
          />
        </motion.section>

        {/* Digital Mirror Visualization */}
        <AnimatePresence>
          {mirrorRevealed && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-forge-graphite" />
                <h2 className="font-mono text-xs uppercase tracking-wider text-ash">
                  Position Among Archetypes
                </h2>
                <div className="h-px flex-1 bg-forge-graphite" />
              </div>
              <DigitalMirror data={result.digital_mirror} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Narrative */}
        {result.narrative && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative mb-20 overflow-hidden rounded-2xl bg-forge-charcoal/60 p-8 backdrop-blur-sm"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold-core via-gold-core/50 to-transparent" />
            <p className="pl-6 font-display text-xl italic leading-relaxed text-silver">
              "{result.narrative}"
            </p>
          </motion.section>
        )}

        {/* Sports Grid */}
        <section className="mb-20 grid gap-8 lg:grid-cols-2">
          {/* Olympic Sports */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-para-blue/20">
                <svg className="h-5 w-5 text-para-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl text-white">Olympic Sports</h2>
                <p className="text-sm text-smoke">Sports that could align with your build</p>
              </div>
            </motion.div>

            {result.olympic_sports.map((sport, i) => (
              <motion.div key={i} variants={fadeUp}>
                <SportCard
                  sport={sport.sport}
                  event={sport.event}
                  why={sport.why}
                  type="olympic"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Paralympic Sports */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-para-green/20">
                <svg className="h-5 w-5 text-para-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-2xl text-white">Paralympic Sports</h2>
                <p className="text-sm text-smoke">Adaptive sports with classification context</p>
              </div>
            </motion.div>

            {result.paralympic_sports.map((sport, i) => (
              <motion.div key={i} variants={fadeUp}>
                <SportCard
                  sport={sport.sport}
                  event={sport.event}
                  why={sport.why}
                  classification={sport.classification}
                  classificationExplainer={sport.classification_explainer}
                  type="paralympic"
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Historical Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-20 rounded-2xl bg-forge-steel/50 p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-core/10">
              <svg className="h-6 w-6 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-display text-xl text-white">Historical Context</h3>
              <p className="leading-relaxed text-silver">
                {result.primary_archetype.historical_context}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Chat Interface */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-forge-graphite" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-ash">
              Ask Follow-up Questions
            </h2>
            <div className="h-px flex-1 bg-forge-graphite" />
          </div>
          <ChatInterface sessionId={sessionId || ""} />
        </motion.section>
      </div>
    </main>
  );
}
