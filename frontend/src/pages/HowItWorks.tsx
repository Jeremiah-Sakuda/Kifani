import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const TOOLS = [
  {
    name: "match_archetype",
    icon: "🎯",
    description: "K-means clustering against 120 years of Team USA biometric data",
    details: "Matches your measurements to one of 8 archetypes derived from 14,218 Olympic and 2,847 Paralympic athlete records.",
  },
  {
    name: "get_archetype_sports",
    icon: "🏅",
    description: "Retrieves Olympic & Paralympic sport recommendations",
    details: "Returns sport-specific events with historical context and classification codes for Paralympic pathways.",
  },
  {
    name: "classify_paralympic",
    icon: "♿",
    description: "Explains Paralympic classification taxonomy",
    details: "Provides eligibility criteria and event mappings for 30+ classification codes across Paralympic sports.",
  },
  {
    name: "generate_portrait",
    icon: "🎨",
    description: "Creates stylized archetype visualization via Imagen",
    details: "Generates a non-photorealistic artistic portrait representing your athletic archetype.",
  },
  {
    name: "search_grounding",
    icon: "🔍",
    description: "Google Search grounding for current Team USA relevance",
    details: "Finds current Team USA athletes in your recommended sports using live Google Search integration.",
  },
];

const GEMINI_FEATURES = [
  {
    name: "Thinking Traces",
    description: "Gemini 3.1 Pro reasoning is streamed in real-time, showing how the agent decides which tools to call.",
  },
  {
    name: "Context Caching",
    description: "The 120-year archetype corpus is cached in Vertex AI for efficient reuse across sessions.",
  },
  {
    name: "Semantic Matching",
    description: "Text-embedding-005 provides a parallel matching path using natural language descriptions.",
  },
  {
    name: "Function Calling",
    description: "Native Gemini function calling orchestrates the 5-tool agent with structured outputs.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-forge-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-forge-graphite px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 font-display text-4xl text-gold-core md:text-5xl">
              How FORGED Works
            </h1>
            <p className="text-lg text-smoke">
              A Gemini 3.1 Pro-powered agent that matches you to Team USA archetypes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="border-b border-forge-graphite px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center font-display text-2xl text-white">
            Agent Architecture
          </h2>

          {/* Flow Diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 rounded-2xl bg-forge-charcoal/60 p-8"
          >
            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
              {/* User Input */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-core/20 text-2xl">
                  👤
                </div>
                <p className="mt-2 text-sm text-smoke">User Input</p>
                <p className="text-xs text-ash">Height, Weight, Photo</p>
              </div>

              <div className="hidden h-px w-12 bg-forge-graphite md:block" />
              <div className="h-8 w-px bg-forge-graphite md:hidden" />

              {/* Gemini Agent */}
              <div className="flex flex-col items-center">
                <div className="rounded-xl border border-gold-core/30 bg-forge-steel/50 px-6 py-4 text-center">
                  <p className="font-mono text-sm text-gold-core">Gemini 3.1 Pro</p>
                  <p className="text-xs text-smoke">ADK Agent</p>
                </div>
              </div>

              <div className="hidden h-px w-12 bg-forge-graphite md:block" />
              <div className="h-8 w-px bg-forge-graphite md:hidden" />

              {/* Tools */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-para-green/20 text-2xl">
                  🛠️
                </div>
                <p className="mt-2 text-sm text-smoke">5 Tools</p>
                <p className="text-xs text-ash">Function Calling</p>
              </div>

              <div className="hidden h-px w-12 bg-forge-graphite md:block" />
              <div className="h-8 w-px bg-forge-graphite md:hidden" />

              {/* Results */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ember-glow/20 text-2xl">
                  📊
                </div>
                <p className="mt-2 text-sm text-smoke">Results</p>
                <p className="text-xs text-ash">SSE Stream</p>
              </div>
            </div>
          </motion.div>

          {/* Tools Grid */}
          <h3 className="mb-6 font-mono text-sm uppercase tracking-wider text-ash">
            Agent Tools
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-xl border border-forge-graphite bg-forge-charcoal/40 p-5"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <code className="font-mono text-sm text-gold-core">{tool.name}</code>
                </div>
                <p className="mb-2 text-sm text-white">{tool.description}</p>
                <p className="text-xs text-smoke">{tool.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gemini Features */}
      <section className="border-b border-forge-graphite px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-display text-2xl text-white">
            Gemini 3.1 Pro Capabilities
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {GEMINI_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 rounded-xl bg-forge-charcoal/40 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-core/10">
                  <span className="text-gold-core">✦</span>
                </div>
                <div>
                  <h3 className="mb-1 font-body font-semibold text-white">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-smoke">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="border-b border-forge-graphite px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center font-display text-2xl text-white">
            120 Years of Team USA Data
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-forge-charcoal/40 p-6 text-center">
              <p className="font-display text-3xl text-gold-core">14,218</p>
              <p className="text-sm text-smoke">Olympic Athletes</p>
              <p className="text-xs text-ash">1896–2024</p>
            </div>
            <div className="rounded-xl bg-forge-charcoal/40 p-6 text-center">
              <p className="font-display text-3xl text-para-green">2,847</p>
              <p className="text-sm text-smoke">Paralympic Athletes</p>
              <p className="text-xs text-ash">1960–2024</p>
            </div>
            <div className="rounded-xl bg-forge-charcoal/40 p-6 text-center">
              <p className="font-display text-3xl text-ember-glow">8</p>
              <p className="text-sm text-smoke">Archetypes</p>
              <p className="text-xs text-ash">K-means Clusters</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-display text-2xl text-white">
            Ready to Find Your Archetype?
          </h2>
          <p className="mb-8 text-smoke">
            Discover which Team USA athletes share your physical profile.
          </p>
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <span>Start Your Match</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
