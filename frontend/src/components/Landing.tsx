import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputModeSelector from "./InputModeSelector";
import PhotoInput, { type PrefillData } from "./PhotoInput";
import VoiceInput from "./VoiceInput";
import FormInput from "./FormInput";

type InputMode = "photo" | "voice" | "form";

const EMBER_PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 2,
  size: 2 + Math.random() * 3,
}));

export default function Landing() {
  const [inputMode, setInputMode] = useState<InputMode>("photo");
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>();

  const handleFallbackToForm = (data?: PrefillData) => {
    setPrefillData(data);
    setInputMode("form");
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Atmospheric Background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Ember gradient at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-ember-deep/40 via-forge-charcoal/0 to-transparent" />

        {/* Gold radial glow behind content */}
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-gold-core/[0.04] via-transparent to-transparent" />

        {/* Subtle ember accent */}
        <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-ember-glow/[0.03] blur-[120px]" />
      </div>

      {/* Floating ember particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {EMBER_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-ember-bright"
            style={{
              left: `${p.x}%`,
              bottom: -10,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [-10, -150],
              opacity: [0, 1, 0],
              scale: [1, 0.5],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Header Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-12 flex max-w-3xl flex-col items-center text-center"
      >
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 flex items-center gap-4"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-core/60" />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-gold-core">
            120 Years of Team USA
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-core/60" />
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="mb-6"
        >
          <span className="block font-display text-6xl text-white md:text-8xl">
            FORGED
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-4 max-w-xl font-display text-xl italic text-silver md:text-2xl"
        >
          See yourself in 120 years of Olympic &amp; Paralympic history
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-lg text-base leading-relaxed text-smoke"
        >
          Every fan carries a body with history. Discover which Team USA athletes
          share your build — powered by Gemini.
        </motion.p>
      </motion.div>

      {/* Input Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="relative z-10 mb-8"
      >
        <InputModeSelector activeMode={inputMode} onModeChange={setInputMode} />
      </motion.div>

      {/* Input Forms */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="relative z-10 w-full max-w-lg"
      >
        <AnimatePresence mode="wait">
          {inputMode === "photo" && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PhotoInput onFallback={handleFallbackToForm} />
            </motion.div>
          )}

          {inputMode === "voice" && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <VoiceInput onFallback={handleFallbackToForm} />
            </motion.div>
          )}

          {inputMode === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <FormInput prefillData={prefillData} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forge-black to-transparent" />

      {/* Decorative Lines */}
      <div className="pointer-events-none absolute left-8 top-1/4 hidden h-32 w-px bg-gradient-to-b from-transparent via-gold-core/20 to-transparent lg:block" />
      <div className="pointer-events-none absolute right-8 top-1/3 hidden h-24 w-px bg-gradient-to-b from-transparent via-ember-glow/20 to-transparent lg:block" />
    </main>
  );
}
