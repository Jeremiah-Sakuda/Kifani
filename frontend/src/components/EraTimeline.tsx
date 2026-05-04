import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import {
  listEras,
  getEraEvolution,
  type EraDefinition,
  type EraData,
  type EraEvolutionResponse,
} from "../services/api";

const ARCHETYPES = [
  "Powerhouse",
  "Aerobic Engine",
  "Explosive Mover",
  "Coordinated Specialist",
  "Tactical Endurance",
  "Precision Athlete",
  "Adaptive Power",
  "Adaptive Endurance",
];

export default function EraTimeline() {
  const [eras, setEras] = useState<EraDefinition[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState("Powerhouse");
  const [evolutionData, setEvolutionData] = useState<EraEvolutionResponse | null>(null);
  const [selectedEra, setSelectedEra] = useState<EraData | null>(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<SVGSVGElement>(null);

  // Load era definitions
  useEffect(() => {
    async function load() {
      try {
        const data = await listEras();
        setEras(data.eras);
      } catch (error) {
        console.error("Failed to load eras:", error);
      }
    }
    load();
  }, []);

  // Load evolution data for selected archetype
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getEraEvolution(selectedArchetype);
        setEvolutionData(data);
        // Select the most recent era with data by default
        const lastWithData = [...data.eras].reverse().find(e => e.athlete_count > 0);
        setSelectedEra(lastWithData || null);
      } catch (error) {
        console.error("Failed to load evolution data:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedArchetype]);

  // D3 Timeline Chart
  useEffect(() => {
    if (!chartRef.current || !evolutionData) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Filter eras with data
    const erasWithData = evolutionData.eras.filter(e => e.avg_height_cm !== null);

    if (erasWithData.length === 0) return;

    // Scales
    const x = d3
      .scalePoint()
      .domain(erasWithData.map(e => e.label))
      .range([0, width])
      .padding(0.5);

    const yHeight = d3
      .scaleLinear()
      .domain([150, 200])
      .range([height, 0]);

    const yWeight = d3
      .scaleLinear()
      .domain([40, 120])
      .range([height, 0]);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#9CA3AF")
      .attr("font-size", "10px");

    // Y Axis (Height)
    g.append("g")
      .call(d3.axisLeft(yHeight).ticks(5))
      .selectAll("text")
      .attr("fill", "#9CA3AF");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#6B7280")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text("Height (cm)");

    // Height Line
    const heightLine = d3
      .line<EraData>()
      .x(d => x(d.label)!)
      .y(d => yHeight(d.avg_height_cm!))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(erasWithData)
      .attr("fill", "none")
      .attr("stroke", "#60A5FA")
      .attr("stroke-width", 2)
      .attr("d", heightLine);

    // Height Points
    g.selectAll(".height-point")
      .data(erasWithData)
      .enter()
      .append("circle")
      .attr("class", "height-point")
      .attr("cx", d => x(d.label)!)
      .attr("cy", d => yHeight(d.avg_height_cm!))
      .attr("r", 6)
      .attr("fill", d => d.era === selectedEra?.era ? "#FFD700" : "#60A5FA")
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (_, d) => setSelectedEra(d));

    // Weight Line (secondary)
    const weightLine = d3
      .line<EraData>()
      .x(d => x(d.label)!)
      .y(d => yWeight(d.avg_weight_kg!))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(erasWithData)
      .attr("fill", "none")
      .attr("stroke", "#34D399")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4")
      .attr("d", weightLine);

    // Legend
    const legend = g.append("g").attr("transform", `translate(${width - 100}, 0)`);

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 0).attr("y2", 0)
      .attr("stroke", "#60A5FA").attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 4).attr("fill", "#9CA3AF").attr("font-size", "10px")
      .text("Height");

    legend.append("line")
      .attr("x1", 0).attr("x2", 20).attr("y1", 15).attr("y2", 15)
      .attr("stroke", "#34D399").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
    legend.append("text")
      .attr("x", 25).attr("y", 19).attr("fill", "#9CA3AF").attr("font-size", "10px")
      .text("Weight");

  }, [evolutionData, selectedEra]);

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
            <div className="h-px w-10 bg-gold-core/50" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold-core">
              Era Time Machine
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl text-white md:text-5xl">
            120 Years of Evolution
          </h1>
          <p className="mt-3 max-w-2xl text-smoke">
            See how Team USA athlete archetypes have evolved from the Pioneer Era (pre-1950)
            to the Contemporary Era (2000+). Explore changing body types, emerging sports,
            and the rise of Paralympic excellence.
          </p>
        </div>
      </header>

      <main className="px-6 py-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Archetype Selector */}
          <div className="mb-8" role="group" aria-labelledby="archetype-selector-label">
            <span id="archetype-selector-label" className="mb-3 block text-sm text-ash">Select Archetype</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Archetype selection">
              {ARCHETYPES.map((archetype) => (
                <button
                  key={archetype}
                  onClick={() => setSelectedArchetype(archetype)}
                  role="radio"
                  aria-checked={selectedArchetype === archetype}
                  className={`rounded-lg px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-gold-core focus:ring-offset-2 focus:ring-offset-forge-black ${
                    selectedArchetype === archetype
                      ? "bg-gold-core text-forge-black"
                      : "bg-forge-iron text-smoke hover:bg-forge-graphite hover:text-white"
                  }`}
                >
                  {archetype}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-core border-t-transparent" />
            </div>
          ) : evolutionData ? (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Timeline Chart */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6">
                  <h3 className="mb-4 font-display text-lg text-white">
                    Evolution Timeline: {evolutionData.archetype}
                  </h3>

                  {/* D3 Chart */}
                  <div className="overflow-x-auto">
                    <svg
                      ref={chartRef}
                      width={600}
                      height={200}
                      className="mx-auto"
                      role="img"
                      aria-label={`Evolution timeline chart for ${evolutionData.archetype} showing height and weight trends across eras`}
                    />
                  </div>

                  {/* Keyboard-accessible era selection */}
                  <div className="sr-only" role="listbox" aria-label="Select era for details">
                    {evolutionData.eras.filter(e => e.athlete_count > 0).map((era) => (
                      <button
                        key={era.era}
                        role="option"
                        aria-selected={selectedEra?.era === era.era}
                        onClick={() => setSelectedEra(era)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedEra(era);
                          }
                        }}
                      >
                        {era.label}: {era.avg_height_cm}cm height, {era.avg_weight_kg}kg weight, {era.athlete_count} athletes
                      </button>
                    ))}
                  </div>

                  {/* Evolution Summary */}
                  {evolutionData.evolution_summary && (
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-center">
                      <div className="rounded-lg bg-forge-iron/50 px-4 py-2">
                        <div className="text-lg font-bold text-blue-400">
                          {evolutionData.evolution_summary.height_change_cm > 0 ? "+" : ""}
                          {evolutionData.evolution_summary.height_change_cm} cm
                        </div>
                        <div className="text-xs text-ash">Height Change</div>
                      </div>
                      <div className="rounded-lg bg-forge-iron/50 px-4 py-2">
                        <div className="text-lg font-bold text-green-400">
                          {evolutionData.evolution_summary.weight_change_kg > 0 ? "+" : ""}
                          {evolutionData.evolution_summary.weight_change_kg} kg
                        </div>
                        <div className="text-xs text-ash">Weight Change</div>
                      </div>
                      <div className="rounded-lg bg-forge-iron/50 px-4 py-2">
                        <div className="text-lg font-bold text-gold-core">
                          {evolutionData.evolution_summary.total_athlete_growth.toLocaleString()}
                        </div>
                        <div className="text-xs text-ash">Total Athletes</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Era Cards */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {evolutionData.eras.map((era) => (
                    <motion.button
                      key={era.era}
                      onClick={() => setSelectedEra(era)}
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl border p-4 text-left transition ${
                        selectedEra?.era === era.era
                          ? "border-gold-core bg-gold-core/10"
                          : "border-forge-graphite/30 bg-forge-steel/50 hover:border-forge-graphite"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: era.color }}
                        />
                        <span className="text-xs text-ash">
                          {era.years[0]}–{era.years[1]}
                        </span>
                      </div>
                      <h4 className="font-display text-white">{era.label}</h4>
                      {era.athlete_count > 0 ? (
                        <p className="mt-1 text-sm text-smoke">
                          {era.athlete_count} athletes
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-ash italic">
                          No data available
                        </p>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Era Detail Panel */}
              <div className="lg:col-span-1">
                <AnimatePresence mode="wait">
                  {selectedEra && selectedEra.athlete_count > 0 ? (
                    <motion.div
                      key={selectedEra.era}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6"
                    >
                      <div
                        className="mb-4 inline-block rounded-lg px-3 py-1 text-sm font-medium"
                        style={{
                          backgroundColor: `${selectedEra.color}30`,
                          color: selectedEra.color,
                        }}
                      >
                        {selectedEra.label}
                      </div>

                      <h3 className="font-display text-xl text-white">
                        {evolutionData.archetype} in {selectedEra.years[0]}–{selectedEra.years[1]}
                      </h3>

                      {/* Stats */}
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-forge-iron/50 p-3 text-center">
                          <div className="text-lg font-bold text-white">
                            {selectedEra.avg_height_cm}
                          </div>
                          <div className="text-xs text-ash">Avg Height (cm)</div>
                        </div>
                        <div className="rounded-lg bg-forge-iron/50 p-3 text-center">
                          <div className="text-lg font-bold text-white">
                            {selectedEra.avg_weight_kg}
                          </div>
                          <div className="text-xs text-ash">Avg Weight (kg)</div>
                        </div>
                        <div className="rounded-lg bg-forge-iron/50 p-3 text-center">
                          <div className="text-lg font-bold text-white">
                            {selectedEra.athlete_count}
                          </div>
                          <div className="text-xs text-ash">Athletes</div>
                        </div>
                      </div>

                      {/* Top Sports */}
                      {selectedEra.top_sports.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-2 text-sm font-medium text-ash">
                            Top Sports
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedEra.top_sports.map((sport) => (
                              <span
                                key={sport}
                                className="rounded-lg bg-forge-iron px-3 py-1 text-sm text-smoke"
                              >
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Narrative */}
                      <p className="mt-4 text-sm leading-relaxed text-smoke">
                        {selectedEra.narrative}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-forge-graphite/30 bg-forge-steel/50 p-6"
                    >
                      <p className="text-center text-ash">
                        Select an era to see details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="text-center text-ash">Failed to load data</div>
          )}
        </div>
      </main>

      {/* CTA */}
      <section className="border-t border-forge-graphite/30 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display text-2xl text-white">
            Find your archetype match
          </h2>
          <p className="mt-2 text-smoke">
            Discover which Team USA athletes share your build across 120 years of history.
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
