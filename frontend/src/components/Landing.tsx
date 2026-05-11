import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";
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

// --- Subcomponents for Scrollytelling ---

const Word = ({ word, progress, start, end, fadeOutStart, fadeOutEnd }: { word: string; progress: MotionValue<number>; start: number; end: number; fadeOutStart: number; fadeOutEnd: number }) => {
  const opacity = useTransform(progress, [start, end, fadeOutStart, fadeOutEnd], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, end, fadeOutStart, fadeOutEnd], [20, 0, 0, -20]);

  return (
    <motion.span style={{ opacity, y, display: "inline-block", marginRight: "0.25em" }}>
      {word}
    </motion.span>
  );
};

const WordReveal = ({ text, progress, range }: { text: string; progress: MotionValue<number>; range: [number, number] }) => {
  const words = text.split(" ");
  const step = (range[1] - range[0]) / words.length;

  return (
    <span className="inline-block pointer-events-none">
      {words.map((word, i) => {
        const start = range[0] + i * step;
        const end = start + step;
        const fadeOutStart = range[1] - 0.05;

        return (
          <Word 
            key={i} 
            word={word} 
            progress={progress} 
            start={start} 
            end={end} 
            fadeOutStart={fadeOutStart} 
            fadeOutEnd={range[1]} 
          />
        );
      })}
    </span>
  );
};

const Ember = ({ progress, top, left, xRange }: { progress: MotionValue<number>; top: string; left: string; xRange: number }) => {
  const x = useTransform(progress, [0.7, 1], [0, xRange]);
  const opacity = useTransform(progress, [0.7, 0.8, 1], [0, 1, 0]);
  
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-gold-core"
      style={{
        top,
        left,
        x,
        opacity,
        boxShadow: "0 0 10px var(--color-gold-core)"
      }}
    />
  );
};

const CinematicBackground = ({ progress }: { progress: MotionValue<number> }) => {
  // 1. Rings
  const ringsOpacity = useTransform(progress, [0, 0.15, 0.25], [0, 1, 0]);
  const ringsScale = useTransform(progress, [0, 0.25], [0.8, 1.2]);
  
  // 2. Particles
  const particlesOpacity = useTransform(progress, [0.2, 0.35, 0.5], [0, 1, 0]);
  const particlesY = useTransform(progress, [0.2, 0.5], [100, -100]);

  // 3. Silhouette
  const silhouetteOpacity = useTransform(progress, [0.45, 0.6, 0.75], [0, 1, 0]);
  const silhouetteScale = useTransform(progress, [0.45, 0.75], [0.9, 1.1]);

  // 4. Shatter / Embers
  const shatterOpacity = useTransform(progress, [0.7, 0.85, 1], [0, 1, 0]);
  const shatterY = useTransform(progress, [0.7, 1], [0, -300]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* 1. Rings */}
      <motion.div style={{ opacity: ringsOpacity, scale: ringsScale }} className="absolute flex items-center justify-center">
        <div className="w-[60vh] h-[60vh] rounded-full border border-gold-core/20 absolute -translate-x-1/4 -translate-y-1/4" />
        <div className="w-[60vh] h-[60vh] rounded-full border border-white/10 absolute translate-x-1/4 translate-y-1/4" />
        <div className="w-[60vh] h-[60vh] rounded-full border border-ember-glow/20 absolute -translate-x-1/4 translate-y-1/4" />
      </motion.div>

      {/* 2. Particles */}
      <motion.div style={{ opacity: particlesOpacity, y: particlesY }} className="absolute inset-0">
        <div className="absolute top-[30%] left-[20%] w-2 h-2 rounded-full bg-white shadow-[0_0_15px_#fff]" />
        <div className="absolute top-[60%] left-[80%] w-3 h-3 rounded-full bg-gold-core shadow-[0_0_20px_var(--color-gold-core)]" />
        <div className="absolute top-[20%] left-[70%] w-1 h-1 rounded-full bg-ember-glow shadow-[0_0_10px_var(--color-ember-glow)]" />
        <div className="absolute top-[70%] left-[30%] w-4 h-4 rounded-full bg-white/50 blur-[2px]" />
        <div className="absolute top-[40%] left-[50%] w-2 h-2 rounded-full bg-gold-core/80" />
      </motion.div>

      {/* 3. Silhouette */}
      <motion.div style={{ opacity: silhouetteOpacity, scale: silhouetteScale }} className="absolute">
        <svg viewBox="0 0 100 200" className="w-[40vh] h-[80vh] fill-white/5 blur-[20px]">
           <path d="M30,50 Q50,20 70,50 T70,120 Q50,150 30,120 Z" />
        </svg>
      </motion.div>

      {/* 4. Shatter Embers */}
      <motion.div style={{ opacity: shatterOpacity, y: shatterY }} className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <Ember 
            key={i} 
            progress={progress} 
            top={`${50 + (Math.random() * 40 - 20)}%`} 
            left={`${50 + (Math.random() * 40 - 20)}%`} 
            xRange={(Math.random() - 0.5) * 500} 
          />
        ))}
      </motion.div>
    </div>
  );
};

