"use client";
import React, { useRef, useEffect } from "react";
import { Card, CardContent, Typography, Divider } from "@mui/material";
import * as d3 from "d3";

type DataPoint = {
  month: string;
  revenue: number;
  target: number;
};

type Props = {
  title?: string;
  data: DataPoint[];
  height?: number;
};

export const RevenueTrendChart: React.FC<Props> = ({
  title = "Revenue Trend (Last 6 Months)",
  data,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const margin = { top: 20, right: 40, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear previous render

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    // Y Scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.revenue, d.target)) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Bars (Revenue)
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.month)!)
      .attr("y", (d) => y(d.revenue))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.revenue))
      .attr("fill", "#2f6fd0")
      .attr("rx", 4);

    // Line Generator (Target)
    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.month)! + x.bandwidth() / 2)
      .y((d) => y(d.target))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Line Dots
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.month)! + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.target))
      .attr("r", 4)
      .attr("fill", "#f59e0b");

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    // Y Axis
    g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `${d}K`),
    );
  }, [data, height]);

  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <svg ref={svgRef} />
      </CardContent>
    </Card>
  );
};
