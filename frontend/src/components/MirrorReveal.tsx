import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePortrait } from "../services/api";

interface Props {
  archetype: string;
  sessionId: string;
  onReveal: () => void;
}

// Archetype-specific gradient themes
const ARCHETYPE_THEMES: Record<string, { from: string; via: string; to: string }> = {
  Powerhouse: { from: "#8b0000", via: "#dc143c", to: "#ff6347" },
  "Aerobic Engine": { from: "#006400", via: "#228b22", to: "#90ee90" },
  "Precision Athlete": { from: "#191970", via: "#4169e1", to: "#87ceeb" },
  "Explosive Mover": { from: "#ff8c00", via: "#ffa500", to: "#ffd700" },
  "Coordinated Specialist": { from: "#8b008b", via: "#da70d6", to: "#dda0dd" },
  "Tactical Endurance": { from: "#2f4f4f", via: "#708090", to: "#c0c0c0" },
  "Adaptive Power": { from: "#8b4513", via: "#cd853f", to: "#deb887" },
  "Adaptive Endurance": { from: "#008080", via: "#20b2aa", to: "#40e0d0" },
};

export default function MirrorReveal({ archetype, sessionId, onReveal }: Props) {
  const [state, setState] = useState<"loading" | "ready" | "revealed" | "error">("loading");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = ARCHETYPE_THEMES[archetype] || ARCHETYPE_THEMES.Powerhouse;

  useEffect(() => {
    let cancelled = false;

    async function loadPortrait() {
      try {
        const result = await generatePortrait(archetype, sessionId);

        if (cancelled) return;

        if (result.success && result.image_data) {
          setImageUrl(result.image_data);
          setIsPlaceholder(result.is_placeholder || false);
          setState("ready");
        } else {
          setError(result.error || "Failed to generate portrait");
          setState("error");
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load portrait");
        setState("error");
      }
    }

    loadPortrait();

    return () => {
      cancelled = true;
    };
  }, [archetype, sessionId]);

  const handleReveal = () => {
    setState("revealed");
    setTimeout(onReveal, 500);
  };

  const handleRetry = () => {
    setState("loading");
    setError(null);
    // Re-trigger the effect by updating a dependency would require more state
    // For simplicity, just reload
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-forge-graphite" />
        <h2 className="font-mono text-xs uppercase tracking-wider text-ash">
          Your Imagen Mirror
        </h2>
        <div className="h-px flex-1 bg-forge-graphite" />
      </div>

      {/* Mirror Container */}
      <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl">
        {/* Frame */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold-core/20 bg-forge-charcoal">
          {/* Curtain / Loading State */}
          <AnimatePresence>
            {state !== "revealed" && (
              <motion.div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
                }}
                exit={{
                  clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                  transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                {/* Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10 text-center">
                  {state === "loading" && (
                    <>
                      <motion.div
                        className="mx-auto mb-6 h-20 w-20 rounded-full border-2 border-white/30"
                        animate={{
                          scale: [1, 1.1, 1],
                          borderColor: ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.6)", "rgba(255,255,255,0.3)"],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="font-display text-lg text-white/90">
                        Generating your portrait...
                      </p>
                      <p className="mt-2 text-sm text-white/60">
                        Powered by Imagen
                      </p>
                    </>
                  )}

                  {state === "ready" && (
                    <>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6"
                      >
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                          </svg>
                        </div>
                      </motion.div>
                      <p className="mb-6 font-display text-xl text-white">
                        Your mirror is ready
                      </p>
                      <motion.button
                        onClick={handleReveal}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full bg-white px-8 py-3 font-body font-semibold text-forge-black transition hover:bg-gold-bright"
                      >
                        Reveal Portrait
                      </motion.button>
                    </>
                  )}

                  {state === "error" && (
                    <>
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <svg className="h-10 w-10 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      </div>
                      <p className="mb-2 font-display text-lg text-white/90">
                        Generation unavailable
                      </p>
                      <p className="mb-6 text-sm text-white/60">
                        {error}
                      </p>
                      <motion.button
                        onClick={handleRetry}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full bg-white/20 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/30"
                      >
                        Try Again
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actual Portrait */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(180deg, ${theme.from}33 0%, ${theme.via}22 50%, ${theme.to}11 100%)`,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${archetype} archetype portrait`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-center">
                {/* Fallback abstract visualization */}
                <motion.div
                  className="relative mx-auto mb-6 h-40 w-40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                  {/* Orbital rings */}
                  {[100, 120, 140].map((size, i) => (
                    <motion.div
                      key={size}
                      className="absolute left-1/2 top-1/2 rounded-full border border-gold-core/30"
                      style={{
                        width: size,
                        height: size,
                        marginLeft: -size / 2,
                        marginTop: -size / 2,
                      }}
                      animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                      transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                    />
                  ))}

                  {/* Center glow */}
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-core/40 blur-xl" />
                  <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright" />
                </motion.div>

                <p className="font-display text-2xl text-white">{archetype}</p>
                <p className="mt-2 text-sm text-smoke">
                  Abstract archetype visualization
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute -left-1 -top-1 h-6 w-6 border-l-2 border-t-2 border-gold-core/40" />
        <div className="absolute -right-1 -top-1 h-6 w-6 border-r-2 border-t-2 border-gold-core/40" />
        <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-gold-core/40" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-gold-core/40" />
      </div>

      {/* Caption */}
      <p className="mt-6 text-center text-sm text-ash">
        A stylized representation of your athletic archetype.
        <br />
        <span className="text-smoke">
          {isPlaceholder ? "Placeholder visualization" : "Non-photorealistic, powered by Imagen."}
        </span>
      </p>
    </div>
  );
}
