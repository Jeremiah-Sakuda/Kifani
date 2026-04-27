import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzePhoto, type PhotoAnalysisResult } from "../services/api";

interface Props {
  onFallback: (prefillData?: PrefillData) => void;
}

export interface PrefillData {
  height_cm?: number;
  weight_kg?: number;
  arm_span_cm?: number;
  activity_preferences?: string[];
}

export default function PhotoInput({ onFallback }: Props) {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!preview) return;

    setAnalyzing(true);
    setError(null);

    try {
      const analysisResult = await analyzePhoto(preview);
      setResult(analysisResult);

      if (!analysisResult.success) {
        setError(analysisResult.error || "Could not analyze photo");
        return;
      }

      // If confidence is high enough and we have both height and weight, go directly to processing
      const estimates = analysisResult.estimates;
      if (
        analysisResult.confidence &&
        analysisResult.confidence >= 0.7 &&
        estimates?.height_cm &&
        estimates?.weight_kg &&
        !analysisResult.requires_confirmation
      ) {
        // High confidence - go directly to processing
        const formData = {
          height_cm: estimates.height_cm,
          weight_kg: estimates.weight_kg,
          arm_span_cm: estimates.arm_span_ratio
            ? estimates.height_cm * estimates.arm_span_ratio
            : undefined,
        };
        navigate("/processing", { state: { formData } });
      }
      // Otherwise, show results and let user confirm or edit
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze photo"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (!result?.estimates) return;

    const estimates = result.estimates;
    const formData = {
      height_cm: estimates.height_cm || undefined,
      weight_kg: estimates.weight_kg || undefined,
      arm_span_cm: estimates.arm_span_ratio && estimates.height_cm
        ? estimates.height_cm * estimates.arm_span_ratio
        : undefined,
    };

    navigate("/processing", { state: { formData } });
  };

  const handleEdit = () => {
    if (!result?.estimates) {
      onFallback();
      return;
    }

    const estimates = result.estimates;
    onFallback({
      height_cm: estimates.height_cm || undefined,
      weight_kg: estimates.weight_kg || undefined,
      arm_span_cm: estimates.arm_span_ratio && estimates.height_cm
        ? estimates.height_cm * estimates.arm_span_ratio
        : undefined,
    });
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="card-forge rounded-2xl p-8">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-display text-xl text-white">Photo Analysis</h2>
        <p className="text-sm text-smoke">
          Upload a full-body photo for AI-powered proportion analysis
        </p>
      </div>

      {!preview ? (
        <div
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
            dragActive
              ? "border-gold-core bg-gold-core/5"
              : "border-forge-graphite hover:border-gold-core/50 hover:bg-forge-steel/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="hidden"
          />

          <motion.div
            animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className={`mb-4 rounded-full p-4 ${dragActive ? "bg-gold-core/20" : "bg-forge-steel"}`}>
              <svg
                className={`h-8 w-8 ${dragActive ? "text-gold-bright" : "text-smoke"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>

            <p className="mb-2 font-body text-white">
              {dragActive ? "Drop your photo here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-ash">Full-body photo recommended for best results</p>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-[3/4] max-h-[400px] overflow-hidden rounded-xl bg-forge-steel">
            <img src={preview} alt="Preview" className="h-full w-full object-contain" />

            {/* Scanning overlay when analyzing */}
            {analyzing && (
              <div className="absolute inset-0 flex items-center justify-center bg-forge-black/60">
                <div className="text-center">
                  <motion.div
                    className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-gold-core/30"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="font-mono text-sm text-gold-core">Analyzing proportions...</p>
                </div>
              </div>
            )}

            {/* Clear button */}
            {!analyzing && (
              <button
                onClick={clearPreview}
                className="absolute right-3 top-3 rounded-full bg-forge-black/70 p-2 text-white transition hover:bg-forge-black"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {result?.success && result.estimates && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Confidence indicator */}
                <div className="flex items-center justify-between rounded-lg bg-forge-steel/50 px-4 py-3">
                  <span className="text-sm text-smoke">Analysis Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-forge-graphite">
                      <motion.div
                        className={`h-full rounded-full ${
                          (result.confidence || 0) >= 0.7
                            ? "bg-para-green"
                            : (result.confidence || 0) >= 0.5
                            ? "bg-gold-core"
                            : "bg-ember-glow"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm text-gold-core">
                      {Math.round((result.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Estimated measurements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <p className="text-xs text-ash">Estimated Height</p>
                    <p className="font-mono text-lg text-white">
                      {result.estimates.height_cm
                        ? `${Math.round(result.estimates.height_cm)} cm`
                        : "—"}
                    </p>
                    {result.estimates.height_range_cm && (
                      <p className="text-xs text-smoke">
                        Range: {result.estimates.height_range_cm[0]}-{result.estimates.height_range_cm[1]} cm
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <p className="text-xs text-ash">Estimated Weight</p>
                    <p className="font-mono text-lg text-white">
                      {result.estimates.weight_kg
                        ? `${Math.round(result.estimates.weight_kg)} kg`
                        : "—"}
                    </p>
                    {result.estimates.weight_range_kg && (
                      <p className="text-xs text-smoke">
                        Range: {result.estimates.weight_range_kg[0]}-{result.estimates.weight_range_kg[1]} kg
                      </p>
                    )}
                  </div>
                </div>

                {/* Build type */}
                {result.estimates.build_type && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold">{result.estimates.build_type}</span>
                    {result.estimates.arm_span_ratio && (
                      <span className="text-xs text-smoke">
                        Arm span ratio: {result.estimates.arm_span_ratio.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}

                {/* Observations */}
                {result.observations && result.observations.length > 0 && (
                  <div className="rounded-lg bg-forge-steel/30 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">
                      Observations
                    </p>
                    <ul className="space-y-1 text-sm text-silver">
                      {result.observations.map((obs, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gold-core">•</span>
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary flex-1"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Use These Estimates
                  </motion.button>
                  <motion.button
                    onClick={handleEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn bg-forge-steel text-smoke hover:bg-forge-iron hover:text-white"
                  >
                    Edit
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-ember-glow/10 px-4 py-3 text-center text-sm text-ember-bright"
            >
              {error}
            </motion.p>
          )}

          {/* Analyze button (before analysis) */}
          {!analyzing && !result && !error && (
            <motion.button
              onClick={handleAnalyze}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary w-full"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Analyze Photo
            </motion.button>
          )}
        </div>
      )}

      {/* Alternative */}
      <div className="mt-6 text-center">
        <button onClick={() => onFallback()} className="text-sm text-smoke transition hover:text-gold-core">
          Skip to manual entry →
        </button>
      </div>
    </div>
  );
}
