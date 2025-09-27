import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { scaleTime, scaleBand } from 'd3-scale';
import { extent } from 'd3-array';
import { timeDay } from 'd3-time';
import { useScheduleStore } from '../state/useScheduleStore';
import type { Activity } from '../types/schedule';

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

  const [minDate, maxDate] = useMemo(() => {
    const ex = extent(parsed.flatMap((a) => [a.startDate, a.finishDate]));
    const start = ex[0] ?? new Date();
    const end = ex[1] ?? new Date(start.getTime() + timeDay.count(start, new Date(start.getTime() + 7 * 86400000)));
    return [start, end] as [Date, Date];
  }, [parsed]);

  const height = Math.max(300, parsed.length * 28 + 80);
  const width = 1200;
  const margin = { top: 40, right: 20, bottom: 20, left: 20 };

  const x = useMemo(() => scaleTime().domain([minDate, maxDate]).range([margin.left, width - margin.right]), [minDate, maxDate]);
  const y = useMemo(() => scaleBand().domain(parsed.map((a) => a.id)).range([margin.top + 40, height - margin.bottom]).padding(0.3), [parsed, height]);

  return (
    <Box display="flex" flexDirection="column" flex={1} bgcolor="#fff">
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={1} bgcolor="#ecf0f1" borderBottom="1px solid #bdc3c7">
        <Typography fontWeight={700} color="#2c3e50">Project Schedule</Typography>
      </Box>
      <Box position="relative" flex={1} overflow="auto">
        <svg width={width} height={height}>
          {/* Timeline header (simple) */}
          <g transform={`translate(0, ${margin.top})`}>
            <line x1={margin.left} x2={width - margin.right} y1={0} y2={0} stroke="#34495e" strokeWidth={2} />
            {x.ticks(10).map((t, i) => (
              <g key={i} transform={`translate(${x(t)}, 0)`}>
                <line y1={0} y2={height} stroke="#eee" />
                <text y={-8} textAnchor="middle" fill="#2c3e50" fontSize={12}>{t.toLocaleDateString()}</text>
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
                <rect x={xStart} y={yPos} width={barWidth} height={y.bandwidth()} rx={4} fill={a.isCritical ? '#e74c3c' : '#3498db'} />
                <text x={xEnd + 6} y={(yPos ?? 0) + y.bandwidth() / 2} dominantBaseline="middle" fontSize={11} fill="#2c3e50">{a.name}</text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}


