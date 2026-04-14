import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  sport: string;
  event: string;
  why: string;
  classification?: string;
  classificationExplainer?: string;
}

export default function ArchetypeCard({
  sport,
  event,
  why,
  classification,
  classificationExplainer,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass group rounded-xl p-5 transition hover:border-gold/20 hover:shadow-[0_0_20px_rgba(201,168,76,0.06)]">
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-white">
          {sport}
        </h3>
        {classification && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 rounded-md bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold transition hover:bg-gold/20"
          >
            <span>{classification}</span>
            <svg
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      <p className="mb-2 text-sm font-medium text-gold/70">{event}</p>
      <p className="text-sm leading-relaxed text-slate">{why}</p>

      <AnimatePresence>
        {classification && classificationExplainer && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-gold/10 bg-gold/5 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gold">
                Classification: {classification}
              </p>
              <p className="text-xs leading-relaxed text-silver">
                {classificationExplainer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
