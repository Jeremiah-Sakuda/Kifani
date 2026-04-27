import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeVoice, type VoiceAnalysisResult } from "../services/api";
import type { PrefillData } from "./PhotoInput";

interface Props {
  onFallback: (prefillData?: PrefillData) => void;
}

export default function VoiceInput({ onFallback }: Props) {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const MAX_RECORDING_TIME = 30;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setResult(null);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const handleProcess = async () => {
    if (!audioBlob) return;

    setProcessing(true);
    setError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Data = await base64Promise;

      const analysisResult = await analyzeVoice(base64Data, audioBlob.type);
      setResult(analysisResult);

      if (!analysisResult.success) {
        setError(analysisResult.error || "Could not process audio");
        return;
      }

      // If confidence is high and we have all required data, go directly to processing
      const extracted = analysisResult.extracted;
      if (
        analysisResult.confidence &&
        analysisResult.confidence >= 0.7 &&
        extracted?.height_cm &&
        extracted?.weight_kg &&
        !analysisResult.requires_confirmation
      ) {
        const formData = {
          height_cm: extracted.height_cm,
          weight_kg: extracted.weight_kg,
          arm_span_cm: extracted.arm_span_cm || undefined,
          activity_preference: extracted.activity_preferences || undefined,
        };
        navigate("/processing", { state: { formData } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process audio");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!result?.extracted) return;

    const extracted = result.extracted;
    const formData = {
      height_cm: extracted.height_cm || undefined,
      weight_kg: extracted.weight_kg || undefined,
      arm_span_cm: extracted.arm_span_cm || undefined,
      activity_preference: extracted.activity_preferences || undefined,
    };

    navigate("/processing", { state: { formData } });
  };

  const handleEdit = () => {
    if (!result?.extracted) {
      onFallback();
      return;
    }

    const extracted = result.extracted;
    onFallback({
      height_cm: extracted.height_cm || undefined,
      weight_kg: extracted.weight_kg || undefined,
      arm_span_cm: extracted.arm_span_cm || undefined,
      activity_preferences: extracted.activity_preferences || undefined,
    });
  };

  const reset = () => {
    setAudioBlob(null);
    setResult(null);
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card-forge rounded-2xl p-8">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-display text-xl text-white">Voice Description</h2>
        <p className="text-sm text-smoke">
          Describe your physical traits in 30 seconds or less
        </p>
      </div>

      {!audioBlob ? (
        <div className="space-y-6">
          {/* Recording visualization */}
          <div className="flex flex-col items-center py-8">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-ember-glow shadow-ember"
                  : "bg-forge-steel hover:bg-forge-iron"
              }`}
            >
              {/* Pulse rings when recording */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-ember-glow"
                    animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-ember-glow"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}

              {isRecording ? (
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-smoke" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              )}
            </motion.button>

            {/* Timer / instruction */}
            {isRecording ? (
              <div className="text-center">
                <p className="font-mono text-2xl text-ember-bright">{formatTime(recordingTime)}</p>
                <p className="mt-1 text-sm text-smoke">
                  {MAX_RECORDING_TIME - recordingTime}s remaining
                </p>
              </div>
            ) : (
              <p className="text-center text-smoke">
                Tap to start recording
              </p>
            )}
          </div>

          {/* Prompts */}
          <div className="rounded-xl bg-forge-steel/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">
              Example prompts
            </p>
            <ul className="space-y-1 text-sm text-silver">
              <li>"I'm 6 foot 2, about 190 pounds..."</li>
              <li>"I've always been lean and tall for my height..."</li>
              <li>"My arm span is slightly longer than my height..."</li>
            </ul>
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Audio recorded confirmation */}
          <div className="flex items-center justify-between rounded-xl bg-forge-steel p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-core/20">
                <svg className="h-5 w-5 text-gold-core" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-white">Recording complete</p>
                <p className="text-sm text-smoke">{formatTime(recordingTime)} recorded</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-sm text-smoke transition hover:text-white"
            >
              Re-record
            </button>
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {result?.success && result.extracted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Transcript */}
                {result.transcript && (
                  <div className="rounded-xl bg-forge-steel/50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">
                      Transcript
                    </p>
                    <p className="text-sm italic text-silver">"{result.transcript}"</p>
                  </div>
                )}

                {/* Confidence indicator */}
                <div className="flex items-center justify-between rounded-lg bg-forge-steel/50 px-4 py-3">
                  <span className="text-sm text-smoke">Extraction Confidence</span>
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

                {/* Extracted measurements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <p className="text-xs text-ash">Height</p>
                    <p className="font-mono text-lg text-white">
                      {result.extracted.height_cm
                        ? `${Math.round(result.extracted.height_cm)} cm`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-forge-steel/50 p-3">
                    <p className="text-xs text-ash">Weight</p>
                    <p className="font-mono text-lg text-white">
                      {result.extracted.weight_kg
                        ? `${Math.round(result.extracted.weight_kg)} kg`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Activity preferences */}
                {result.extracted.activity_preferences && result.extracted.activity_preferences.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.extracted.activity_preferences.map((activity, i) => (
                      <span key={i} className="badge badge-gold">
                        {activity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Missing or clarification needed */}
                {(result.missing_required?.length || result.clarification_needed?.length) && (
                  <div className="rounded-lg bg-ember-glow/10 p-3">
                    {result.missing_required && result.missing_required.length > 0 && (
                      <p className="text-sm text-ember-bright">
                        Missing: {result.missing_required.join(", ")}
                      </p>
                    )}
                    {result.clarification_needed && result.clarification_needed.length > 0 && (
                      <p className="text-sm text-smoke">
                        Needs clarification: {result.clarification_needed.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleConfirm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!result.extracted.height_cm || !result.extracted.weight_kg}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Use These Values
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

          {/* Process button (before analysis) */}
          {!processing && !result && !error && (
            <motion.button
              onClick={handleProcess}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary w-full"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
              Process with Gemini
            </motion.button>
          )}

          {processing && (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="text-sm text-smoke">Analyzing voice...</span>
            </div>
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
