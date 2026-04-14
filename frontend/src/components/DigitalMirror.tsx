import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Props {
  data: {
    user_position: number[];
    centroid_positions: Record<string, number[]>;
    distribution_data: Array<{ x: number; y: number; label: string }>;
  };
}

export default function DigitalMirror({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const xScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Archetype centroids
    const centroids = Object.entries(data.centroid_positions);

    // Draw faint connecting lines from user to each centroid
    centroids.forEach(([, pos]) => {
      svg
        .append("line")
        .attr("x1", xScale(data.user_position[0]))
        .attr("y1", yScale(data.user_position[1]))
        .attr("x2", xScale(pos[0]))
        .attr("y2", yScale(pos[1]))
        .attr("stroke", "#c0c6d0")
        .attr("stroke-opacity", 0.08)
        .attr("stroke-width", 1);
    });

    // Draw centroid circles
    centroids.forEach(([name, pos]) => {
      const g = svg.append("g");

      g.append("circle")
        .attr("cx", xScale(pos[0]))
        .attr("cy", yScale(pos[1]))
        .attr("r", 24)
        .attr("fill", "#1a2d4a")
        .attr("stroke", "#c0c6d0")
        .attr("stroke-opacity", 0.15)
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", xScale(pos[0]))
        .attr("y", yScale(pos[1]) + 36)
        .attr("text-anchor", "middle")
        .attr("fill", "#8892a4")
        .attr("font-size", "11px")
        .attr("font-family", "Space Grotesk, sans-serif")
        .text(name);
    });

    // Draw user position — animated entrance
    const userG = svg.append("g");

    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 0)
      .attr("fill", "#c9a84c")
      .attr("fill-opacity", 0.15)
      .transition()
      .duration(1200)
      .ease(d3.easeElasticOut)
      .attr("r", 40);

    userG
      .append("circle")
      .attr("cx", xScale(data.user_position[0]))
      .attr("cy", yScale(data.user_position[1]))
      .attr("r", 0)
      .attr("fill", "#c9a84c")
      .transition()
      .duration(800)
      .delay(200)
      .ease(d3.easeBackOut)
      .attr("r", 8);

    userG
      .append("text")
      .attr("x", xScale(data.user_position[0]))
      .attr("y", yScale(data.user_position[1]) - 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#e8c84a")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("opacity", 0)
      .transition()
      .delay(600)
      .duration(400)
      .attr("opacity", 1)
      .text("You");
  }, [data]);

  return (
    <div className="glass glow-gold rounded-2xl p-6">
      <h2 className="mb-4 font-heading text-lg font-semibold text-white">
        Digital Mirror
      </h2>
      <svg ref={svgRef} className="h-[400px] w-full" />
      <p className="mt-3 text-center text-xs text-slate">
        Your position relative to Team USA archetype clusters — height vs.
        power-to-weight index
      </p>
    </div>
  );
}
