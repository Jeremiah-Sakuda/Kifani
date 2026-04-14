import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ArchetypeCard from "./ArchetypeCard";
import DigitalMirror from "./DigitalMirror";
import ChatInterface from "./ChatInterface";

// TODO: Replace with actual data fetching from session
const MOCK_RESULT = {
  primary_archetype: {
    name: "Explosive Mover",
    description:
      "Built for short, powerful bursts. Your frame suggests a body optimized for speed-to-power conversion — the kind of build that could dominate in sprint events, jumps, and explosive field sports.",
    historical_context:
      "This archetype has been a cornerstone of Team USA success since the 1936 Berlin Games, spanning both Olympic sprinters and Paralympic wheelchair racers.",
    confidence: 0.87,
  },
  olympic_sports: [
    { sport: "Track & Field", event: "100m / 200m Sprint", why: "Your power-to-weight ratio aligns with elite sprinter builds." },
    { sport: "Track & Field", event: "Long Jump", why: "Explosive lower-body strength paired with your height is characteristic of top jumpers." },
  ],
  paralympic_sports: [
    {
      sport: "Para Athletics",
      event: "T44 100m Sprint",
      classification: "T44",
      classification_explainer: "T44 covers athletes with below-knee limb deficiency or impairment affecting one or both legs. Athletes in this class compete with running prostheses.",
      why: "The explosive build profile matches T44 sprinters who are among the fastest Paralympic athletes.",
    },
  ],
  digital_mirror: {
    user_position: [0.6, 0.7],
    centroid_positions: {
      Powerhouse: [0.9, 0.9],
      "Aerobic Engine": [0.3, 0.2],
      "Explosive Mover": [0.65, 0.75],
      "Precision Athlete": [0.4, 0.5],
      "Towering Reach": [0.5, 0.85],
      "Compact Dynamo": [0.7, 0.3],
    },
    distribution_data: [],
  },
  narrative: "",
};

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();

  // TODO: Fetch actual result from backend using sessionId
  const result = MOCK_RESULT;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Archetype Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="mb-2 font-heading text-sm font-medium uppercase tracking-[0.2em] text-gold">
          Your Archetype
        </p>
        <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
          {result.primary_archetype.name}
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate">
          {result.primary_archetype.description}
        </p>
      </motion.div>

      {/* Digital Mirror */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <DigitalMirror data={result.digital_mirror} />
      </motion.section>

      {/* Sports — Olympic & Paralympic side by side */}
      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">
            Olympic Sports
          </h2>
          <div className="space-y-4">
            {result.olympic_sports.map((s, i) => (
              <ArchetypeCard
                key={i}
                sport={s.sport}
                event={s.event}
                why={s.why}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white">
            Paralympic Sports
          </h2>
          <div className="space-y-4">
            {result.paralympic_sports.map((s, i) => (
              <ArchetypeCard
                key={i}
                sport={s.sport}
                event={s.event}
                why={s.why}
                classification={s.classification}
                classificationExplainer={s.classification_explainer}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Historical Context */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass mb-16 rounded-2xl p-8"
      >
        <h2 className="mb-3 text-xl font-bold text-white">
          Historical Context
        </h2>
        <p className="leading-relaxed text-silver">
          {result.primary_archetype.historical_context}
        </p>
      </motion.section>

      {/* Chat */}
      <ChatInterface sessionId={sessionId || ""} />
    </main>
  );
}
