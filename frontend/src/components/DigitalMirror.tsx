import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data: {
    user_position: number[];
    centroid_positions: Record<string, number[]>;
    distribution_data: Array<{ x: number; y: number; label: string }>;
  };
}

const ARCHETYPE_COLORS: Record<string, string> = {
  Powerhouse: "#b4283a",
  "Aerobic Engine": "#3a8fb7",
  "Precision Athlete": "#6b8e6b",
  "Explosive Mover": "#e8c84a",
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
    const height = 480;
    const margin = { top: 50, right: 60, bottom: 60, left: 60 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Defs for gradients and filters
    const defs = svg.append("defs");

    // Glow filter
    const glow = defs.append("filter").attr("id", "glow");
    glow
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Pulse glow for user dot
    const pulseGlow = defs.append("filter").attr("id", "pulse-glow");
    pulseGlow
      .append("feGaussianBlur")
      .attr("stdDeviation", "8")
      .attr("result", "coloredBlur");
    const pulseMerge = pulseGlow.append("feMerge");
    pulseMerge.append("feMergeNode").attr("in", "coloredBlur");
    pulseMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Radial gradients for each archetype
    Object.entries(ARCHETYPE_COLORS).forEach(([name, color]) => {
      const grad = defs
        .append("radialGradient")
        .attr("id", `grad-${name.replace(/\s/g, "")}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.25);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0);
    });

    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    // Background grid
    const gridGroup = svg.append("g").attr("class", "grid");
    for (let i = 0; i <= 10; i++) {
      const x = margin.left + ((width - margin.left - margin.right) * i) / 10;
      const y = margin.top + ((height - margin.top - margin.bottom) * i) / 10;
      gridGroup
        .append("line")
        .attr("x1", x).attr("y1", margin.top).attr("x2", x).attr("y2", height - margin.bottom)
        .attr("stroke", "#1a2d4a").attr("stroke-width", 0.5);
      gridGroup
        .append("line")
        .attr("x1", margin.left).attr("y1", y).attr("x2", width - margin.right).attr("y2", y)
        .attr("stroke", "#1a2d4a").attr("stroke-width", 0.5);
    }

    // Axis labels
    svg.append("text")
      .attr("x", width / 2).attr("y", height - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#8892a4").attr("font-size", "12px")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("letter-spacing", "0.05em")
      .text("HEIGHT");

    svg.append("text")
      .attr("x", 16).attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#8892a4").attr("font-size", "12px")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("letter-spacing", "0.05em")
      .attr("transform", `rotate(-90, 16, ${height / 2})`)
      .text("WEIGHT");

    // Axis tick labels
    ["Shorter", "Taller"].forEach((label, i) => {
      svg.append("text")
        .attr("x", i === 0 ? margin.left : width - margin.right)
        .attr("y", height - 30)
        .attr("text-anchor", i === 0 ? "start" : "end")
        .attr("fill", "#556070").attr("font-size", "10px")
        .attr("font-family", "DM Sans, sans-serif")
        .text(label);
    });
    ["Lighter", "Heavier"].forEach((label, i) => {
      svg.append("text")
        .attr("x", margin.left - 8)
        .attr("y", i === 0 ? height - margin.bottom : margin.top)
        .attr("text-anchor", "end")
        .attr("fill", "#556070").attr("font-size", "10px")
        .attr("font-family", "DM Sans, sans-serif")
        .text(label);
    });

    const centroids = Object.entries(data.centroid_positions);

    // Draw connecting lines from user to each centroid (animated)
    centroids.forEach(([name, pos], i) => {
      const dist = getDistance(data.user_position, pos);
      const opacity = Math.max(0.04, 0.3 - dist * 0.4);
      const color = ARCHETYPE_COLORS[name] || "#c0c6d0";

      const line = svg.append("line")
        .attr("x1", xScale(data.user_position[0]))
        .attr("y1", yScale(data.user_position[1]))
        .attr("x2", xScale(data.user_position[0]))
        .attr("y2", yScale(data.user_position[1]))
        .attr("stroke", color)
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");

      line.transition()
        .delay(800 + i * 100)
        .duration(600)
        .attr("x2", xScale(pos[0]))
        .attr("y2", yScale(pos[1]))
        .attr("stroke-opacity", opacity);
    });

    // Draw archetype cloud + label (staggered entrance)
    centroids.forEach(([name, pos], i) => {
      const g = svg.append("g").attr("opacity", 0);
      const color = ARCHETYPE_COLORS[name] || "#c0c6d0";
      const gradId = `grad-${name.replace(/\s/g, "")}`;

      // Soft cloud
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 50)
        .attr("fill", `url(#${gradId})`);

      // Core circle
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 20)
        .attr("fill", color)
        .attr("fill-opacity", 0.12)
        .attr("stroke", color)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", 1)
        .attr("filter", "url(#glow)");

      // Dot
      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 4)
        .attr("fill", color)
        .attr("fill-opacity", 0.7);

      // Label
      g.append("text")
        .attr("x", xScale(pos[0]))
        .attr("y", yScale(pos[1]) + 32)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("font-family", "Space Grotesk, sans-serif")
        .text(name);

      // Staggered fade in
      g.transition()
        .delay(200 + i * 120)
        .duration(500)
        .attr("opacity", 1);
    });

    // User position — the big reveal
    const userG = svg.append("g").attr("opacity", 0);

    // Outer pulse ring (animated loop)
    const pulseRing = userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 12)
      .attr("fill", "none")
      .attr("stroke", "#c9a84c")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    function pulse() {
      pulseRing
        .attr("r", 12)
        .attr("stroke-opacity", 0.6)
        .transition()
        .duration(2000)
        .ease(d3.easeQuadOut)
        .attr("r", 40)
        .attr("stroke-opacity", 0)
        .on("end", pulse);
    }

    // Soft glow
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 30)
      .attr("fill", "#c9a84c")
      .attr("fill-opacity", 0.08)
      .attr("filter", "url(#pulse-glow)");

    // Core dot
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 7)
      .attr("fill", "#c9a84c")
      .attr("filter", "url(#glow)");

    // Inner bright dot
    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 3)
      .attr("fill", "#e8c84a");

    // "You" label
    userG
      .append("text")
      .attr("x", xScale(data.user_position[0]))
      .attr("y", yScale(data.user_position[1]) - 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#e8c84a")
      .attr("font-size", "13px")
      .attr("font-weight", "700")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("letter-spacing", "0.1em")
      .text("YOU");

    // Dramatic entrance for user dot
    userG
      .transition()
      .delay(600)
      .duration(800)
      .ease(d3.easeBackOut.overshoot(1.5))
      .attr("opacity", 1)
      .on("end", pulse);

  }, [data]);

  return (
    <div className="glass glow-gold rounded-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">
            Digital Mirror
          </h2>
          <p className="mt-1 text-sm text-slate">
            Your build plotted against 120 years of Team USA archetypes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
          <span className="font-heading text-xs font-medium text-gold">LIVE</span>
        </div>
      </div>
      <svg ref={svgRef} className="h-[480px] w-full" />
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {Object.entries(ARCHETYPE_COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
