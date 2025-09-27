import { Box, Typography } from "@mui/material";
import { useMemo, useRef, useEffect, useState } from "react";
import { scaleTime, scaleBand } from "d3-scale";
import { extent } from "d3-array";
import { timeDay } from "d3-time";
import { useScheduleStore } from "../state/useScheduleStore";
import type { Activity } from "../types/schedule";

function parseISO(date: string): Date | null {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

export function GanttChart() {
  const data = useScheduleStore((s) => s.data);
  const activities: Activity[] = data?.activities ?? [];

  const parsed = useMemo(() => {
    return activities
      .map((a) => ({
        ...a,
        startDate: parseISO(a.start),
        finishDate: parseISO(a.finish),
      }))
      .filter((a) => a.startDate && a.finishDate) as (Activity & {
      startDate: Date;
      finishDate: Date;
    })[];
  }, [activities]);

  const setExtents = useScheduleStore((s) => s.setExtents);
  const setViewRange = useScheduleStore((s) => s.setViewRange);
  const viewStart = useScheduleStore((s) => s.viewStart);
  const viewEnd = useScheduleStore((s) => s.viewEnd);

  const [minDate, maxDate] = useMemo(() => {
    const ex = extent(parsed.flatMap((a) => [a.startDate, a.finishDate]));
    const start = ex[0] ?? new Date();
    const end =
      ex[1] ??
      new Date(
        start.getTime() +
          timeDay.count(start, new Date(start.getTime() + 7 * 86400000))
      );
    return [start, end] as [Date, Date];
  }, [parsed]);

  const height = Math.max(300, parsed.length * 28 + 80);
  const [chartWidth, setChartWidth] = useState<number>(800);
  const margin = { top: 40, right: 20, bottom: 20, left: 20 };

  // Initialize and keep extents/view in sync
  if (parsed.length > 0) {
    const minMs = minDate.getTime();
    const maxMs = maxDate.getTime();
    setExtents(minMs, maxMs);
    if (viewStart === undefined || viewEnd === undefined) {
      setViewRange(minMs, maxMs);
    }
  }

  const x = useMemo(() => {
    const domainStart = viewStart !== undefined ? new Date(viewStart) : minDate;
    const domainEnd = viewEnd !== undefined ? new Date(viewEnd) : maxDate;
    return scaleTime()
      .domain([domainStart, domainEnd])
      .range([
        margin.left,
        Math.max(margin.left + 200, chartWidth - margin.right),
      ]);
  }, [minDate, maxDate, viewStart, viewEnd, chartWidth]);
  const y = useMemo(
    () =>
      scaleBand()
        .domain(parsed.map((a) => a.id))
        .range([margin.top + 40, height - margin.bottom])
        .padding(0.3),
    [parsed, height]
  );

  // Simple drag-to-pan interaction
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setChartWidth(Math.max(320, cr.width));
      }
    });
    ro.observe(el);
    setChartWidth(Math.max(320, el.clientWidth));
    return () => ro.disconnect();
  }, []);

  // Fallback to window resize listener in case ResizeObserver misses layout changes
  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      setChartWidth(Math.max(320, el.clientWidth));
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  let dragStartX = 0;
  let dragStartView: [number, number] | null = null;

  function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (viewStart === undefined || viewEnd === undefined) return;
    dragStartX = e.clientX;
    dragStartView = [viewStart, viewEnd];
    window.addEventListener("mousemove", onMouseMove as any);
    window.addEventListener("mouseup", onMouseUp as any, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragStartView) return;
    const dx = e.clientX - dragStartX;
    const domain = [
      new Date(dragStartView[0]),
      new Date(dragStartView[1]),
    ] as const;
    const tempScale = scaleTime()
      .domain(domain)
      .range([
        margin.left,
        Math.max(margin.left + 200, chartWidth - margin.right),
      ]);
    // Invert pixel delta to ms delta using local scale slope
    const t0 = tempScale.invert(0).getTime();
    const t1 = tempScale.invert(dx).getTime();
    const deltaMs = t0 - t1; // dragging right moves left in time
    const newStart = dragStartView[0] + deltaMs;
    const newEnd = dragStartView[1] + deltaMs;
    setViewRange(newStart, newEnd);
  }

  function onMouseUp() {
    dragStartView = null;
    window.removeEventListener("mousemove", onMouseMove as any);
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      bgcolor="#fff"
      sx={{ minWidth: 0 }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={1.5}
        py={0.75}
        bgcolor="#ecf0f1"
        borderBottom="1px solid #bdc3c7"
      >
        <Typography fontWeight={700} color="#2c3e50">
          Project Schedule
        </Typography>
      </Box>
      <Box
        position="relative"
        flex={1}
        overflowX="hidden"
        overflowY="auto"
        ref={containerRef}
      >
        <svg
          ref={svgRef}
          width={chartWidth}
          height={height}
          onMouseDown={onMouseDown}
          style={{ cursor: "grab", display: "block" }}
        >
          {/* Timeline header (simple) */}
          <g transform={`translate(0, ${margin.top})`}>
            <line
              x1={margin.left}
              x2={Math.max(margin.left + 200, chartWidth - margin.right)}
              y1={0}
              y2={0}
              stroke="#34495e"
              strokeWidth={2}
            />
            {x.ticks(10).map((t, i) => (
              <g key={i} transform={`translate(${x(t)}, 0)`}>
                <line y1={0} y2={height} stroke="#eee" />
                <text y={-8} textAnchor="middle" fill="#2c3e50" fontSize={12}>
                  {t.toLocaleDateString()}
                </text>
              </g>
            ))}
          </g>

          {/* Bars */}
          {parsed.map((a) => {
            const yPos = y(a.id) ?? 0;
            const xStart = x(a.startDate);
            const xEnd = x(a.finishDate);
            const barWidth = Math.max(2, xEnd - xStart);
            return (
              <g key={a.id}>
                <rect
                  x={xStart}
                  y={yPos}
                  width={barWidth}
                  height={y.bandwidth()}
                  rx={4}
                  fill={a.isCritical ? "#e74c3c" : "#3498db"}
                />
                <text
                  x={xEnd + 6}
                  y={(yPos ?? 0) + y.bandwidth() / 2}
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#2c3e50"
                >
                  {a.name}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}
