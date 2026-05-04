import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-forge-black">
      {/* Header */}
      <header className="border-b border-forge-graphite/30 px-6 py-8 md:px-12">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-ash transition hover:text-gold-core"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          <h1 className="font-display text-4xl text-white md:text-5xl">
            Methodology
          </h1>
          <p className="mt-3 text-smoke">
            How FORGED matches you to 120 years of Team USA athlete archetypes
          </p>
        </div>
      </header>

      <main className="px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Data Sources */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Data Sources</h2>
            <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gold-core" />
                  <div>
                    <h3 className="font-medium text-white">Kaggle Olympic History Dataset</h3>
                    <p className="text-sm text-smoke">
                      "120 Years of Olympic History" — historical biometrics (height, weight) for
                      Olympic athletes. Filtered to NOC="USA" only per competition rules.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                  <div>
                    <h3 className="font-medium text-white">IPC Historical Results</h3>
                    <p className="text-sm text-smoke">
                      Paralympic athlete records (1960–2024). US Paralympic athletes extracted
                      and matched to classification codes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <h3 className="font-medium text-white">Public Census Data</h3>
                    <p className="text-sm text-smoke">
                      Regional prevalence patterns derived from aggregated public census data.
                      No individual identification — patterns only.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Clustering Algorithm */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Clustering Algorithm</h2>
            <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gold-core">K-Means Clustering</h3>
                <p className="mt-2 text-sm text-smoke">
                  We apply k-means clustering on three normalized features: height (cm), weight (kg),
                  and BMI. Features are z-score normalized before clustering to ensure equal weighting.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gold-core">Optimal k Selection</h3>
                <p className="mt-2 text-sm text-smoke">
                  We selected k=8 clusters based on elbow method analysis and silhouette scores.
                  This number also aligns with domain knowledge: 6 general archetypes plus 2
                  Paralympic-first archetypes.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gold-core">Confidence Scoring</h3>
                <p className="mt-2 text-sm text-smoke">
                  Match confidence is computed as the inverse distance ratio between the user's
                  normalized position and the nearest centroid. Scores range from ~0.55 (uncertain)
                  to ~0.98 (strong match).
                </p>
              </div>

              <div className="rounded-lg bg-forge-iron/50 p-4 font-mono text-xs text-ash">
                <code>
                  confidence = 1 - (distance_to_nearest / max_distance)
                  <br />
                  where max_distance = 1.5 * median_inter_centroid_distance
                </code>
              </div>
            </div>
          </motion.section>

          {/* Paralympic Parity */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Paralympic Parity</h2>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-6 space-y-4">
              <p className="text-sm text-smoke">
                Paralympic athletes are not an afterthought in FORGED. We implement structural parity
                through several mechanisms:
              </p>

              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-mono text-amber-400">1.15x</span>
                  <span className="text-sm text-smoke">
                    <strong className="text-white">Sample Weighting:</strong> Paralympic archetypes
                    receive 1.15x weighting in clustering to ensure equal representation despite
                    smaller dataset size.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-amber-400">2</span>
                  <span className="text-sm text-smoke">
                    <strong className="text-white">Dedicated Archetypes:</strong> Adaptive Power and
                    Adaptive Endurance are Paralympic-first — they have no Olympic equivalents.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-amber-400">30+</span>
                  <span className="text-sm text-smoke">
                    <strong className="text-white">Classification Codes:</strong> Full explanations
                    for T/F/S classes including eligibility criteria and event mappings.
                  </span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Era Buckets */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Era Buckets</h2>
            <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { era: "Pioneer Era", years: "pre-1950", note: "Before modern training science" },
                  { era: "Golden Era", years: "1950–1980", note: "Rise of systematic training" },
                  { era: "Modern Era", years: "1980–2000", note: "Sports science revolution" },
                  { era: "Contemporary Era", years: "2000+", note: "Data-driven optimization" },
                ].map((e) => (
                  <div key={e.era} className="rounded-lg bg-forge-iron/50 p-4">
                    <h3 className="font-medium text-white">{e.era}</h3>
                    <p className="text-sm text-gold-core">{e.years}</p>
                    <p className="mt-1 text-xs text-ash">{e.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Compliance */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Rule Compliance</h2>
            <div className="rounded-xl border border-green-500/30 bg-green-950/10 p-6 space-y-4">
              <div>
                <h3 className="font-medium text-green-400">Permitted Data</h3>
                <ul className="mt-2 space-y-1 text-sm text-smoke">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Finish placement and medal data (1st, 2nd, 3rd)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Public Team USA historical athlete biometrics
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    IPC historical results (Paralympic athletes 1960–2024)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-red-400">Prohibited Data (Not Used)</h3>
                <ul className="mt-2 space-y-1 text-sm text-smoke">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No finish times or specific scoring results
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No individual athlete names, images, or likenesses (NIL)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No IOC intellectual property (rings, torch, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    No international data (US athletes only)
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Conditional Language */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Conditional Language</h2>
            <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
              <p className="text-sm text-smoke mb-4">
                All outputs use conditional phrasing per hackathon rules. We never claim "you would
                be good at" or "you will excel" — instead, we use phrases like:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-green-950/20 p-3 text-sm">
                  <span className="text-green-400">"could align with"</span>
                </div>
                <div className="rounded-lg bg-green-950/20 p-3 text-sm">
                  <span className="text-green-400">"shows characteristics of"</span>
                </div>
                <div className="rounded-lg bg-green-950/20 p-3 text-sm">
                  <span className="text-green-400">"demonstrates alignment with"</span>
                </div>
                <div className="rounded-lg bg-green-950/20 p-3 text-sm">
                  <span className="text-green-400">"suggests affinity toward"</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-ash">
                A separate Gemini Flash validation pass ensures all outputs use appropriate hedging.
              </p>
            </div>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-4 font-display text-2xl text-white">Technology Stack</h2>
            <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Vertex AI Gemini 2.5 Pro", use: "Agent orchestration" },
                  { name: "Vertex AI Gemini 2.0 Flash", use: "Multimodal analysis, validation" },
                  { name: "Vertex AI Imagen 3.0", use: "Archetype portraits" },
                  { name: "BigQuery", use: "16K+ athlete records" },
                  { name: "Firestore", use: "Session persistence" },
                  { name: "Cloud Run", use: "Serverless deployment" },
                  { name: "React 19 + TypeScript", use: "Frontend" },
                  { name: "FastAPI + Python 3.12", use: "Backend" },
                  { name: "D3.js", use: "Data visualization" },
                ].map((tech) => (
                  <div key={tech.name} className="rounded-lg bg-forge-iron/50 p-3">
                    <h3 className="font-medium text-white">{tech.name}</h3>
                    <p className="text-xs text-ash">{tech.use}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
