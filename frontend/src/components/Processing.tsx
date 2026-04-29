import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useStreamMatch, type ToolCall } from "../hooks/useStreamMatch";
import type { MatchRequest } from "../services/api";

const TOOL_LABELS: Record<string, { name: string; description: string }> = {
  match_archetype: {
    name: "Archetype Matcher",
    description: "Analyzing biometric data against 120 years of Team USA athletes",
  },
  classify_paralympic: {
    name: "Paralympic Classifier",
    description: "Mapping archetype to Paralympic sports with classification depth",
  },
  regional_context: {
    name: "Regional Context",
    description: "Finding archetype prevalence patterns in your region",
  },
  generate_followups: {
    name: "Follow-up Generator",
    description: "Preparing personalized questions for deeper exploration",
  },
};

export default function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasStartedRef = useRef(false);

  const {
    sessionId,
    steps,
    toolCalls,
    isComplete,
    error,
    isStreaming,
    startStream,
  } = useStreamMatch();

  // Get form data from navigation state
  const formData = location.state?.formData as MatchRequest | undefined;

  // Start stream when component mounts
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (!formData) {
      // No form data - redirect to home
      navigate("/", { replace: true });
      return;
    }

    startStream(formData);
  }, [formData, startStream, navigate]);

  // Navigate to results when complete
  useEffect(() => {
    if (isComplete && sessionId) {
      // Small delay for final animation
      const timer = setTimeout(() => {
        navigate(`/results/${sessionId}`);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, sessionId, navigate]);

  // Calculate progress based on completed tool calls
  const totalTools = Object.keys(TOOL_LABELS).length;
  const completedTools = toolCalls.filter((tc) => tc.status === "complete").length;
  const activeTools = toolCalls.filter((tc) => tc.status === "calling").length;
  const progress = isComplete
    ? 100
    : Math.round(((completedTools + activeTools * 0.5) / totalTools) * 100);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-16">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-forge-black via-ember-deep/20 to-forge-black" />

        {/* Animated forge glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,69,0,0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="shell relative z-10 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-display text-4xl text-white md:text-5xl">
            Forging Your Archetype
          </h1>
          <p className="text-smoke">
            Analyzing against 30,000 Team USA athletes...
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-12"
        >
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-mono text-ash">
              {isComplete ? "Complete" : isStreaming ? "Processing" : "Initializing"}
            </span>
            <span className="font-mono text-gold-core">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-forge-steel">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ember-glow via-gold-core to-gold-bright"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Error Message with Retry */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg bg-ember-glow/10 px-4 py-3 text-center"
          >
            <p className="mb-3 text-sm text-ember-bright">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  hasStartedRef.current = false;
                  if (formData) startStream(formData);
                }}
                className="rounded-lg bg-ember-glow/20 px-4 py-2 text-sm font-medium text-ember-bright transition hover:bg-ember-glow/30"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="rounded-lg bg-forge-steel px-4 py-2 text-sm font-medium text-smoke transition hover:bg-forge-graphite"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {/* Tool Calls Grid */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2">
          {Object.entries(TOOL_LABELS).map(([toolId, tool], index) => {
            const call = toolCalls.find((tc) => tc.tool === toolId);
            const status: ToolCall["status"] | "pending" = call?.status || "pending";

            return (
              <motion.div
                key={toolId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl p-4 transition-all duration-500 ${
                  status === "calling"
                    ? "card-forge ring-1 ring-ember-glow/50"
                    : status === "complete"
                    ? "card-forge ring-1 ring-gold-core/30"
                    : status === "error"
                    ? "card-forge ring-1 ring-ember-bright/50"
                    : "bg-forge-steel/50"
                }`}
              >
                {/* Status indicator */}
                <div className="mb-3 flex items-center justify-between">
                  <span className={`font-mono text-xs uppercase tracking-wider ${
                    status === "calling"
                      ? "text-ember-bright"
                      : status === "complete"
                      ? "text-gold-core"
                      : status === "error"
                      ? "text-ember-bright"
                      : "text-ash"
                  }`}>
                    {tool.name}
                  </span>

                  <AnimatePresence mode="wait">
                    {status === "calling" && (
                      <motion.div
                        key="calling"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <motion.div
                          className="h-2 w-2 rounded-full bg-ember-bright"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-xs text-ember-bright">Active</span>
                      </motion.div>
                    )}
                    {status === "complete" && (
                      <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-core/20"
                      >
                        <svg className="h-3 w-3 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                    {status === "error" && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-ember-bright/20"
                      >
                        <svg className="h-3 w-3 text-ember-bright" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.div>
                    )}
                    {status === "pending" && (
                      <motion.div
                        key="pending"
                        className="h-2 w-2 rounded-full bg-ash"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <p className={`text-sm ${
                  status === "pending" ? "text-ash" : "text-smoke"
                }`}>
                  {call?.resultSummary || tool.description}
                </p>

                {/* Scanning line effect when active */}
                {status === "calling" && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-ember-glow to-transparent"
                    animate={{ y: [0, 100] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Reasoning Trace */}
        <div className="rounded-xl bg-forge-charcoal/80 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              isStreaming ? "animate-pulse bg-gold-core" : isComplete ? "bg-gold-core" : "bg-ash"
            }`} />
            <span className="font-mono text-xs uppercase tracking-wider text-ash">
              Agent Reasoning
            </span>
          </div>

          <div className="max-h-32 space-y-2 overflow-y-auto font-mono text-sm">
            <AnimatePresence>
              {steps
                .filter((s) => s.type === "thought")
                .map((step) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-gold-core">→</span>
                    <span className="text-silver">{step.content}</span>
                  </motion.div>
                ))}
            </AnimatePresence>

            {steps.length === 0 && !isStreaming && (
              <div className="text-ash">Initializing agent...</div>
            )}
            {steps.length === 0 && isStreaming && (
              <div className="text-ash">Connecting to agent...</div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative sparks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-ember-bright"
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: "40%",
            }}
            animate={{
              y: [0, -200],
              opacity: [0, 1, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: i * 0.5,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </main>
  );
}
