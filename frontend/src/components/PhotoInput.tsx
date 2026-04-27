import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  onFallback: () => void;
}

export default function PhotoInput({ onFallback }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
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
      // TODO: Call photo extraction API
      // For now, simulate and fall back to form
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulating low confidence for demo - fall back to form
      setError("Could not extract measurements with high confidence. Please use the form instead.");
      setTimeout(() => {
        onFallback();
      }, 1500);
    } catch {
      setError("Failed to analyze photo. Please try again or use the form.");
    } finally {
      setAnalyzing(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
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
            <p className="text-xs text-ash">Full-body photo recommended</p>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-forge-steel">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />

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

          {/* Actions */}
          {!analyzing && !error && (
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
        <button onClick={onFallback} className="text-sm text-smoke transition hover:text-gold-core">
          Skip to manual entry →
        </button>
      </div>
    </div>
  );
}
