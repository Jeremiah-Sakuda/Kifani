import { motion } from "framer-motion";

interface Archetype {
  name: string;
  tagline: string;
  color: string;
  sports: string[];
}

const ARCHETYPES: Archetype[] = [
  {
    name: "Powerhouse",
    tagline: "Raw strength and explosive power",
    color: "#dc143c",
    sports: ["Weightlifting", "Wrestling", "Shot Put"],
  },
  {
    name: "Aerobic Engine",
    tagline: "Sustained endurance excellence",
    color: "#228b22",
    sports: ["Marathon", "Cycling", "XC Skiing"],
  },
  {
    name: "Precision Athlete",
    tagline: "Focus and steady control",
    color: "#4169e1",
    sports: ["Archery", "Shooting", "Fencing"],
  },
  {
    name: "Explosive Mover",
    tagline: "Speed and quick reactions",
    color: "#ffa500",
    sports: ["Sprinting", "Gymnastics", "Jumping"],
  },
  {
    name: "Coordinated Specialist",
    tagline: "Grace and precise coordination",
    color: "#da70d6",
    sports: ["Diving", "Figure Skating", "Rhythmic"],
  },
  {
    name: "Tactical Endurance",
    tagline: "Strategic sustained effort",
    color: "#708090",
    sports: ["Rowing", "Swimming", "Triathlon"],
  },
  {
    name: "Adaptive Power",
    tagline: "Determined strength and resilience",
    color: "#cd853f",
    sports: ["Para Powerlifting", "Wheelchair Rugby"],
  },
  {
    name: "Adaptive Endurance",
    tagline: "Persistent flow and determination",
    color: "#20b2aa",
    sports: ["Para Cycling", "Wheelchair Racing"],
  },
];

export default function ArchetypePreview() {
  return (
    <section className="w-full overflow-hidden py-12">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-core/40" />
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ash">
          8 Archetypes
        </h2>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-core/40" />
      </div>

      {/* Scrolling Carousel */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-forge-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-forge-black to-transparent" />

        {/* Carousel track */}
        <motion.div
          className="flex gap-4"
          animate={{ x: [0, -1200] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Double the items for seamless loop */}
          {[...ARCHETYPES, ...ARCHETYPES].map((arch, i) => (
            <motion.div
              key={`${arch.name}-${i}`}
              className="group relative min-w-[200px] cursor-default overflow-hidden rounded-xl bg-forge-charcoal/80 p-4 transition-all duration-300 hover:bg-forge-charcoal"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              {/* Color accent */}
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-80"
                style={{ backgroundColor: arch.color }}
              />

              {/* Content */}
              <div className="relative">
                <h3 className="mb-1 font-display text-lg text-white">
                  {arch.name}
                </h3>
                <p className="mb-3 text-xs text-smoke">{arch.tagline}</p>

                {/* Sports pills */}
                <div className="flex flex-wrap gap-1">
                  {arch.sports.map((sport) => (
                    <span
                      key={sport}
                      className="rounded-full bg-forge-steel/60 px-2 py-0.5 text-[10px] text-ash"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                style={{
                  background: `radial-gradient(circle at center, ${arch.color} 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Caption */}
      <p className="mt-6 text-center text-xs text-ash">
        Olympic and Paralympic archetypes with equal analytical depth
      </p>
    </section>
  );
}
