import { motion } from "framer-motion";
import InputForm from "./InputForm";

export default function Landing() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-red-usa/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 font-heading text-sm font-medium uppercase tracking-[0.2em] text-gold"
        >
          Team USA Athlete Archetype Agent
        </motion.p>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
          Find Your{" "}
          <span className="glow-text bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent">
            Archetype
          </span>
        </h1>

        <p className="mb-12 max-w-lg text-lg text-slate">
          Enter your physical traits and discover which Team USA athletes —
          Olympic and Paralympic — share your build. 120 years of history,
          one personal result.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <InputForm />
      </motion.div>
    </main>
  );
}
