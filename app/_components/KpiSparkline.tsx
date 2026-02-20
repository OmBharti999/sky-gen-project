"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type SparklineProps = {
  data: number[];
  type?: "area" | "bar";
  color?: string;
  height?: number;
};

export const KpiSparkline: React.FC<SparklineProps> = ({
  data,
  type = "area",
  color = "#2f6fd0",
  height = 60,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 300;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data) || 0])
      .nice()
      .range([innerHeight, 0]);

    if (type === "area") {
      const area = d3
        .area<number>()
        .x((_, i) => x(i))
        .y0(innerHeight)
        .y1((d) => y(d))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", color)
        .attr("opacity", 0.25)
        .attr("d", area);

      const line = d3
        .line<number>()
        .x((_, i) => x(i))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    if (type === "bar") {
      const barWidth = innerWidth / data.length;

      g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (_, i) => x(i))
        .attr("y", (d) => y(d))
        .attr("width", barWidth - 2)
        .attr("height", (d) => innerHeight - y(d))
        .attr("fill", color)
        .attr("opacity", 0.8);
    }
  }, [data, type, color, height]);

  return <svg ref={svgRef} />;
};
