import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useArchetypeMatch } from "../hooks/useArchetypeMatch";

const ACTIVITY_OPTIONS = [
  "Strength",
  "Endurance",
  "Precision",
  "Speed",
  "Flexibility",
];

export default function InputForm() {
  const navigate = useNavigate();
  const { loading, error, submitMatch } = useArchetypeMatch();

  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [armSpanIn, setArmSpanIn] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [activities, setActivities] = useState<string[]>([]);

  function toggleActivity(a: string) {
    setActivities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const heightCm =
      (parseInt(heightFt) * 12 + parseInt(heightIn)) * 2.54;
    const weightKg = parseFloat(weightLbs) * 0.453592;
    const armSpanCm = armSpanIn ? parseFloat(armSpanIn) * 2.54 : undefined;

    const result = await submitMatch({
      height_cm: Math.round(heightCm * 10) / 10,
      weight_kg: Math.round(weightKg * 10) / 10,
      arm_span_cm: armSpanCm
        ? Math.round(armSpanCm * 10) / 10
        : undefined,
      age_range: ageRange || undefined,
      activity_preference: activities.length > 0 ? activities : undefined,
    });

    if (result) {
      navigate(`/results/${result.session_id}`);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-silver/10 bg-navy-light px-4 py-3 text-white placeholder-slate/50 outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20";

  return (
    <form onSubmit={handleSubmit} className="glass glow-gold rounded-2xl p-8">
      {/* Height */}
      <label className="mb-1 block font-heading text-sm font-medium text-silver">
        Height *
      </label>
      <div className="mb-5 flex gap-3">
        <input
          type="number"
          placeholder="ft"
          required
          min={3}
          max={8}
          value={heightFt}
          onChange={(e) => setHeightFt(e.target.value)}
          className={inputClass}
        />
        <input
          type="number"
          placeholder="in"
          required
          min={0}
          max={11}
          value={heightIn}
          onChange={(e) => setHeightIn(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Weight */}
      <label className="mb-1 block font-heading text-sm font-medium text-silver">
        Weight (lbs) *
      </label>
      <input
        type="number"
        placeholder="e.g. 175"
        required
        min={50}
        max={500}
        value={weightLbs}
        onChange={(e) => setWeightLbs(e.target.value)}
        className={`${inputClass} mb-5`}
      />

      {/* Arm Span (optional) */}
      <label className="mb-1 block font-heading text-sm font-medium text-slate">
        Arm Span (inches) — optional
      </label>
      <input
        type="number"
        placeholder="e.g. 72"
        value={armSpanIn}
        onChange={(e) => setArmSpanIn(e.target.value)}
        className={`${inputClass} mb-5`}
      />

      {/* Age Range (optional) */}
      <label className="mb-1 block font-heading text-sm font-medium text-slate">
        Age Range — optional
      </label>
      <select
        value={ageRange}
        onChange={(e) => setAgeRange(e.target.value)}
        className={`${inputClass} mb-5`}
      >
        <option value="">Select</option>
        <option value="under-18">Under 18</option>
        <option value="18-25">18–25</option>
        <option value="26-35">26–35</option>
        <option value="36-45">36–45</option>
        <option value="46+">46+</option>
      </select>

      {/* Activity Preference (optional) */}
      <label className="mb-2 block font-heading text-sm font-medium text-slate">
        Activity Preference — optional
      </label>
      <div className="mb-6 flex flex-wrap gap-2">
        {ACTIVITY_OPTIONS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => toggleActivity(a)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              activities.includes(a)
                ? "border-gold bg-gold/10 text-gold"
                : "border-silver/15 text-slate hover:border-silver/30"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-usa">{error}</p>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="gradient-gold w-full rounded-lg py-3.5 font-heading text-base font-semibold text-navy transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Find My Archetype"}
      </motion.button>
    </form>
  );
}
