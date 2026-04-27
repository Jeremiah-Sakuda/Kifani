import { motion } from "framer-motion";

interface Props {
  confidence: number;
  showExplanation?: boolean;
}

type ConfidenceLevel = "high" | "moderate" | "low" | "uncertain";

interface LevelInfo {
  level: ConfidenceLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  barColor: string;
}

function getConfidenceLevel(confidence: number): LevelInfo {
  if (confidence >= 0.75) {
    return {
      level: "high",
      label: "Strong Match",
      description: "Your measurements closely match this archetype's typical profile based on Team USA historical data.",
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      barColor: "from-green-500 via-green-400 to-emerald-400",
    };
  } else if (confidence >= 0.50) {
    return {
      level: "moderate",
      label: "Reasonable Alignment",
      description: "Your build shares notable characteristics with this archetype, though some variation exists in the data.",
      color: "text-gold-core",
      bgColor: "bg-gold-core/10",
      barColor: "from-gold-deep via-gold-core to-gold-bright",
    };
  } else if (confidence >= 0.30) {
    return {
      level: "low",
      label: "Possible Connection",
      description: "This archetype shows some alignment with your profile, but other archetypes may also fit well.",
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      barColor: "from-amber-600 via-amber-500 to-amber-400",
    };
  } else {
    return {
      level: "uncertain",
      label: "Versatile Profile",
      description: "Your unique measurements span multiple archetypes, suggesting athletic versatility across disciplines.",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      barColor: "from-blue-600 via-blue-500 to-cyan-400",
    };
  }
}

export default function ConfidenceMeter({ confidence, showExplanation = true }: Props) {
  const confidencePct = Math.round(confidence * 100);
  const levelInfo = getConfidenceLevel(confidence);

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-ash">Match Confidence</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${levelInfo.bgColor} ${levelInfo.color}`}>
            {levelInfo.level === "high" && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {levelInfo.level === "moderate" && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {levelInfo.level === "low" && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {levelInfo.level === "uncertain" && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {levelInfo.label}
          </span>
        </div>
        <span className="font-mono text-sm font-semibold text-white">{confidencePct}%</span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-forge-steel">
        {/* Tick marks */}
        <div className="absolute inset-0 flex">
          <div className="w-[30%] border-r border-white/10" />
          <div className="w-[20%] border-r border-white/10" />
          <div className="w-[25%] border-r border-white/10" />
          <div className="w-[25%]" />
        </div>

        {/* Fill */}
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${levelInfo.barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${confidencePct}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Glow effect */}
        <motion.div
          className="absolute top-0 h-full w-4 rounded-full bg-white/30 blur-sm"
          initial={{ left: "-16px" }}
          animate={{ left: `calc(${confidencePct}% - 16px)` }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Scale labels */}
      <div className="mt-1 flex justify-between text-[10px] text-ash">
        <span>Uncertain</span>
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-4 overflow-hidden rounded-lg bg-forge-steel/40 p-3"
        >
          <p className="text-sm leading-relaxed text-smoke">
            {levelInfo.description}
          </p>
        </motion.div>
      )}
    </div>
  );
}
