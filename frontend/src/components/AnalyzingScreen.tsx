import { motion } from "framer-motion";

const STEPS = [
  "Scanning biometric profile...",
  "Matching against 14,000+ Team USA athletes...",
  "Analyzing Olympic event alignments...",
  "Evaluating Paralympic sport correlations...",
  "Generating your archetype...",
];

export default function AnalyzingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy"
    >
      {/* Pulsing rings */}
      <div className="relative mb-12">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-gold/20"
            style={{ width: 80 + i * 50, height: 80 + i * 50 }}
            initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.div
          className="relative h-16 w-16 rounded-full border-2 border-gold/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
        </motion.div>
      </div>

      {/* Step text cycling */}
      <div className="h-8 text-center">
        {STEPS.map((step, i) => (
          <motion.p
            key={step}
            className="absolute left-0 right-0 font-heading text-sm text-slate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
            transition={{
              duration: 2,
              delay: i * 1.5,
              times: [0, 0.1, 0.8, 1],
            }}
          >
            {step}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
