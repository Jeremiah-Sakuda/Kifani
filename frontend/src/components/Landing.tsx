import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function Landing() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>();
  const [showDemoOptions, setShowDemoOptions] = useState(false);

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
    <div className="min-h-screen bg-forge-black">
      {/* Hero + Form Section */}
      <div className="w-full px-6 py-16 md:px-12 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-start lg:gap-20">

          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            {/* Badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-10 bg-gold-core/50" />
              <span className="font-mono text-xs uppercase tracking-widest text-gold-core">
                120 Years of Team USA
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-6 font-display text-6xl text-white md:text-7xl xl:text-8xl">
              FORGED
            </h1>

            {/* Subtitle */}
            <p className="mb-4 font-display text-xl italic text-silver md:text-2xl">
              See yourself in 120 years of Olympic & Paralympic history
            </p>

            <p className="mb-8 max-w-md text-base leading-relaxed text-smoke">
              Every fan carries a body with history. Discover which Team USA
              athletes share your build — powered by Gemini.
            </p>

            {/* Demo Profiles - Desktop */}
            <div className="hidden lg:block">
              <button
                onClick={() => setShowDemoOptions(!showDemoOptions)}
                className="flex items-center gap-2 text-sm text-ash transition hover:text-gold-core"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Quick demo profiles
                <svg
                  className={`h-3 w-3 transition-transform ${showDemoOptions ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDemoOptions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {DEMO_PROFILES.map((profile) => (
                    <button
                      key={profile.name}
                      onClick={() => handleDemo(profile)}
                      className="rounded-lg bg-forge-steel px-3 py-2 text-sm text-smoke transition hover:bg-forge-iron hover:text-white"
                    >
                      {profile.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Input Mode Selector */}
            <div className="mb-6">
              <InputModeSelector activeMode={inputMode} onModeChange={setInputMode} />
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {inputMode === "photo" && (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <PhotoInput onFallback={handleFallbackToForm} />
                </motion.div>
              )}
              {inputMode === "voice" && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VoiceInput onFallback={handleFallbackToForm} />
                </motion.div>
              )}
              {inputMode === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FormInput prefillData={prefillData} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo Profiles - Mobile */}
            <div className="mt-8 text-center lg:hidden">
              <button
                onClick={() => setShowDemoOptions(!showDemoOptions)}
                className="inline-flex items-center gap-2 text-sm text-ash transition hover:text-gold-core"
              >
                Quick demo profiles
                <svg
                  className={`h-3 w-3 transition-transform ${showDemoOptions ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDemoOptions && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {DEMO_PROFILES.map((profile) => (
                    <button
                      key={profile.name}
                      onClick={() => handleDemo(profile)}
                      className="rounded-lg bg-forge-steel px-3 py-2 text-sm text-smoke transition hover:bg-forge-iron hover:text-white"
                    >
                      {profile.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Archetype Carousel Section */}
      <div className="border-t border-forge-graphite/30 py-16">
        <ArchetypePreview />
      </div>
    </div>
  );
}
