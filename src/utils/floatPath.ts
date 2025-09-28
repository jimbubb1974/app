// Utility to assign float path numbers to activities
// Heuristic: group by totalFloatDays, sort ascending. Lowest float = path 1.

import type { Activity, Relationship } from "../types/schedule";

export type FloatPathAssignment = {
  activityId: string;
  floatPathNumber: number;
  totalFloatDays: number | undefined;
};

export function assignFloatPathNumbers(
  activities: Activity[],
  relationships?: Relationship[]
): FloatPathAssignment[] {
  // Basic approach: rank distinct totalFloatDays values ascending
  // Future improvement: compute true path-based float partitions via network analysis
  const floats = activities.map(
    (a) => a.totalFloatDays ?? Number.POSITIVE_INFINITY
  );
  const uniqueSorted = Array.from(new Set(floats)).sort((a, b) => a - b);

  // Map each float value to a path number starting at 1
  const floatToPath = new Map<number, number>();
  let pathCounter = 1;
  for (const f of uniqueSorted) {
    // Treat Infinity (unknown float) as last path
    if (!floatToPath.has(f)) {
      floatToPath.set(f, pathCounter++);
    }
  }

  return activities.map((a) => ({
    activityId: a.id,
    totalFloatDays: a.totalFloatDays,
    floatPathNumber:
      floatToPath.get(a.totalFloatDays ?? Number.POSITIVE_INFINITY) ||
      uniqueSorted.length,
  }));
}
