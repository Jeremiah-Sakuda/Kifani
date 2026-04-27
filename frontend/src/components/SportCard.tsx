import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  sport: string;
  event: string;
  why: string;
  classification?: string;
  classificationExplainer?: string;
  type: "olympic" | "paralympic";
}

export default function SportCard({
  sport,
  event,
  why,
  classification,
  classificationExplainer,
  type,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showClassification, setShowClassification] = useState(false);

  const isParalympic = type === "paralympic";
  const accentColor = isParalympic ? "para-green" : "para-blue";

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-forge-steel/60 transition-all duration-300 hover:bg-forge-steel"
      whileHover={{ y: -2 }}
    >
      {/* Accent line */}
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-${accentColor} opacity-60 transition-opacity group-hover:opacity-100`}
      />

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg text-white">{sport}</h3>
            <p className="text-sm text-smoke">{event}</p>
          </div>

          {/* Classification badge for Paralympic */}
          {isParalympic && classification && (
            <div className="relative">
              <button
                onClick={() => setShowClassification(!showClassification)}
                className={`badge badge-paralympic cursor-pointer transition hover:bg-${accentColor}/30`}
              >
                {classification}
                <svg
                  className={`ml-1 h-3 w-3 transition-transform ${showClassification ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Classification Popover */}
              <AnimatePresence>
                {showClassification && classificationExplainer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl bg-forge-charcoal p-4 shadow-lift"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full bg-${accentColor}`} />
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-para-green">
                        Classification: {classification}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-silver">
                      {classificationExplainer}
                    </p>
                    {/* Arrow */}
                    <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-forge-charcoal" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Why explanation */}
        <p className="text-sm leading-relaxed text-silver">
          {expanded || why.length <= 120 ? why : `${why.slice(0, 120)}...`}
        </p>

        {/* Expand button if text is long */}
        {why.length > 120 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs font-medium text-gold-core transition hover:text-gold-bright"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Hover glow effect */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${accentColor}/10 blur-3xl opacity-0 transition-opacity group-hover:opacity-100`}
      />
    </motion.div>
  );
}
