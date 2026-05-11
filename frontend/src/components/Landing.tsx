import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InputModeSelector from "./InputModeSelector";
import PhotoInput, { type PrefillData } from "./PhotoInput";
import VoiceInput from "./VoiceInput";
import FormInput from "./FormInput";
import ArchetypePreview from "./ArchetypePreview";

type InputMode = "photo" | "voice" | "form";

const DEMO_PROFILES = [
  { name: "Swimmer Build", height_cm: 193, weight_kg: 88, arm_span_cm: 201 },
  { name: "Gymnast Build", height_cm: 157, weight_kg: 52 },
  { name: "Powerlifter Build", height_cm: 175, weight_kg: 105 },
  { name: "Runner Build", height_cm: 178, weight_kg: 62 },
];

const MONOLOGUE = [
  "For 120 years, they forged history.",
  "Thousands of athletes. Infinite variations of the human form.",
  "But every fan carries a body built for something.",
  "It's time to discover what you were built for.",
];

export default function Landing() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>();
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  // Cinematic Intro State
  const [showIntro, setShowIntro] = useState(true);
  const [introStarted, setIntroStarted] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // In deployment, we would uncomment this to only show on first visit.
    // For testing, we play it every time.
    /*
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      setShowIntro(false);
    }
    */
  }, []);

  const startIntro = () => {
    setIntroStarted(true);
    const audio = new Audio("/intro.mp3");
    audioRef.current = audio;
    audio.play().catch(console.error);

    // Timing synced roughly to the AriaNeural TTS pacing
    setTimeout(() => setIntroStep(1), 3500);
    setTimeout(() => setIntroStep(2), 8500);
    setTimeout(() => setIntroStep(3), 13500);
    setTimeout(() => {
      setShowIntro(false);
      localStorage.setItem("hasSeenIntro", "true");
    }, 18000);
  };

  const skipIntro = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setShowIntro(false);
    localStorage.setItem("hasSeenIntro", "true");
  };

  const handleFallbackToForm = (data?: PrefillData) => {
    setPrefillData(data);
    setInputMode("form");
  };

  const handleDemo = (profile: (typeof DEMO_PROFILES)[0]) => {
    navigate("/processing", {
      state: {
        formData: {
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          arm_span_cm: profile.arm_span_cm,
        },
      },
    });
  };

  // Render Cinematic Intro
  if (showIntro) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-forge-black">
        {/* Soft pulsing background glow */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--color-gold-core)_0%,_transparent_60%)] mix-blend-screen opacity-20 blur-[100px]"
        />

        {!introStarted ? (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            onClick={startIntro}
            className="group relative z-10 flex items-center gap-4 rounded-full border border-gold-core/30 bg-gold-core/5 px-10 py-5 text-sm tracking-[0.2em] uppercase text-gold-core backdrop-blur-md transition-all hover:bg-gold-core/20 hover:shadow-[0_0_30px_rgba(212,160,18,0.3)]"
          >
            Begin Experience
            <svg className="h-5 w-5 transition-transform duration-500 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        ) : (
          <>
            <div className="relative z-10 w-full max-w-5xl px-8 text-center">
              <AnimatePresence mode="wait">
                {introStep < MONOLOGUE.length && (
                  <motion.p
                    key={introStep}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="font-display text-4xl leading-tight text-white md:text-6xl lg:text-7xl drop-shadow-2xl"
                  >
                    {MONOLOGUE[introStep]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={skipIntro}
              className="absolute bottom-12 right-12 z-20 text-xs tracking-widest uppercase text-smoke transition hover:text-white"
            >
              Skip Intro
            </motion.button>
          </>
        )}
      </div>
    );
  }

  // Render Main Page
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="relative min-h-screen overflow-hidden bg-forge-black"
    >
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gold-core/20 mix-blend-screen blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-ember-glow/20 mix-blend-screen blur-[100px]"
        />
      </div>

      {/* Hero + Form Section */}
      <div className="relative z-10 w-full px-6 py-16 md:px-12 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">

          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:sticky lg:top-24"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex items-center gap-4"
            >
              <div className="h-px w-12 bg-gradient-to-r from-gold-core/0 to-gold-core/80" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-core drop-shadow-md">
                120 Years of Team USA
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-gold-core/0 to-gold-core/80" />
            </motion.div>

            {/* Title */}
            <h1 className="mb-6 font-display text-7xl text-white md:text-8xl xl:text-9xl drop-shadow-2xl">
              <span className="bg-gradient-to-br from-white via-platinum to-silver bg-clip-text text-transparent">FORGED</span>
            </h1>

            {/* Subtitle */}
            <p className="mb-6 font-display text-2xl italic text-silver md:text-3xl lg:text-4xl">
              See yourself in Olympic history
            </p>

            <p className="mb-10 w-full max-w-lg text-lg leading-relaxed text-smoke shadow-black drop-shadow-md">
              Every fan carries a body with history. Discover which Team USA
              athletes share your build — powered by Gemini.
            </p>

            {/* Demo Profiles - Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => setShowDemoOptions(!showDemoOptions)}
                className="group flex items-center gap-3 rounded-full bg-forge-steel/40 px-5 py-2.5 text-sm font-medium text-silver backdrop-blur-sm transition-all hover:bg-gold-core/20 hover:text-gold-core border border-white/5"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-gold-core/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Quick demo profiles
                <svg
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${showDemoOptions ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showDemoOptions && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mt-4 flex flex-wrap gap-3 overflow-hidden"
                  >
                    {DEMO_PROFILES.map((profile, i) => (
                      <motion.button
                        key={profile.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleDemo(profile)}
                        className="rounded-xl border border-white/10 bg-forge-steel/60 px-4 py-2.5 text-sm text-smoke backdrop-blur-md transition hover:border-gold-core/50 hover:bg-gold-core/10 hover:text-white hover:shadow-[0_0_15px_rgba(212,160,18,0.2)]"
                      >
                        {profile.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Input Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative"
          >
            {/* Soft backdrop glow behind form */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gold-core/10 via-transparent to-ember-glow/10 blur-[80px]" />
            
            <div className="rounded-3xl border border-white/5 bg-forge-charcoal/40 p-1 shadow-2xl backdrop-blur-xl">
              {/* Input Mode Selector */}
              <div className="mb-4">
                <InputModeSelector activeMode={inputMode} onModeChange={setInputMode} />
              </div>

              {/* Forms */}
              <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                  {inputMode === "photo" && (
                    <motion.div
                      key="photo"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PhotoInput onFallback={handleFallbackToForm} />
                    </motion.div>
                  )}
                  {inputMode === "voice" && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VoiceInput onFallback={handleFallbackToForm} />
                    </motion.div>
                  )}
                  {inputMode === "form" && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormInput prefillData={prefillData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Demo Profiles - Mobile */}
            <div className="mt-10 text-center lg:hidden">
              <button
                onClick={() => setShowDemoOptions(!showDemoOptions)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-forge-steel/50 px-6 py-3 text-sm text-silver backdrop-blur-sm transition hover:bg-gold-core/20 hover:text-gold-core"
              >
                Quick demo profiles
                <svg
                  className={`h-4 w-4 transition-transform duration-300 ${showDemoOptions ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showDemoOptions && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex flex-wrap justify-center gap-3 overflow-hidden"
                  >
                    {DEMO_PROFILES.map((profile) => (
                      <button
                        key={profile.name}
                        onClick={() => handleDemo(profile)}
                        className="rounded-xl border border-white/5 bg-forge-charcoal/80 px-4 py-2.5 text-sm text-smoke backdrop-blur-sm transition hover:border-gold-core/50 hover:bg-gold-core/10 hover:text-white"
                      >
                        {profile.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature CTAs */}
      <div className="relative z-10 mt-12 border-t border-white/5 bg-forge-charcoal/30 py-20 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 md:px-12 lg:gap-12 lg:px-20">
          {/* Paralympic Spotlight CTA */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-forge-black/50 p-8 transition-colors hover:border-amber-500/30 hover:bg-amber-950/20"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-[50px] transition-all group-hover:bg-amber-500/20" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-amber-500/60" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500">
                  Paralympic Spotlight
                </span>
              </div>
              <h2 className="mt-4 font-display text-3xl text-white transition-colors group-hover:text-amber-50">
                Explore by Classification
              </h2>
              <p className="mt-3 w-full text-base text-smoke">
                Most tools treat Paralympic athletes as a footnote. We built two ways in, putting adaptive sports at the forefront.
              </p>
              <Link
                to="/paralympic"
                className="mt-8 inline-flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 hover:text-amber-300"
              >
                Explore Paralympics
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Era Time Machine CTA */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-forge-black/50 p-8 transition-colors hover:border-gold-core/30 hover:bg-gold-core/10"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-core/10 blur-[50px] transition-all group-hover:bg-gold-core/20" />
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-gold-core/60" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-core">
                  Era Time Machine
                </span>
              </div>
              <h2 className="mt-4 font-display text-3xl text-white transition-colors group-hover:text-gold-white">
                120 Years of Evolution
              </h2>
              <p className="mt-3 w-full text-base text-smoke">
                See how archetypes have evolved from the Pioneer Era (pre-1950) to today's highly specialized competitors.
              </p>
              <Link
                to="/era"
                className="mt-8 inline-flex items-center gap-3 rounded-xl border border-gold-core/30 bg-gold-core/10 px-6 py-3 text-sm font-medium text-gold-core transition hover:bg-gold-core/20 hover:text-gold-bright"
              >
                Explore Timeline
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Archetype Carousel Section */}
      <div className="relative z-10 border-t border-white/5 bg-forge-black py-20">
        <ArchetypePreview />
      </div>
    </motion.div>
  );
}
