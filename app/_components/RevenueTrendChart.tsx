"use client";
import React, { useRef, useEffect } from "react";
import { Card, CardContent, Typography, Divider } from "@mui/material";
import * as d3 from "d3";
import type { RevenueTrendDataPoint } from "@/app/_types";

type Props = {
  title?: string;
  data: RevenueTrendDataPoint[];
  height?: number;
};

export const RevenueTrendChart: React.FC<Props> = ({
  title = "Revenue Trend (Last 6 Months)",
  data,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Use container width for responsiveness
    const containerWidth = containerRef.current.clientWidth || 600;
    const width = containerWidth;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Scales ──────────────────────────────────────────────────────────────

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const yMax =
      d3.max(data, (d) =>
        Math.max(d.revenue ?? 0, d.prevRevenue ?? 0, d.target ?? 0),
      ) ?? 0;

    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.1]) // 10% headroom
      .nice()
      .range([innerHeight, 0]);

    // ── Gridlines ────────────────────────────────────────────────────────────

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => ""),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "rgba(255,255,255,0.06)")
          .attr("stroke-dasharray", "3,3"),
      );

    // ── prevRevenue bars (behind, dimmer) ────────────────────────────────────

    g.selectAll(".bar-prev")
      .data(data.filter((d) => d.prevRevenue !== null))
      .enter()
      .append("rect")
      .attr("class", "bar-prev")
      .attr("x", (d) => x(d.month)!)
      .attr("y", (d) => y(d.prevRevenue!))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.prevRevenue!))
      .attr("fill", "rgba(47, 111, 208, 0.25)")
      .attr("rx", 3);

    // ── Revenue bars (current, front) ────────────────────────────────────────

    g.selectAll(".bar-current")
      .data(data.filter((d) => d.revenue !== null))
      .enter()
      .append("rect")
      .attr("class", "bar-current")
      .attr("x", (d) => x(d.month)!)
      .attr("y", (d) => y(d.revenue!))
      .attr("width", x.bandwidth())
      .attr("height", (d) => innerHeight - y(d.revenue!))
      .attr("fill", "#2f6fd0")
      .attr("rx", 3);

    // ── Target line ──────────────────────────────────────────────────────────

    const targetData = data.filter((d) => d.target !== null);

    const line = d3
      .line<RevenueTrendDataPoint>()
      .defined((d) => d.target !== null)
      .x((d) => x(d.month)! + x.bandwidth() / 2)
      .y((d) => y(d.target!))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", line);

    g.selectAll(".dot-target")
      .data(targetData)
      .enter()
      .append("circle")
      .attr("class", "dot-target")
      .attr("cx", (d) => x(d.month)! + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.target!))
      .attr("r", 4)
      .attr("fill", "#f59e0b")
      .attr("stroke", "#1a1a2e")
      .attr("stroke-width", 1.5);

    // ── Axes ─────────────────────────────────────────────────────────────────

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", "rgba(255,255,255,0.15)"))
      .call((g) =>
        g
          .selectAll("text")
          .attr("fill", "rgba(255,255,255,0.6)")
          .attr("dy", "1.2em"),
      );

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => `${Number(d) / 1000}K`),
      )
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll(".tick line").remove())
      .call((g) => g.selectAll("text").attr("fill", "rgba(255,255,255,0.6)"));

    // ── Tooltip ──────────────────────────────────────────────────────────────

    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#1e2235")
      .style("border", "1px solid rgba(255,255,255,0.12)")
      .style("border-radius", "8px")
      .style("padding", "10px 14px")
      .style("font-size", "12px")
      .style("color", "#fff")
      .style("line-height", "1.8")
      .style("box-shadow", "0 4px 20px rgba(0,0,0,0.4)")
      .style("opacity", "0")
      .style("transition", "opacity 0.15s ease");

    function formatVal(v: number | null) {
      if (v === null) return "—";
      return v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(2)}M`
        : `$${(v / 1_000).toFixed(1)}K`;
    }

    function deltaLabel(current: number | null, prev: number | null) {
      if (current === null || prev === null || prev === 0) return "";
      const pct = ((current - prev) / prev) * 100;
      const sign = pct >= 0 ? "▲" : "▼";
      const color = pct >= 0 ? "#4ade80" : "#f87171";
      return `<span style="color:${color}">${sign} ${Math.abs(pct).toFixed(1)}% YoY</span>`;
    }

    // Invisible hover rects for each month
    g.selectAll(".hover-rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "hover-rect")
      .attr("x", (d) => x(d.month)!)
      .attr("y", 0)
      .attr("width", x.bandwidth())
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", "1").html(
          `<strong style="font-size:13px">${d.month}</strong><br/>
           <span style="color:#2f6fd0">■</span> Revenue: ${formatVal(d.revenue)}<br/>
           <span style="color:rgba(47,111,208,0.45)">■</span> Prev Year: ${formatVal(d.prevRevenue)}<br/>
           <span style="color:#f59e0b">■</span> Target: ${formatVal(d.target)}<br/>
           ${deltaLabel(d.revenue, d.prevRevenue)}`,
        );
      })
      .on("mousemove", function (event) {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip.style("left", `${mx + 14}px`).style("top", `${my - 10}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", "0");
      });

    return () => {
      tooltip.remove();
    };
  }, [data, height]);

  return (
    <Card elevation={1} sx={{ borderRadius: 2, background: "#0f1117" }}>
      <CardContent>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          gutterBottom
          sx={{ color: "#fff" }}
        >
          {title}
        </Typography>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 12,
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>
            <span style={{ color: "#2f6fd0" }}>■</span> Revenue
          </span>
          <span>
            <span style={{ color: "rgba(47,111,208,0.45)" }}>■</span> Prev Year
          </span>
          <span>
            <span style={{ color: "#f59e0b" }}>●</span> Target
          </span>
        </div>

        <div ref={containerRef} style={{ position: "relative" }}>
          <svg ref={svgRef} style={{ width: "100%", overflow: "visible" }} />
        </div>
      </CardContent>
    </Card>
  );
};
