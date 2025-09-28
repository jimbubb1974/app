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

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance using the standard formula
  // Convert to sRGB values (0-1 range)
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

  // Use a lower threshold for better dark color detection
  // Colors with luminance < 0.4 are considered dark and should use white text
  return luminance > 0.4;
}

// Helper function to get appropriate text color for bar labels
function getBarLabelColor(activity: Activity): {
  fill: string;
  stroke: string;
  strokeWidth: string;
} {
  const barColor =
    activity.customColor || (activity.isCritical ? "#e74c3c" : "#3498db");

  if (isLightColor(barColor)) {
    // Light bar - use black text without stroke
    return {
      fill: "#000000",
      stroke: "none",
      strokeWidth: "0",
    };
  } else {
    // Dark bar - use white text without stroke
    return {
      fill: "#ffffff",
      stroke: "none",
      strokeWidth: "0",
    };
  }
}

// Helper functions for label positioning
function getLabelX(activity: Activity, xStart: number, xEnd: number): number {
  const position = activity.labelPosition || "right";
  switch (position) {
    case "left":
      return xStart - 6; // Right justified, against the bar
    case "right":
      return xEnd + 6; // Left justified, close to the bar
    case "top":
    case "bottom":
      return xStart; // Left justified to the leftmost side of the bar
    case "bar":
      return xStart + 4; // Left justified, inside the bar with small margin
    default:
      return xEnd + 6;
  }
}

function getLabelY(
  activity: Activity,
  yPos: number,
  bandwidth: number
): number {
  const position = activity.labelPosition || "right";
  switch (position) {
    case "left":
    case "right":
      return yPos + bandwidth / 2; // Middle of the bar
    case "top":
      return yPos - 4; // Above the bar
    case "bottom":
      return yPos + bandwidth + 12; // Below the bar
    case "bar":
      return yPos + bandwidth / 2; // Middle of the bar
    default:
      return yPos + bandwidth / 2;
  }
}

function getLabelBaseline(activity: Activity): "middle" | "hanging" {
  const position = activity.labelPosition || "right";
  switch (position) {
    case "left":
    case "right":
      return "middle";
    case "top":
      return "middle";
    case "bottom":
      return "hanging";
    case "bar":
      return "middle";
    default:
      return "middle";
  }
}

function getLabelAnchor(activity: Activity): "start" | "end" {
  const position = activity.labelPosition || "right";
  switch (position) {
    case "left":
      return "end"; // Right justified
    case "right":
    case "top":
    case "bottom":
      return "start"; // Left justified
    case "bar":
      return "start"; // Left justified inside the bar
    default:
      return "start";
  }
}

// Helper function to determine if an activity is critical based on settings
function isActivityCritical(activity: Activity, settings: any): boolean {
  if (!settings.enabled) return false;

  if (settings.criteria === "isCritical") {
    return activity.isCritical === true;
  } else if (settings.criteria === "totalFloat") {
    return (
      activity.totalFloatDays !== undefined &&
      activity.totalFloatDays <= settings.floatThreshold
    );
  }

  return false;
}

