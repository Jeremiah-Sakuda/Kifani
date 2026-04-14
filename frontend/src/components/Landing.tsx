import { motion } from "framer-motion";
import InputForm from "./InputForm";

const RINGS = [280, 400, 540];

export default function Landing() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 h-[400px] w-[400px] rounded-full bg-red-usa/5 blur-[100px]" />
      </div>

      {/* Concentric rings behind the form */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {RINGS.map((size, i) => (
          <motion.div
            key={size}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 + i * 0.2, ease: "easeOut" }}
            className="absolute rounded-full border border-gold/[0.04]"
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {/* Header content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 flex items-center gap-2"
        >
          <div className="h-px w-8 bg-gold/40" />
          <p className="font-heading text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Team USA Athlete Archetype Agent
          </p>
          <div className="h-px w-8 bg-gold/40" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-6 text-5xl font-bold leading-[1.1] text-white md:text-7xl"
        >
          Find Your{" "}
          <span className="glow-text bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
            Archetype
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12 max-w-lg text-lg leading-relaxed text-slate"
        >
          Enter your physical traits and discover which Team USA athletes
          — Olympic and Paralympic — share your build.{" "}
          <span className="text-silver">120 years of history, one personal result.</span>
        </motion.p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <InputForm />
      </motion.div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy to-transparent" />
    </main>
  );
}
