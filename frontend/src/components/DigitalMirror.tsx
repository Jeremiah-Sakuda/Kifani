import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data: {
    user_position: number[];
    centroid_positions: Record<string, number[]>;
    distribution_data: Array<{ x: number; y: number; label: string }>;
  };
}

// 8 Archetypes with the new color palette
const ARCHETYPE_COLORS: Record<string, string> = {
  Powerhouse: "#e31837",
  "Aerobic Engine": "#00a651",
  "Precision Athlete": "#0081c8",
  "Explosive Mover": "#ff6b35",
  "Coordinated Specialist": "#da70d6",
  "Tactical Endurance": "#708090",
  "Adaptive Power": "#cd853f",
  "Adaptive Endurance": "#20b2aa",
  // Legacy names for backwards compatibility
  "Towering Reach": "#7b68c4",
  "Compact Dynamo": "#d4764e",
};

function getDistance(a: number[], b: number[]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

export default function DigitalMirror({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 500;
    const margin = { top: 50, right: 70, bottom: 70, left: 70 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Defs for gradients and filters
    const defs = svg.append("defs");

    // Glow filter
    const glow = defs.append("filter").attr("id", "mirror-glow");
    glow
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Pulse glow for user dot
    const pulseGlow = defs.append("filter").attr("id", "user-pulse-glow");
    pulseGlow
      .append("feGaussianBlur")
      .attr("stdDeviation", "10")
      .attr("result", "coloredBlur");
    const pulseMerge = pulseGlow.append("feMerge");
    pulseMerge.append("feMergeNode").attr("in", "coloredBlur");
    pulseMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Gold gradient for user
    const goldGrad = defs
      .append("radialGradient")
      .attr("id", "user-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    goldGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffd700").attr("stop-opacity", 0.4);
    goldGrad.append("stop").attr("offset", "100%").attr("stop-color", "#d4a012").attr("stop-opacity", 0);

    // Radial gradients for each archetype
    Object.entries(ARCHETYPE_COLORS).forEach(([name, color]) => {
      const grad = defs
        .append("radialGradient")
        .attr("id", `mirror-grad-${name.replace(/\s/g, "")}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.2);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);
    });

    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a")
      .attr("rx", 12);

    // Background grid (subtle)
    const gridGroup = svg.append("g").attr("class", "grid");
    for (let i = 0; i <= 10; i++) {
      const x = margin.left + ((width - margin.left - margin.right) * i) / 10;
      const y = margin.top + ((height - margin.top - margin.bottom) * i) / 10;
      gridGroup
        .append("line")
        .attr("x1", x).attr("y1", margin.top).attr("x2", x).attr("y2", height - margin.bottom)
        .attr("stroke", "#1c1c1e").attr("stroke-width", 0.5);
      gridGroup
        .append("line")
        .attr("x1", margin.left).attr("y1", y).attr("x2", width - margin.right).attr("y2", y)
        .attr("stroke", "#1c1c1e").attr("stroke-width", 0.5);
    }

    // Axis labels
    svg.append("text")
      .attr("x", width / 2).attr("y", height - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b6b6b").attr("font-size", "11px")
      .attr("font-family", "Syne, sans-serif")
      .attr("letter-spacing", "0.1em")
      .attr("text-transform", "uppercase")
      .text("HEIGHT");

    svg.append("text")
      .attr("x", 20).attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b6b6b").attr("font-size", "11px")
      .attr("font-family", "Syne, sans-serif")
      .attr("letter-spacing", "0.1em")
      .attr("transform", `rotate(-90, 20, ${height / 2})`)
      .text("WEIGHT");

    // Axis tick labels
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", height - 40)
      .attr("text-anchor", "start")
      .attr("fill", "#3a3a3c").attr("font-size", "10px")
      .attr("font-family", "Syne, sans-serif")
      .text("Shorter");

    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", height - 40)
      .attr("text-anchor", "end")
      .attr("fill", "#3a3a3c").attr("font-size", "10px")
      .attr("font-family", "Syne, sans-serif")
      .text("Taller");

    svg.append("text")
      .attr("x", margin.left - 10)
      .attr("y", height - margin.bottom)
      .attr("text-anchor", "end")
      .attr("fill", "#3a3a3c").attr("font-size", "10px")
      .attr("font-family", "Syne, sans-serif")
      .text("Lighter");

    svg.append("text")
      .attr("x", margin.left - 10)
      .attr("y", margin.top)
      .attr("text-anchor", "end")
      .attr("fill", "#3a3a3c").attr("font-size", "10px")
      .attr("font-family", "Syne, sans-serif")
      .text("Heavier");

    const centroids = Object.entries(data.centroid_positions);

    // Draw connecting lines from user to each centroid (animated)
    centroids.forEach(([name, pos], i) => {
      const dist = getDistance(data.user_position, pos);
      const opacity = Math.max(0.03, 0.25 - dist * 0.35);
      const color = ARCHETYPE_COLORS[name] || "#a0a0a0";

      const line = svg.append("line")
        .attr("x1", xScale(data.user_position[0]))
        .attr("y1", yScale(data.user_position[1]))
        .attr("x2", xScale(data.user_position[0]))
        .attr("y2", yScale(data.user_position[1]))
        .attr("stroke", color)
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,6");

      line.transition()
        .delay(1000 + i * 80)
        .duration(700)
        .attr("x2", xScale(pos[0]))
        .attr("y2", yScale(pos[1]))
        .attr("stroke-opacity", opacity);
    });

    // Draw archetype clouds + labels (staggered entrance)
    centroids.forEach(([name, pos], i) => {
      const g = svg.append("g").attr("opacity", 0);
      const color = ARCHETYPE_COLORS[name] || "#a0a0a0";
      const gradId = `mirror-grad-${name.replace(/\s/g, "")}`;

      // Soft cloud
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 45)
        .attr("fill", `url(#${gradId})`);

      // Core circle
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 18)
        .attr("fill", color)
        .attr("fill-opacity", 0.1)
        .attr("stroke", color)
        .attr("stroke-opacity", 0.25)
        .attr("stroke-width", 1);

      // Dot
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 4)
        .attr("fill", color)
        .attr("fill-opacity", 0.8);

      // Label
      g.append("text")
        .attr("x", xScale(pos[0]))
        .attr("y", yScale(pos[1]) + 30)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("font-family", "Syne, sans-serif")
        .text(name);

      // Staggered fade in
      g.transition()
        .delay(300 + i * 100)
        .duration(600)
        .attr("opacity", 1);
    });

    // User position — the dramatic reveal
    const userG = svg.append("g").attr("opacity", 0);

    // Outer pulse ring (animated loop)
    const pulseRing = userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 14)
      .attr("fill", "none")
      .attr("stroke", "#d4a012")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.7);

    function pulse() {
      pulseRing
        .attr("r", 14)
        .attr("stroke-opacity", 0.7)
        .transition()
        .duration(2500)
        .ease(d3.easeQuadOut)
        .attr("r", 50)
        .attr("stroke-opacity", 0)
        .on("end", pulse);
    }

    // Soft glow
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 35)
      .attr("fill", "url(#user-gradient)")
      .attr("filter", "url(#user-pulse-glow)");

    // Core dot
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 9)
      .attr("fill", "#d4a012")
      .attr("filter", "url(#mirror-glow)");

    // Inner bright dot
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 4)
      .attr("fill", "#ffd700");

    // "YOU" label
    userG
      .append("text")
      .attr("x", xScale(data.user_position[0]))
      .attr("y", yScale(data.user_position[1]) - 22)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffd700")
      .attr("font-size", "11px")
      .attr("font-weight", "700")
      .attr("font-family", "Syne, sans-serif")
      .attr("letter-spacing", "0.15em")
      .text("YOU");

    // Dramatic entrance for user dot
    userG
      .transition()
      .delay(800)
      .duration(900)
      .ease(d3.easeBackOut.overshoot(1.4))
      .attr("opacity", 1)
      .on("end", pulse);

  }, [data]);

  return (
    <div className="overflow-hidden rounded-2xl bg-forge-charcoal/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forge-graphite/30 px-6 py-4">
        <div>
          <h2 className="font-display text-xl text-white">Digital Mirror</h2>
          <p className="text-sm text-smoke">Your position among 120 years of Team USA archetypes</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold-core" />
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-gold-core">
            Live
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <svg ref={svgRef} className="h-[500px] w-full" />
      </div>

      {/* Legend */}
      <div className="border-t border-forge-graphite/30 px-6 py-4">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {Object.entries(data.centroid_positions).map(([name]) => {
            const color = ARCHETYPE_COLORS[name] || "#a0a0a0";
            return (
              <div key={name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-smoke">{name}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold-core" />
            <span className="text-xs font-semibold text-gold-core">You</span>
          </div>
        </div>
      </div>
    </div>
  );
}