// Helper function to format timeline text based on settings
function formatTimelineText(
  date: Date,
  settings: any,
  isTopTier: boolean,
  timescaleTop: string,
  timescaleBottom: string
): string {
  if (!settings.enabled) {
    // Default formatting based on timescale structure
    if (isTopTier) {
      return timescaleTop === "year"
        ? date.getFullYear().toString()
        : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else {
      return timescaleBottom === "month"
        ? date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }

  const activeFormat = isTopTier
    ? settings.topTierFormat
    : settings.bottomTierFormat;
  const activeCustomFormat = isTopTier
    ? settings.topTierCustomFormat
    : settings.bottomTierCustomFormat;

  if (isTopTier) {
    // Top tier formatting based on selected type
    switch (activeFormat) {
      case "full":
        return timescaleTop === "year"
          ? date.getFullYear().toString()
          : date.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
      case "abbreviated":
        return timescaleTop === "year"
          ? date.getFullYear().toString().slice(-2)
          : date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            });
      case "short":
        return timescaleTop === "year"
          ? date.getFullYear().toString().slice(-2)
          : date.toLocaleDateString("en-US", { month: "short" });
      case "numeric":
        return timescaleTop === "year"
          ? date.getFullYear().toString()
          : `${date.getMonth() + 1}/${date.getFullYear()}`;
      case "custom":
        if (!activeCustomFormat) return "Custom format";
        return activeCustomFormat
          .replace("MM", (date.getMonth() + 1).toString().padStart(2, "0"))
          .replace("DD", date.getDate().toString().padStart(2, "0"))
          .replace("YYYY", date.getFullYear().toString())
          .replace("YY", date.getFullYear().toString().slice(-2));
      default:
        return timescaleTop === "year"
          ? date.getFullYear().toString()
          : date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
    }
  } else {
    // Bottom tier formatting based on selected type
    switch (activeFormat) {
      case "full":
        return timescaleBottom === "month"
          ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
          : `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      case "abbreviated":
        return timescaleBottom === "month"
          ? date.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
      case "short":
        return timescaleBottom === "month"
          ? date.toLocaleDateString("en-US", { month: "short" })
          : date.toLocaleDateString("en-US", { day: "numeric" });
      case "numeric":
        return timescaleBottom === "month"
          ? `${date.getMonth() + 1}/${date.getFullYear()}`
          : `${date.getMonth() + 1}/${date.getDate()}`;
      case "custom":
        if (!activeCustomFormat) return "Custom format";
        return activeCustomFormat
          .replace("MM", (date.getMonth() + 1).toString().padStart(2, "0"))
          .replace("DD", date.getDate().toString().padStart(2, "0"))
          .replace("YYYY", date.getFullYear().toString())
          .replace("YY", date.getFullYear().toString().slice(-2));
      default:
        return timescaleBottom === "month"
          ? date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
    }
  }
}

export function GanttChart() {
  const data = useScheduleStore((s) => s.data);
  const activities: Activity[] = data?.activities ?? [];
  const settings = useScheduleStore((s) => s.settings);
  const criticalPathSettings = useScheduleStore((s) => s.criticalPathSettings);
  const timelineFormatSettings = useScheduleStore(
    (s) => s.timelineFormatSettings
  );
  const timescaleTop = useScheduleStore((s) => s.timescaleTop);
  const timescaleBottom = useScheduleStore((s) => s.timescaleBottom);
  const selectedActivityIds = useScheduleStore((s) => s.selectedActivityIds);
  const setSelectedActivity = useScheduleStore((s) => s.setSelectedActivity);
  const toggleActivitySelection = useScheduleStore(
    (s) => s.toggleActivitySelection
  );
  const logicLinesEnabled = useScheduleStore((s) => s.logicLinesEnabled);

  //

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
  const tsTop = useScheduleStore((s) => s.timescaleTop);
  const tsBottom = useScheduleStore((s) => s.timescaleBottom);

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

  const DISABLE_CLIP = true; // keep clip disabled; header overlay handles clipping reliably

  const headerHeight = 56; // two-tier header
  const monthRowHeight = 24; // upper row height to keep week lines below months
  const height = Math.max(
    300,
    parsed.length * settings.activitySpacing + headerHeight + 40
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vScroll, setVScroll] = useState<number>(0);
  const dragStartVScrollRef = useRef(0);
  const clipId = useMemo(
    () => `gclip-${Math.random().toString(36).slice(2)}`,
    []
  );
  const [chartWidth, setChartWidth] = useState<number>(800);
  const margin = { top: 16, right: 20, bottom: 20, left: 20 };

  // Keep extents in sync (effect to avoid setState during render)
  useEffect(() => {
    if (parsed.length === 0) return;
    const minMs = minDate.getTime();
    const maxMs = maxDate.getTime();
    setExtents(minMs, maxMs);
  }, [parsed, minDate, maxDate, setExtents]);

  // Initialize view range if not set yet
  useEffect(() => {
    if (parsed.length === 0) return;
    if (viewStart === undefined || viewEnd === undefined) {
      const minMs = minDate.getTime();
      const maxMs = maxDate.getTime();
      setViewRange(minMs, maxMs);
    }
  }, [parsed, viewStart, viewEnd, minDate, maxDate, setViewRange]);

  // Reset manual vertical scroll when dataset changes
  useEffect(() => {
    setVScroll(0);
    dragStartVScrollRef.current = 0;
  }, [parsed.length]);

  //

  const x = useMemo(() => {
    const domainStart = viewStart !== undefined ? new Date(viewStart) : minDate;
    const domainEnd = viewEnd !== undefined ? new Date(viewEnd) : maxDate;
    return scaleTime()
      .domain([domainStart, domainEnd])
      .range([
        margin.left,
        Math.max(margin.left + 200, Math.floor(chartWidth) - margin.right),
      ]);
  }, [minDate, maxDate, viewStart, viewEnd, chartWidth]);
  const y = useMemo(
    () =>
      scaleBand()
        .domain(parsed.map((a) => a.id))
        .range([
          0,
          Math.max(0, height - margin.bottom - (margin.top + headerHeight)),
        ])
        .padding(0.3),
    [parsed, height, settings.activitySpacing]
  );

  //

  // Simple drag-to-pan interaction
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setChartWidth(Math.max(320, Math.floor(cr.width)));
        //
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
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartViewRef = useRef<[number, number] | null>(null);
  const dragStartScrollTopRef = useRef(0);
  const dragButtonRef = useRef<number>(0);
  const dragModeRef = useRef<"horizontal" | "vertical">("horizontal");

  function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (viewStart === undefined || viewEnd === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    dragButtonRef.current = e.button; // 0=left, 1=middle, 2=right
    dragModeRef.current =
      e.button === 1 || e.shiftKey ? "vertical" : "horizontal";
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    dragStartViewRef.current = [viewStart, viewEnd];
    const container = containerRef.current;
    dragStartScrollTopRef.current = container ? container.scrollTop : 0;
    dragStartVScrollRef.current = vScroll;
    window.addEventListener("mousemove", onMouseMove as any, {
      passive: false,
    });
    window.addEventListener("mouseup", onMouseUp as any, { once: true });
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragStartViewRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartXRef.current;
    const dy = e.clientY - dragStartYRef.current;

    // Vertical-only panning (middle mouse OR Shift+left)
    if (dragModeRef.current === "vertical") {
      const container = containerRef.current;
      const headerOffset = margin.top + headerHeight;
      const visibleHeight = Math.max(
        0,
        (container?.clientHeight ?? height) - headerOffset - margin.bottom
      );
      const contentHeight = y.range()[1];
      const maxScroll = Math.max(0, contentHeight - visibleHeight);
      const unclamped = dragStartVScrollRef.current - dy;
      const next = Math.max(0, Math.min(maxScroll, unclamped));
      setVScroll(next);
      return;
    }

    // Horizontal panning (time)
    if (dragModeRef.current === "horizontal") {
      const domain = [
        new Date(dragStartViewRef.current[0]),
        new Date(dragStartViewRef.current[1]),
      ] as const;
      const tempScale = scaleTime()
        .domain(domain)
        .range([
          margin.left,
          Math.max(margin.left + 200, chartWidth - margin.right),
        ]);
      const t0 = tempScale.invert(0).getTime();
      const t1 = tempScale.invert(dx).getTime();
      const deltaMs = t0 - t1; // dragging right moves left in time
      const newStart = dragStartViewRef.current[0] + deltaMs;
      const newEnd = dragStartViewRef.current[1] + deltaMs;
      setViewRange(newStart, newEnd);
    }
  }

  function onMouseUp() {
    dragStartViewRef.current = null;
    window.removeEventListener("mousemove", onMouseMove as any);
  }

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    // Zoom only when Ctrl or Shift is held to preserve normal vertical scrolling
    if (!e.ctrlKey && !e.shiftKey) return;
    e.preventDefault();
    if (viewStart === undefined || viewEnd === undefined) return;
    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerDate = x.invert(mouseX);
    const center = centerDate.getTime();
    const half = ((viewEnd - viewStart) / 2) * factor;
    const newStart = center - half;
    const newEnd = center + half;
    setViewRange(newStart, newEnd);
  }

  // Build two-tier header segments (configurable)
  const headerSegments = useMemo(() => {
    const start = viewStart !== undefined ? new Date(viewStart) : minDate;
    const end = viewEnd !== undefined ? new Date(viewEnd) : maxDate;
    // Weeks (Sunday-based)
    const weeks: { start: Date; end: Date; label: string }[] = [];
    const w0 = new Date(start);
    w0.setHours(0, 0, 0, 0);
    w0.setDate(w0.getDate() - w0.getDay()); // back to Sunday
    let ws = w0;
    while (ws < end) {
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      weeks.push({
        start: new Date(Math.max(ws.getTime(), start.getTime())),
        end: new Date(Math.min(we.getTime(), end.getTime())),
        label: formatTimelineText(
          ws,
          timelineFormatSettings,
          false, // weeks are always bottom tier
          timescaleTop,
          timescaleBottom
        ),
      });
      ws = we;
    }
    // Month groupings aligned to full week boundaries (week belongs to the month it starts in)
    const months: { start: Date; end: Date; label: string }[] = [];
    if (weeks.length > 0) {
      let i = 0;
      while (i < weeks.length) {
        const first = weeks[i];
        const monthKey = `${first.start.getFullYear()}-${first.start.getMonth()}`;
        const segStart = first.start;
        let j = i;
        while (
          j + 1 < weeks.length &&
          `${weeks[j + 1].start.getFullYear()}-${weeks[j + 1].start.getMonth()}` ===
            monthKey
        ) {
          j += 1;
        }
        const segEnd = weeks[j].end;
        const label = formatTimelineText(
          first.start,
          timelineFormatSettings,
          timescaleTop === "month", // true if months are the top tier
          timescaleTop,
          timescaleBottom
        );
        months.push({ start: segStart, end: segEnd, label });
        i = j + 1;
      }
    }
    // Years from months
    const years: { start: Date; end: Date; label: string }[] = [];
    if (months.length > 0) {
      let i = 0;
      while (i < months.length) {
        const y = months[i].start.getFullYear();
        const segStart = months[i].start;
        let j = i;
        while (
          j + 1 < months.length &&
          months[j + 1].start.getFullYear() === y
        ) {
          j += 1;
        }
        const segEnd = months[j].end;
        const label = formatTimelineText(
          new Date(y, 0, 1), // Create a date for the year
          timelineFormatSettings,
          true, // years are always top tier
          timescaleTop,
          timescaleBottom
        );
        years.push({ start: segStart, end: segEnd, label });
        i = j + 1;
      }
    }
    // Choose rows based on settings
    const top = tsTop === "year" ? years : months;
    const bottom = tsBottom === "month" ? months : weeks;
    return { top, bottom };
  }, [
    viewStart,
    viewEnd,
    minDate,
    maxDate,
    tsTop,
    tsBottom,
    timelineFormatSettings,
    timescaleTop,
    timescaleBottom,
  ]);

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
        ref={containerRef}
        sx={{
          minWidth: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          overflowY: "hidden",
        }}
      >
        <svg
          ref={svgRef}
          width={Math.floor(chartWidth)}
          height={height}
          data-export-id="gantt"
          onMouseDown={onMouseDown}
          onAuxClick={() => {}}
          onWheel={onWheel}
          style={{ cursor: "grab", display: "block" }}
        >
          {/* clip path intentionally unused; header overlay ensures bars cannot cover the timescale */}
          {/* Draw grid lines behind bars (weeks/months) before bars layer */}
          <g transform={`translate(0, ${margin.top})`}>
            {headerSegments.bottom.map((seg, i) => {
              const x1 = x(seg.start);
              return (
                <line
                  key={`grid-${i}`}
                  x1={x1}
                  x2={x1}
                  y1={monthRowHeight}
                  y2={height}
                  stroke="#eee"
                />
              );
            })}
            {/* solid mask above the timescale to cover any bleed from below */}
            <rect
              x={0}
              y={-margin.top}
              width={Math.floor(chartWidth)}
              height={margin.top}
              fill="#f5f5f5"
            />
          </g>

          {/* Logic Lines - behind bars */}
          {logicLinesEnabled && data?.relationships && (
            <g
              transform={`translate(0, ${margin.top + headerHeight - Math.floor(vScroll)})`}
              style={{ pointerEvents: "none" }}
            >
              {data.relationships.map((rel, i) => {
                const predecessor = parsed.find(
                  (a) => a.id === rel.predecessorId
                );
                const successor = parsed.find((a) => a.id === rel.successorId);

                if (!predecessor || !successor) return null;

                const predY = y(predecessor.id) ?? 0;
                const succY = y(successor.id) ?? 0;
                const predFinishX = x(predecessor.finishDate);
                const succStartX = x(successor.startDate);

                // Calculate connection points
                const predCenterY = predY + y.bandwidth() / 2;
                const succCenterY = succY + y.bandwidth() / 2;

                return (
                  <g key={`logic-${i}`}>
                    {/* Horizontal dotted line from predecessor finish to successor start */}
                    <line
                      x1={predFinishX}
                      y1={predCenterY}
                      x2={succStartX}
                      y2={predCenterY}
                      stroke="#7f8c8d"
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                    {/* Vertical solid line from horizontal line to successor start */}
                    <line
                      x1={succStartX}
                      y1={predCenterY}
                      x2={succStartX}
                      y2={succCenterY}
                      stroke="#7f8c8d"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Bars layer: vertically translated; draw behind header overlay */}
          <g
            {...(DISABLE_CLIP ? {} : ({ clipPath: `url(#${clipId})` } as any))}
            transform={`translate(0, ${margin.top + headerHeight - Math.floor(vScroll)})`}
            style={{ pointerEvents: "auto" }}
          >
            {parsed.map((a, i) => {
              const yPos = y(a.id) ?? 0;
              const xStart = x(a.startDate);
              const xEnd = x(a.finishDate);
              const barWidth = Math.max(2, xEnd - xStart);
              const isCritical = isActivityCritical(a, criticalPathSettings);

              // Determine bar color based on critical path settings
              let barColor = a.customColor || "#3498db";
              if (
                isCritical &&
                criticalPathSettings.displayMethod === "color"
              ) {
                barColor = criticalPathSettings.criticalColor;
              }

              // Determine stroke properties
              let strokeColor = "none";
              let strokeWidth = 0;
              let strokeDasharray = "none";

              if (selectedActivityIds.includes(a.id)) {
                strokeColor = "#2c3e50";
                strokeWidth = 3;
              } else if (a.barStyle === "dashed" || a.barStyle === "dotted") {
                strokeColor = barColor;
                strokeWidth = 2;
                strokeDasharray = a.barStyle === "dashed" ? "5,5" : "2,2";
              } else if (
                isCritical &&
                criticalPathSettings.displayMethod === "outline"
              ) {
                strokeColor = criticalPathSettings.outlineColor;
                strokeWidth = criticalPathSettings.outlineWidth;
              }

              return (
                <g key={`${a.id}-${i}`}>
                  <rect
                    x={xStart}
                    y={
                      yPos +
                      (y.bandwidth() -
                        (a.customBarHeight || settings.barHeight)) /
                        2
                    }
                    width={barWidth}
                    height={a.customBarHeight || settings.barHeight}
                    rx={4}
                    fill={barColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        toggleActivitySelection(a.id);
                      } else {
                        setSelectedActivity(a.id);
                      }
                    }}
                  />
                  {a.labelPosition !== "none" &&
                    (() => {
                      const isBarLabel = a.labelPosition === "bar";
                      const textColors = isBarLabel
                        ? getBarLabelColor(a)
                        : { fill: "#2c3e50", stroke: "none", strokeWidth: "0" };

                      return (
                        <text
                          x={getLabelX(a, xStart, xEnd)}
                          y={getLabelY(a, yPos ?? 0, y.bandwidth())}
                          dominantBaseline={getLabelBaseline(a)}
                          textAnchor={getLabelAnchor(a)}
                          fontSize={a.customFontSize || settings.fontSize}
                          fontFamily={a.customFontFamily || settings.fontFamily}
                          fill={textColors.fill}
                          stroke={textColors.stroke}
                          strokeWidth={textColors.strokeWidth}
                          fontWeight={isBarLabel ? "bold" : "normal"}
                        >
                          {a.name}
                        </text>
                      );
                    })()}
                </g>
              );
            })}
          </g>

          {/* Header overlay: always on top to mask bars underneath */}
          <g
            transform={`translate(0, ${margin.top})`}
            style={{ pointerEvents: "none" }}
          >
            {/* fill gap above timescale to prevent any peek-through */}
            <rect
              x={0}
              y={-margin.top}
              width={Math.floor(chartWidth)}
              height={margin.top}
              fill="#ecf0f1"
            />
            {/* background mask to ensure bars never show through the timescale */}
            <rect
              x={0}
              y={0}
              width={Math.floor(chartWidth)}
              height={headerHeight}
              fill="#fff"
            />
            {/* Top row (Year or Month) */}
            {headerSegments.top.map((seg, i) => {
              const x1 = x(seg.start);
              const x2 = x(seg.end);
              const cx = (x1 + x2) / 2;
              return (
                <g key={`m2-${i}`}>
                  <text
                    x={cx}
                    y={14}
                    textAnchor="middle"
                    fill="#2c3e50"
                    fontSize={settings.fontSize}
                    fontFamily={settings.fontFamily}
                    fontWeight={600}
                  >
                    {seg.label}
                  </text>
                  <line
                    x1={x2}
                    x2={x2}
                    y1={0}
                    y2={headerHeight}
                    stroke="#bdc3c7"
                  />
                </g>
              );
            })}
            {/* Bottom row (Month or Week) */}
            {headerSegments.bottom.map((seg, i) => {
              const x1 = x(seg.start);
              const x2 = x(seg.end);
              const cx = (x1 + x2) / 2;
              return (
                <g key={`w2-${i}`}>
                  <text
                    x={cx}
                    y={monthRowHeight + 12}
                    textAnchor="middle"
                    fill="#7f8c8d"
                    fontSize={settings.fontSize - 1}
                    fontFamily={settings.fontFamily}
                  >
                    {seg.label}
                  </text>
                  {/* separator inside header only (avoid overlaying bars) */}
                  <line
                    x1={x1}
                    x2={x1}
                    y1={monthRowHeight}
                    y2={headerHeight}
                    stroke="#eee"
                  />
                </g>
              );
            })}
            {/* baseline under header */}
            <line
              x1={margin.left}
              x2={Math.max(
                margin.left + 200,
                Math.floor(chartWidth) - margin.right
              )}
              y1={headerHeight}
              y2={headerHeight}
              stroke="#34495e"
              strokeWidth={2}
            />
          </g>
        </svg>
      </Box>
    </Box>
  );
}