function ScrollytellingIntro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  // Audio Logic
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Placeholder audio element. 
    // Requires 'ambient.mp3' in public directory for actual sound.
    audioRef.current = new Audio("/ambient.mp3");
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(() => setIsMuted(true));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isMuted]);

  useEffect(() => {
    return scrollYProgress.onChange((v) => {
      if (audioRef.current && !isMuted) {
        // Volume swells in the middle, fades out at ends
        const vol = v < 0.5 ? v * 2 : (1 - v) * 2;
        audioRef.current.volume = Math.max(0, Math.min(1, vol));
      }
    });
  }, [scrollYProgress, isMuted]);

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-forge-black">
      <motion.div 
        style={{ opacity: bgOpacity }} 
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
      >
        <CinematicBackground progress={scrollYProgress} />

        {/* Vertical Progress Indicator */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 h-64 w-[2px] bg-white/10 z-20 rounded-full overflow-hidden">
          <motion.div 
            className="w-full bg-gold-core shadow-[0_0_10px_var(--color-gold-core)] origin-top"
            style={{ scaleY: scrollYProgress, height: "100%" }}
          />
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-8 right-12 z-20 flex items-center gap-2 text-xs uppercase tracking-widest text-smoke transition hover:text-white"
        >
          {isMuted ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-gold-core" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          {isMuted ? "Sound Off" : "Sound On"}
        </button>

        {/* Text Sequence */}
        <div className="relative z-10 flex h-full w-full max-w-5xl items-center justify-center px-16 text-center pointer-events-none">
          <motion.div className="absolute font-display text-4xl leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            <WordReveal text={MONOLOGUE[0]} progress={scrollYProgress} range={[0, 0.25]} />
          </motion.div>
          <motion.div className="absolute font-display text-4xl leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            <WordReveal text={MONOLOGUE[1]} progress={scrollYProgress} range={[0.25, 0.5]} />
          </motion.div>
          <motion.div className="absolute font-display text-4xl leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            <WordReveal text={MONOLOGUE[2]} progress={scrollYProgress} range={[0.5, 0.75]} />
          </motion.div>
          <motion.div className="absolute font-display text-4xl leading-tight text-white drop-shadow-2xl md:text-6xl lg:text-7xl">
            <WordReveal text={MONOLOGUE[3]} progress={scrollYProgress} range={[0.75, 1]} />
          </motion.div>
        </div>

        <a
          href="#app"
          className="absolute bottom-12 right-12 z-20 text-xs tracking-widest uppercase text-smoke transition hover:text-white"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("app")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Skip Intro
        </a>
      </motion.div>
    </div>
  );
}

// --- Main App Component ---

export default function Landing() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>();
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // App Reveal Parallax
  const appRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: appScrollProgress } = useScroll({
    target: appRef,
    offset: ["start end", "start start"],
  });
  const appY = useTransform(appScrollProgress, [0, 1], [150, 0]);

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

  return (
    <div className="bg-forge-black">
      {/* Intro Sequence (Skipped if user prefers reduced motion) */}
      {!prefersReducedMotion && <ScrollytellingIntro />}

      {/* Main App Section */}
      <motion.div 
        id="app" 
        ref={appRef}
        style={{ y: prefersReducedMotion ? 0 : appY }}
        className="relative min-h-screen overflow-hidden bg-forge-black"
      >
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gold-core/20 mix-blend-screen blur-[120px]"
          />
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-ember-glow/20 mix-blend-screen blur-[100px]"
          />
        </div>

        {/* Hero + Form Section */}
        <div className="relative z-10 w-full px-6 py-16 md:px-12 lg:px-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
            {/* Left: Hero Content */}
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="lg:sticky lg:top-24"
            >
              {/* Badge */}
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
              <h1 className="mb-6 font-display text-7xl text-white drop-shadow-2xl md:text-8xl xl:text-9xl">
                <span className="bg-gradient-to-br from-white via-platinum to-silver bg-clip-text text-transparent">
                  FORGED
                </span>
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
                  className="group flex items-center gap-3 rounded-full border border-white/5 bg-forge-steel/40 px-5 py-2.5 text-sm font-medium text-silver backdrop-blur-sm transition-all hover:bg-gold-core/20 hover:text-gold-core"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 group-hover:bg-gold-core/20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Quick demo profiles
                  <svg
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${
                      showDemoOptions ? "rotate-180" : ""
                    }`}
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
              initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
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
                    className={`h-4 w-4 transition-transform duration-300 ${
                      showDemoOptions ? "rotate-180" : ""
                    }`}
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
              whileHover={prefersReducedMotion ? {} : { y: -5 }}
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
                  Most tools treat Paralympic athletes as a footnote. We built two ways in, putting adaptive sports at the
                  forefront.
                </p>
                <Link
                  to="/paralympic"
                  className="mt-8 inline-flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20 hover:text-amber-300"
                >
                  Explore Paralympics
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>

            {/* Era Time Machine CTA */}
            <motion.div
              whileHover={prefersReducedMotion ? {} : { y: -5 }}
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
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
    </div>
  );
}
