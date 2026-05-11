import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 1.2, 
      delay, 
      type: "spring", 
      bounce: 0.2,
      opacity: { duration: 1, ease: "easeOut", delay },
      filter: { duration: 1, ease: "easeOut", delay }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="min-h-screen bg-forge-black overflow-hidden font-sans">
      
      {/* ──────────────────────────────────────────────────────────────────
          HERO SECTION
      ────────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 text-center border-b border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-[radial-gradient(ellipse_at_top,_var(--color-gold-core)_0%,_transparent_60%)] opacity-[0.08] mix-blend-screen" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/10 bg-forge-steel/30 px-5 py-2 text-sm text-smoke backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Application
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-gold-core/0 to-gold-core/80" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-core">System Architecture</span>
            <div className="h-px w-12 bg-gradient-to-l from-gold-core/0 to-gold-core/80" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-br from-white via-platinum to-silver drop-shadow-lg tracking-tight mb-6">
            Methodology
          </h1>
          
          <p className="text-xl md:text-2xl text-smoke max-w-2xl font-light">
            How FORGED matches your physical dimensions to 120 years of elite Team USA athletes.
          </p>
        </motion.div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-24 space-y-32">
        
        {/* ──────────────────────────────────────────────────────────────────
            DATA SOURCES
        ────────────────────────────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <h2 className="mb-12 font-display text-3xl md:text-4xl text-white text-center">Data Foundation</h2>
          </FadeIn>
          
          <div className="grid gap-6 md:grid-cols-3">
            <FadeIn delay={0.1}>
              <div className="group relative h-full rounded-2xl border border-white/5 bg-forge-steel/20 p-8 transition-all hover:border-gold-core/30 hover:bg-forge-steel/40">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-core/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-core/10 text-gold-core">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                  </div>
                  <h3 className="mb-3 font-display text-xl text-white">Historical Biometrics</h3>
                  <p className="text-sm text-smoke leading-relaxed">
                    120 years of Olympic history dataset. Filtered strictly to Team USA (NOC="USA") per competition rules. Provides the core physical dimension baseline.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="group relative h-full rounded-2xl border border-white/5 bg-forge-steel/20 p-8 transition-all hover:border-amber-500/30 hover:bg-forge-steel/40">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h3 className="mb-3 font-display text-xl text-white">IPC Historical Records</h3>
                  <p className="text-sm text-smoke leading-relaxed">
                    Paralympic athlete records from 1960–2024. Extracting US Paralympic athletes and matching them meticulously to adaptive classification codes.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="group relative h-full rounded-2xl border border-white/5 bg-forge-steel/20 p-8 transition-all hover:border-blue-500/30 hover:bg-forge-steel/40">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  </div>
                  <h3 className="mb-3 font-display text-xl text-white">Public Census Data</h3>
                  <p className="text-sm text-smoke leading-relaxed">
                    Regional prevalence patterns derived from aggregated public census data. Strict adherence to no PII — macro patterns only.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            ALGORITHM
        ────────────────────────────────────────────────────────────────── */}
        <section>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <FadeIn>
              <h2 className="mb-6 font-display text-3xl md:text-4xl text-white">Distance-to-Centroid Matching Engine</h2>
              <div className="space-y-6 text-smoke">
                <p>
                  We compute weighted Euclidean distance to 8 expert-defined archetype centroids using three normalized features: <span className="text-white">Height, Weight, and calculated BMI.</span>
                </p>
                <p>
                  Because physical dimensions have completely different scales (e.g., 180cm vs 75kg), all features undergo <span className="text-gold-core">z-score normalization</span> to ensure equal weighting in the mathematical model.
                </p>
                <p>
                  Match confidence is computed as the inverse distance ratio between your position and the nearest centroid in this 3D space.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="relative">
              {/* Terminal Window Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-gold-core/30 to-forge-charcoal/30 blur-xl opacity-50" />
              
              <div className="relative rounded-2xl border border-white/10 bg-black overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-4 font-mono text-xs text-ash">algorithm.py</span>
                </div>
                {/* Terminal Content */}
                <div className="p-6 font-mono text-sm leading-relaxed text-smoke overflow-x-auto">
                  <div className="text-blue-400">def <span className="text-yellow-200">calculate_confidence</span>(user, centroid):</div>
                  <div className="pl-4 text-ash mt-2"># 1. Z-Score Normalize</div>
                  <div className="pl-4">
                    <span className="text-purple-400">z_height</span> = (user.h - mu_h) / std_h
                  </div>
                  <div className="pl-4 mb-3">
                    <span className="text-purple-400">z_weight</span> = (user.w - mu_w) / std_w
                  </div>
                  
                  <div className="pl-4 text-ash"># 2. Euclidean Distance</div>
                  <div className="pl-4 mb-3">
                    <span className="text-purple-400">dist</span> = math.sqrt(z_height**<span className="text-orange-400">2</span> + z_weight**<span className="text-orange-400">2</span>)
                  </div>

                  <div className="pl-4 text-ash"># 3. Confidence Inverse Ratio</div>
                  <div className="pl-4 mb-3">
                    <span className="text-purple-400">confidence</span> = <span className="text-orange-400">1</span> - (dist / MAX_DISTANCE)
                  </div>

                  <div className="pl-4 text-blue-400">return <span className="text-white">max</span>(<span className="text-orange-400">0.55</span>, <span className="text-white">min</span>(<span className="text-orange-400">0.98</span>, confidence))</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            PARALYMPIC PARITY
        ────────────────────────────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-forge-black p-8 md:p-12 lg:p-16">
              <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" />
              
              <div className="relative z-10 grid gap-12 lg:grid-cols-2">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px w-8 bg-amber-500/60" />
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-500">Structural Parity</span>
                  </div>
                  <h2 className="mb-6 font-display text-3xl md:text-4xl text-white">Paralympics aren't an afterthought.</h2>
                  <p className="text-lg text-smoke">
                    Most tools treat adaptive athletes as a footnote. FORGED implements deep structural parity through statistical weighting and dedicated classifications.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6 backdrop-blur-sm transition-colors hover:bg-amber-500/10">
                    <div className="mb-2 font-mono text-4xl text-amber-400">1.15x</div>
                    <h4 className="mb-2 font-medium text-white">Sample Weighting</h4>
                    <p className="text-sm text-smoke">Paralympic data receives a 1.15x multiplier in our clustering model to ensure equal representation despite smaller historical dataset sizes.</p>
                  </div>
                  
                  <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6 backdrop-blur-sm transition-colors hover:bg-amber-500/10">
                    <div className="mb-2 font-mono text-4xl text-amber-400">2</div>
                    <h4 className="mb-2 font-medium text-white">Dedicated Archetypes</h4>
                    <p className="text-sm text-smoke">Adaptive Power and Adaptive Endurance are Paralympic-first models — they have no direct Olympic equivalents in the centroid map.</p>
                  </div>
                  
                  <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6 backdrop-blur-sm sm:col-span-2 transition-colors hover:bg-amber-500/10">
                    <div className="mb-2 font-mono text-4xl text-amber-400">30+</div>
                    <h4 className="mb-2 font-medium text-white">Classification Codes Mapped</h4>
                    <p className="text-sm text-smoke">We map T (Track), F (Field), and S (Swimming) classes directly to user physical traits, maintaining strict adherence to IPC criteria.</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            ERA BUCKETS
        ────────────────────────────────────────────────────────────────── */}
        <section>
          <FadeIn>
            <h2 className="mb-12 font-display text-3xl md:text-4xl text-white text-center">Evolution of the Athlete Form</h2>
          </FadeIn>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent hidden lg:block -translate-y-1/2" />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { era: "Pioneer Era", years: "Pre-1950", note: "Multi-sport generalists before modern training science." },
                { era: "Golden Era", years: "1950–1980", note: "The rise of systematic, national training programs." },
                { era: "Modern Era", years: "1980–2000", note: "The sports science revolution and specialization." },
                { era: "Contemporary", years: "2000–Present", note: "Hyper-specialization and data-driven biomechanics." },
              ].map((e, i) => (
                <FadeIn key={e.era} delay={i * 0.1}>
                  <div className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-forge-charcoal/80 border border-white/5 shadow-2xl backdrop-blur-sm transition-transform hover:-translate-y-2">
                    <div className="h-4 w-4 rounded-full bg-gold-core mb-6 shadow-[0_0_15px_var(--color-gold-core)] hidden lg:block" />
                    <span className="font-mono text-xs tracking-widest text-gold-core mb-3 uppercase">{e.years}</span>
                    <h3 className="font-display text-xl text-white mb-3">{e.era}</h3>
                    <p className="text-sm text-ash">{e.note}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────
            COMPLIANCE & TECH STACK
        ────────────────────────────────────────────────────────────────── */}
        <section className="grid gap-12 lg:grid-cols-2">
          {/* Rule Compliance */}
          <FadeIn>
            <h2 className="mb-6 font-display text-2xl text-white">Hackathon Rule Compliance</h2>
            <div className="space-y-4">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 transition-colors hover:bg-green-500/10">
                <h3 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-green-400 mb-4">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Permitted Data
                </h3>
                <ul className="space-y-3 text-sm text-smoke">
                  <li><span className="text-green-500 mr-2">•</span>Finish placement and medal data (1st, 2nd, 3rd)</li>
                  <li><span className="text-green-500 mr-2">•</span>Public Team USA historical athlete biometrics</li>
                  <li><span className="text-green-500 mr-2">•</span>IPC historical results (1960–2024)</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 transition-colors hover:bg-red-500/10">
                <h3 className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-red-400 mb-4">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  Strictly Prohibited
                </h3>
                <ul className="space-y-3 text-sm text-smoke">
                  <li><span className="text-red-500 mr-2">•</span>No specific finish times or scoring results</li>
                  <li><span className="text-red-500 mr-2">•</span>No individual athlete names or images (NIL)</li>
                  <li><span className="text-red-500 mr-2">•</span>No IOC intellectual property (rings, torch)</li>
                  <li><span className="text-red-500 mr-2">•</span>No international athlete data (US only)</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-forge-graphite/40 bg-forge-steel/30 p-6">
                <h3 className="font-mono text-sm uppercase tracking-widest text-silver mb-3">Language Hedging</h3>
                <p className="text-sm text-smoke">
                  Outputs never claim "you will excel". A dedicated Gemini Flash validation pass enforces conditional phrasing like <span className="text-gold-core font-medium">"could align with"</span> or <span className="text-gold-core font-medium">"demonstrates affinity toward"</span>.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Tech Stack */}
          <FadeIn delay={0.2}>
            <h2 className="mb-6 font-display text-2xl text-white">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Gemini 2.5 Pro", cat: "Agent Engine" },
                { name: "Gemini 2.5 Flash", cat: "Validation" },
                { name: "Imagen 3.0", cat: "Archetype Art" },
                { name: "BigQuery", cat: "16K+ Records" },
                { name: "Firestore", cat: "Persistence" },
                { name: "Cloud Run", cat: "Serverless" },
                { name: "React 19", cat: "Frontend UI" },
                { name: "FastAPI", cat: "Python Backend" },
                { name: "Framer Motion", cat: "Cinematics" },
                { name: "Tailwind v4", cat: "Design System" },
              ].map((tech) => (
                <div key={tech.name} className="flex flex-col justify-center rounded-xl border border-white/5 bg-forge-steel/20 p-4 transition hover:border-gold-core/30 hover:bg-forge-steel/40">
                  <span className="font-display text-lg text-white">{tech.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ash mt-1">{tech.cat}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>
      </main>
    </div>
  );
}
