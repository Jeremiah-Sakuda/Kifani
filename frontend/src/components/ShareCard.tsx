import { useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";

interface ShareCardProps {
  archetype: string;
  confidence: number;
  sessionId: string;
  portraitUrl?: string;  // Imagen-generated portrait
  sports?: string[];     // "Could align with" sports
  isParalympicFirst?: boolean;
}

export default function ShareCard({
  archetype,
  confidence,
  sessionId,
  portraitUrl,
  sports = [],
  isParalympicFirst = false,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/results/${sessionId}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#0D0D0F",
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `forged-${archetype.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.75) return "Strong Match";
    if (conf >= 0.55) return "Good Match";
    if (conf >= 0.35) return "Moderate Match";
    return "Exploratory Match";
  };

  return (
    <div className="space-y-4">
      {/* The shareable card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forge-obsidian via-forge-charcoal to-forge-obsidian p-6"
        style={{ width: "400px" }}
      >
        {/* Background decorations */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gold-core/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-ember-glow/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-lg tracking-[0.3em] text-gradient-gold">
              FORGED
            </span>
            {isParalympicFirst && (
              <span className="rounded-full bg-para-green/20 px-2 py-0.5 text-xs text-para-green">
                Paralympic-First
              </span>
            )}
          </div>

          {/* Portrait + Archetype */}
          <div className="mb-4 flex gap-4">
            {/* Portrait or placeholder */}
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-forge-steel/50">
              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={`${archetype} archetype portrait`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-3xl">🏛️</span>
                </div>
              )}
            </div>

            {/* Archetype info */}
            <div className="flex flex-col justify-center">
              <p className="mb-1 text-xs text-smoke">My archetype is</p>
              <h2 className="mb-1 font-display text-2xl text-gradient-gold">
                {archetype}
              </h2>
              <p className="text-sm text-silver">
                {getConfidenceLabel(confidence)} • {Math.round(confidence * 100)}%
              </p>
            </div>
          </div>

          {/* Sports alignment */}
          {sports.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs text-ash">Could align with:</p>
              <div className="flex flex-wrap gap-1.5">
                {sports.slice(0, 4).map((sport, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-forge-steel/60 px-2.5 py-1 text-xs text-silver"
                  >
                    {sport}
                  </span>
                ))}
                {sports.length > 4 && (
                  <span className="rounded-full bg-forge-steel/40 px-2.5 py-1 text-xs text-ash">
                    +{sports.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mb-3 h-px bg-gradient-to-r from-transparent via-gold-core/30 to-transparent" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-ash">
              120 years of Team USA excellence
            </p>
            <span className="font-mono text-xs text-gold-core/60">LA28</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-core px-4 py-3 font-medium text-forge-obsidian transition hover:bg-gold-bright disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Card
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-forge-graphite bg-forge-steel/50 px-4 py-3 font-medium text-white transition hover:border-gold-core/50 hover:bg-forge-steel"
        >
          {copied ? (
            <>
              <svg className="h-5 w-5 text-para-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
