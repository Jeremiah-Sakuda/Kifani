import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParityCompare from "./ParityCompare";
import {
  listClassifications,
  listParalympicArchetypes,
  exploreParalympic,
  type ClassificationInfo,
  type ParalympicArchetype,
} from "../services/api";

type Tab = "classifications" | "archetypes" | "compare";

export default function ParalympicExplorer() {
  const [activeTab, setActiveTab] = useState<Tab>("archetypes");
  const [archetypes, setArchetypes] = useState<ParalympicArchetype[]>([]);
  const [classifications, setClassifications] = useState<Record<string, ClassificationInfo[]>>({});
  const [sports, setSports] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ClassificationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [archetypesData, classificationsData] = await Promise.all([
          listParalympicArchetypes(),
          listClassifications(),
        ]);
        setArchetypes(archetypesData.archetypes);
        setClassifications(classificationsData.classifications_by_sport);
        setSports(classificationsData.sports);
      } catch (error) {
        console.error("Failed to load Paralympic data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await exploreParalympic(searchQuery);
      setSearchResults(results.classifications);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-forge-black">
      {/* Header */}
      <header className="border-b border-forge-graphite/30 px-6 py-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-ash transition hover:text-gold-core"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Archetype Match
          </Link>

          <div className="flex items-center gap-3">
            <div className="h-px w-10 bg-amber-500/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-500">
              Paralympic Spotlight
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl text-white md:text-5xl">
            Explore by Classification
          </h1>
          <p className="mt-3 max-w-2xl text-smoke">
            Most archetype tools treat Paralympic athletes as a footnote. We built two ways in.
            Explore Paralympic sports by classification, see side-by-side parity comparisons,
            and discover archetypes that center Paralympic excellence.
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-forge-graphite/30 px-6 md:px-12" aria-label="Paralympic Explorer sections">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-1" role="tablist">
            {[
              { id: "archetypes" as Tab, label: "Archetypes", panel: "archetypes-panel" },
              { id: "classifications" as Tab, label: "Classifications", panel: "classifications-panel" },
              { id: "compare" as Tab, label: "Parity Compare", panel: "compare-panel" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tab.panel}
                id={`${tab.id}-tab`}
                className={`relative px-4 py-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gold-core focus:ring-inset ${
                  activeTab === tab.id
                    ? "text-gold-core"
                    : "text-ash hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-core"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-core border-t-transparent" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Archetypes Tab */}
              {activeTab === "archetypes" && (
                <motion.div
                  key="archetypes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="tabpanel"
                  id="archetypes-panel"
                  aria-labelledby="archetypes-tab"
                  className="space-y-6"
                >
                  <p className="text-smoke">
                    Archetypes sorted by Paralympic representation. Paralympic-first archetypes
                    have no Olympic equivalents — they represent body types and athletic profiles
                    unique to adaptive sports.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {archetypes.map((archetype) => (
                      <motion.div
                        key={archetype.name}
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-xl border p-5 transition ${
                          archetype.is_paralympic_first
                            ? "border-amber-500/50 bg-amber-950/20"
                            : "border-forge-graphite/30 bg-forge-steel/50"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <h3 className="font-display text-lg text-white">
                            {archetype.name}
                          </h3>
                          {archetype.is_paralympic_first && (
                            <span className="rounded-full bg-amber-600/30 px-2 py-0.5 text-xs text-amber-300">
                              Paralympic First
                            </span>
                          )}
                        </div>

                        <p className="mb-4 text-sm text-smoke line-clamp-2">
                          {archetype.description}
                        </p>

                        <div className="space-y-2 text-xs">
                          {archetype.paralympic_sports.length > 0 && (
                            <div>
                              <span className="text-amber-400">Paralympic: </span>
                              <span className="text-ash">
                                {archetype.paralympic_sports.slice(0, 3).join(", ")}
                                {archetype.paralympic_sports.length > 3 && "..."}
                              </span>
                            </div>
                          )}
                          {archetype.olympic_sports.length > 0 && (
                            <div>
                              <span className="text-blue-400">Olympic: </span>
                              <span className="text-ash">
                                {archetype.olympic_sports.slice(0, 3).join(", ")}
                                {archetype.olympic_sports.length > 3 && "..."}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-ash">
                          <span>{archetype.athlete_count.toLocaleString()} athletes</span>
                          {archetype.sample_weight > 1 && (
                            <span className="text-amber-400">
                              {archetype.sample_weight}x weighted
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Classifications Tab */}
              {activeTab === "classifications" && (
                <motion.div
                  key="classifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="tabpanel"
                  id="classifications-panel"
                  aria-labelledby="classifications-tab"
                  className="space-y-6"
                >
                  {/* Search */}
                  <div className="flex gap-3" role="search">
                    <label htmlFor="classification-search" className="sr-only">
                      Search Paralympic classifications
                    </label>
                    <input
                      type="search"
                      id="classification-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search classifications (e.g., T54, visual impairment, wheelchair)"
                      aria-describedby="search-hint"
                      className="flex-1 rounded-lg border border-forge-graphite bg-forge-iron px-4 py-3 text-white placeholder-ash focus:border-gold-core focus:outline-none focus:ring-2 focus:ring-gold-core"
                    />
                    <span id="search-hint" className="sr-only">
                      Enter a classification code, disability type, or sport name
                    </span>
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      aria-label={searching ? "Searching..." : "Search classifications"}
                      className="rounded-lg bg-gold-core px-6 py-3 font-medium text-forge-black transition hover:bg-gold-light disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gold-core focus:ring-offset-2 focus:ring-offset-forge-black"
                    >
                      {searching ? "..." : "Search"}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="rounded-xl border border-gold-core/30 bg-gold-core/5 p-4">
                      <h3 className="mb-3 font-medium text-gold-core">
                        Search Results ({searchResults.length})
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {searchResults.map((cls) => (
                          <div
                            key={cls.code}
                            className="rounded-lg bg-forge-steel/50 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-amber-600/30 px-2 py-0.5 text-sm font-mono text-amber-300">
                                {cls.code}
                              </span>
                              <span className="text-sm text-smoke">{cls.sport}</span>
                            </div>
                            <p className="mt-2 text-sm text-ash">{cls.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sport Filter */}
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Filter by sport">
                    <button
                      onClick={() => setSelectedSport(null)}
                      role="radio"
                      aria-checked={selectedSport === null}
                      className={`rounded-lg px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-gold-core focus:ring-offset-2 focus:ring-offset-forge-black ${
                        selectedSport === null
                          ? "bg-gold-core text-forge-black"
                          : "bg-forge-iron text-smoke hover:text-white"
                      }`}
                    >
                      All Sports
                    </button>
                    {sports.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        role="radio"
                        aria-checked={selectedSport === sport}
                        className={`rounded-lg px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-gold-core focus:ring-offset-2 focus:ring-offset-forge-black ${
                          selectedSport === sport
                            ? "bg-gold-core text-forge-black"
                            : "bg-forge-iron text-smoke hover:text-white"
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>

                  {/* Classifications Grid */}
                  <div className="space-y-6">
                    {(selectedSport ? [selectedSport] : sports).map((sport) => (
                      <div key={sport}>
                        <h3 className="mb-3 font-display text-lg text-white">{sport}</h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {classifications[sport]?.map((cls) => (
                            <div
                              key={cls.code}
                              className="rounded-lg border border-forge-graphite/30 bg-forge-steel/50 p-4"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="rounded bg-amber-600/30 px-2 py-0.5 font-mono text-sm text-amber-300">
                                  {cls.code}
                                </span>
                                <span className="text-xs text-ash">{cls.category}</span>
                              </div>
                              <p className="text-sm text-smoke">{cls.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Compare Tab */}
              {activeTab === "compare" && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role="tabpanel"
                  id="compare-panel"
                  aria-labelledby="compare-tab"
                >
                  <ParityCompare />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* CTA Banner */}
      <section className="border-t border-forge-graphite/30 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display text-2xl text-white">
            Ready to find your archetype?
          </h2>
          <p className="mt-2 text-smoke">
            Use photo, voice, or form input to discover your Team USA alignment.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold-core px-6 py-3 font-medium text-forge-black transition hover:bg-gold-light"
          >
            Find My Archetype
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
