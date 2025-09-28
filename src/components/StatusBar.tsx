import { Box } from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";
import { useMemo } from "react";
import type { Activity } from "../types/schedule";

function parseISO(date: string): Date | null {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

export function StatusBar() {
  const data = useScheduleStore((s) => s.data);
  const filterSettings = useScheduleStore((s) => s.filterSettings);

  const count = data?.activities.length ?? 0;

  const filteredCount = useMemo(() => {
    const activities = data?.activities ?? [];

    if (!filterSettings.enabled) {
      return count;
    }

    return activities.filter((activity) => {
      // Name filter
      if (
        filterSettings.nameFilter &&
        !activity.name
          .toLowerCase()
          .includes(filterSettings.nameFilter.toLowerCase())
      ) {
        return false;
      }

      // Critical path filter
      if (filterSettings.criticalOnly && !activity.isCritical) {
        return false;
      }

      // Date range filter
      if (filterSettings.dateRange.enabled) {
        const startDate = parseISO(activity.start);
        const finishDate = parseISO(activity.finish);

        if (!startDate || !finishDate) {
          return false;
        }

        if (filterSettings.dateRange.startDate) {
          const filterStart = new Date(filterSettings.dateRange.startDate);
          if (finishDate < filterStart) {
            return false;
          }
        }

        if (filterSettings.dateRange.endDate) {
          const filterEnd = new Date(filterSettings.dateRange.endDate);
          if (startDate > filterEnd) {
            return false;
          }
        }
      }

      return true;
    }).length;
  }, [data?.activities, filterSettings, count]);
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
      py={0.5}
      bgcolor="#34495e"
      color="#fff"
      fontSize={12}
    >
      <Box display="flex" gap={4}>
        <span>
          Activities: {count} [{filteredCount}]
        </span>
        <span>Critical Path: —</span>
        <span>Project Duration: —</span>
      </Box>
      <div>Ready</div>
    </Box>
  );
}
