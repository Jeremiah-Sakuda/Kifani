import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ACTIVITY_OPTIONS = [
  { id: "strength", label: "Strength", icon: "💪" },
  { id: "endurance", label: "Endurance", icon: "🏃" },
  { id: "precision", label: "Precision", icon: "🎯" },
  { id: "speed", label: "Speed", icon: "⚡" },
  { id: "flexibility", label: "Flexibility", icon: "🧘" },
];

const AGE_RANGES = [
  { value: "", label: "Select age range" },
  { value: "under-18", label: "Under 18" },
  { value: "18-25", label: "18-25" },
  { value: "26-35", label: "26-35" },
  { value: "36-45", label: "36-45" },
  { value: "46+", label: "46+" },
];

export default function FormInput() {
  const navigate = useNavigate();

  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [armSpanIn, setArmSpanIn] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [activities, setActivities] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggleActivity(id: string) {
    setActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate inputs
    const ft = parseInt(heightFt);
    const inches = parseInt(heightIn);
    const lbs = parseFloat(weightLbs);

    if (isNaN(ft) || isNaN(inches) || isNaN(lbs)) {
      setError("Please enter valid height and weight values");
      return;
    }

    const heightCm = (ft * 12 + inches) * 2.54;
    const weightKg = lbs * 0.453592;
    const armSpanCm = armSpanIn ? parseFloat(armSpanIn) * 2.54 : undefined;

    const formData = {
      height_cm: Math.round(heightCm * 10) / 10,
      weight_kg: Math.round(weightKg * 10) / 10,
      arm_span_cm: armSpanCm ? Math.round(armSpanCm * 10) / 10 : undefined,
      age_range: ageRange || undefined,
      activity_preference: activities.length > 0 ? activities : undefined,
    };

    // Navigate to processing with form data in state
    navigate("/processing", { state: { formData } });
  }

  return (
    <form onSubmit={handleSubmit} className="card-forge rounded-2xl p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 font-display text-xl text-white">Physical Traits</h2>
        <p className="text-sm text-smoke">Enter your measurements for archetype matching</p>
      </div>

      {/* Height */}
      <div className="mb-6">
        <label className="label">
          Height <span className="text-ember-bright">*</span>
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="5"
              required
              min={3}
              max={8}
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ash">ft</span>
          </div>
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="10"
              required
              min={0}
              max={11}
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              className="input pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ash">in</span>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="mb-6">
        <label className="label">
          Weight <span className="text-ember-bright">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            placeholder="175"
            required
            min={50}
            max={500}
            value={weightLbs}
            onChange={(e) => setWeightLbs(e.target.value)}
            className="input pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ash">lbs</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-forge-graphite" />
        <span className="text-xs uppercase tracking-wider text-ash">Optional</span>
        <div className="h-px flex-1 bg-forge-graphite" />
      </div>

      {/* Arm Span */}
      <div className="mb-6">
        <label className="label">Arm Span</label>
        <div className="relative">
          <input
            type="number"
            placeholder="72"
            value={armSpanIn}
            onChange={(e) => setArmSpanIn(e.target.value)}
            className="input pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ash">in</span>
        </div>
      </div>

      {/* Age Range */}
      <div className="mb-6">
        <label className="label">Age Range</label>
        <select
          value={ageRange}
          onChange={(e) => setAgeRange(e.target.value)}
          className="input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b6b6b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_1rem_center] bg-no-repeat pr-10"
        >
          {AGE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Activity Preference */}
      <div className="mb-8">
        <label className="label">Activity Preference</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_OPTIONS.map((activity) => {
            const isSelected = activities.includes(activity.id);
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => toggleActivity(activity.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-gold-core/20 text-gold-bright ring-1 ring-gold-core/40"
                    : "bg-forge-steel text-smoke hover:bg-forge-iron hover:text-white"
                }`}
              >
                <span>{activity.icon}</span>
                <span>{activity.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg bg-ember-glow/10 px-4 py-3 text-center text-sm text-ember-bright"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn btn-primary w-full"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013-5.35 8.27 8.27 0 013.362.964z" />
        </svg>
        Find My Archetype
      </motion.button>
    </form>
  );
}
