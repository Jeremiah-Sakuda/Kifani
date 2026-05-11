import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
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
import ShareCard from "./ShareCard";

// Types for validation trace and secondary archetypes
interface ValidationTrace {
  model: string;
  input_length: number;
  output_length: number;
  was_modified: boolean;
  modifications: string[];
  latency_ms: number;
  validation_summary: string;
}

interface SecondaryArchetype {
  name: string;
  confidence: number;
  description: string;
  is_paralympic_first: boolean;
}

interface DualMatch {
  biometric_match: {
    archetype: string;
    confidence: number;
    method: string;
  };
  semantic_match: {
    archetype: string;
    confidence: number;
    method: string;
  } | null;
  combined_confidence: number;
  signals_agree: boolean;
}

// Extended result with new fields
interface ExtendedSessionResult extends SessionResult {
  validation_trace?: ValidationTrace;
  secondary_archetypes?: SecondaryArchetype[];
  paralympic_discovery_mode?: boolean;
  insight?: string;
  dual_match?: DualMatch;
}

// Normalize streaming result to match expected format
function normalizeResult(
  streamResult: StreamSessionResult
): ExtendedSessionResult {
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
    // New fields
    validation_trace: (streamResult as unknown as { validation_trace?: ValidationTrace }).validation_trace,
    secondary_archetypes: (streamResult as unknown as { secondary_archetypes?: SecondaryArchetype[] }).secondary_archetypes,
    paralympic_discovery_mode: (streamResult as unknown as { paralympic_discovery_mode?: boolean }).paralympic_discovery_mode,
    insight: streamResult.primary_archetype.insight,
    dual_match: (streamResult as unknown as { dual_match?: DualMatch }).dual_match,
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
  const [result, setResult] = useState<ExtendedSessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mirrorRevealed, setMirrorRevealed] = useState(false);
  const [paralympicDiscoveryMode, setParalympicDiscoveryMode] = useState(false);
  const [validationExpanded, setValidationExpanded] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    async function fetchResult() {
      if (!sessionId) return;
      try {
        // Try streaming session endpoint first (new flow)
        const streamResult = await getStreamSessionResult(sessionId);
        const normalized = normalizeResult(streamResult);
        setResult(normalized);
        // Set initial Paralympic discovery mode from result
        if (normalized.paralympic_discovery_mode) {
          setParalympicDiscoveryMode(true);
        }
      } catch {
        try {
          // Fall back to regular session endpoint (old flow)
          const regularResult = await getSessionResult(sessionId);
          setResult(regularResult as ExtendedSessionResult);
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
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-8 max-w-2xl px-4"
            style={{ display: 'block', width: '100%' }}
          >
            <ConfidenceMeter confidence={confidence} showExplanation />
          </motion.div>

          {/* Dual Match Display (when semantic matching is available) */}
          {result.dual_match?.semantic_match && (
            <motion.div
              variants={fadeUp}
              className="mx-auto mb-8 w-full max-w-2xl px-4"
            >
              <div className="rounded-xl bg-forge-charcoal/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-ash">
                    Dual Match Analysis
                  </span>
                  {result.dual_match.signals_agree ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-para-green/20 px-2 py-0.5 text-xs text-para-green">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Signals Agree
                    </span>
                  ) : (
                    <span className="rounded-full bg-ember-glow/20 px-2 py-0.5 text-xs text-ember-bright">
                      Mixed Signals
                    </span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Biometric Match */}
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Biometric Match</span>
                    </div>
                    <div className="mb-1 text-xs text-smoke">K-means clustering</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display text-gold-core">
                        {(result.dual_match.biometric_match.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm text-silver">
                        {result.dual_match.biometric_match.archetype}
                      </span>
                    </div>
                  </div>
                  {/* Semantic Match */}
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Narrative Match</span>
                    </div>
                    <div className="mb-1 text-xs text-smoke">text-embedding-005</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display text-gold-core">
                        {(result.dual_match.semantic_match.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm text-silver">
                        {result.dual_match.semantic_match.archetype}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Paralympic Discovery Mode Toggle */}
          <motion.div variants={fadeUp} className="mb-8 flex items-center justify-center gap-3">
            <span className="text-sm text-smoke">Paralympic Discovery Mode</span>
            <button
              onClick={() => setParalympicDiscoveryMode(!paralympicDiscoveryMode)}
              className={`relative h-6 w-12 rounded-full transition-colors ${
                paralympicDiscoveryMode ? 'bg-para-green' : 'bg-forge-graphite'
              }`}
              aria-label="Toggle Paralympic Discovery Mode"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                paralympicDiscoveryMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
            {paralympicDiscoveryMode && (
              <span className="text-xs text-para-green">Active</span>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="mx-auto w-full max-w-2xl text-lg leading-relaxed text-silver"
          >
            {result.primary_archetype.description}
          </motion.p>

          {/* Archetype Insight */}
          {result.insight && (
            <motion.div
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl rounded-lg bg-gold-core/10 p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="!max-w-none min-w-0 flex-1 text-sm leading-relaxed text-gold-core/90">{result.insight}</p>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Secondary Archetypes Panel */}
        {result.secondary_archetypes && result.secondary_archetypes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-forge-graphite" />
              <h2 className="font-mono text-xs uppercase tracking-wider text-ash">
                Secondary Alignments
              </h2>
              <div className="h-px flex-1 bg-forge-graphite" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {result.secondary_archetypes.map((arch, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-5 ${
                    arch.is_paralympic_first
                      ? 'border-2 border-para-green/30 bg-para-green/10'
                      : 'bg-forge-charcoal/60'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-display text-lg text-white">{arch.name}</h3>
                    <span className={`text-sm ${arch.is_paralympic_first ? 'text-para-green' : 'text-smoke'}`}>
                      {(arch.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <p className="text-sm text-silver line-clamp-2">{arch.description}</p>
                  {arch.is_paralympic_first && (
                    <span className="mt-2 inline-block rounded-full bg-para-green/20 px-2 py-0.5 text-xs text-para-green">
                      Paralympic-First Archetype
                    </span>
                  )}
                  {i === 0 && (
                    <p className="mt-2 text-xs text-smoke">
                      Delta from primary: {((confidence - arch.confidence) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

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
            className="relative mb-8 overflow-hidden rounded-2xl bg-forge-charcoal/60 p-6 backdrop-blur-sm md:p-8"
          >
            <div className="prose prose-invert prose-sm max-w-none md:prose-base prose-headings:font-display prose-headings:text-gold-core prose-h3:text-lg prose-p:text-silver prose-strong:text-white prose-li:text-smoke prose-ul:my-2 prose-li:my-0.5">
              <ReactMarkdown>{result.narrative}</ReactMarkdown>
            </div>
          </motion.section>
        )}

        {/* Validation Trace Panel - Gemini auditing Gemini */}
        {result.validation_trace && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-20"
          >
            <button
              onClick={() => setValidationExpanded(!validationExpanded)}
              className="flex w-full items-center justify-between rounded-lg bg-forge-charcoal/40 p-4 text-left transition hover:bg-forge-charcoal/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium text-white">Compliance Validation Trace</span>
                  <span className="ml-2 text-xs text-smoke">Gemini auditing Gemini</span>
                </div>
              </div>
              <svg
                className={`h-5 w-5 text-smoke transition-transform ${validationExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {validationExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-lg bg-forge-charcoal/30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-ash">Model</span>
                        <p className="font-mono text-xs text-smoke">{result.validation_trace.model}</p>
                      </div>
                      <div>
                        <span className="text-ash">Latency</span>
                        <p className="font-mono text-xs text-smoke">{result.validation_trace.latency_ms.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <span className="text-ash">Modified</span>
                        <p className={`font-mono text-xs ${result.validation_trace.was_modified ? 'text-amber-400' : 'text-green-400'}`}>
                          {result.validation_trace.was_modified ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <span className="text-ash">Length</span>
                        <p className="font-mono text-xs text-smoke">
                          {result.validation_trace.input_length} → {result.validation_trace.output_length} chars
                        </p>
                      </div>
                    </div>

                    {result.validation_trace.modifications.length > 0 && (
                      <div>
                        <span className="text-ash text-sm">Changes Applied</span>
                        <ul className="mt-1 space-y-1">
                          {result.validation_trace.modifications.map((mod, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-smoke">
                              <span className="h-1 w-1 rounded-full bg-amber-400" />
                              {mod}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-ash italic">
                      {result.validation_trace.validation_summary}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Sports Grid - Order based on Paralympic Discovery Mode */}
        <section className="mb-20 grid gap-8 lg:grid-cols-2">
          {paralympicDiscoveryMode ? (
            <>
              {/* Paralympic Sports First in Discovery Mode */}
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
                    <p className="text-sm text-para-green">Featured in Discovery Mode</p>
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

              {/* Olympic Sports Second */}
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
            </>
          ) : (
            <>
              {/* Olympic Sports First (Default) */}
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
            </>
          )}
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

        {/* Share Your Result */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mb-20"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-forge-graphite" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-ash">
              Share Your Result
            </h2>
            <div className="h-px flex-1 bg-forge-graphite" />
          </div>
          <div className="flex justify-center">
            <ShareCard
              archetype={result.primary_archetype.name}
              confidence={confidence}
              sessionId={sessionId || ""}
              sports={[
                ...(result.olympic_sports || []).map(s => s.sport),
                ...(result.paralympic_sports || []).map(s => s.sport),
              ].slice(0, 6)}
              isParalympicFirst={
                result.olympic_sports?.length === 0 &&
                (result.paralympic_sports?.length || 0) > 0
              }
            />
          </div>
        </motion.section>

        {/* Chat Interface */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
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
