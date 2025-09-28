// Auto-Layout Optimization Engine
// Generates optimized layout candidates from analysis opportunities

export interface LayoutCandidate {
  id: string;
  name: string;
  description: string;
  spaceSavings: number;
  activities: Array<{
    id: string;
    originalRow: number;
    optimizedRow: number;
    rowChange: number;
  }>;
  constraints: string[];
  score: number;
  algorithm:
    | "maximum_compression"
    | "balanced"
    | "structure_preserving"
    | "critical_path_focus";
}

export interface OptimizationResult {
  candidates: LayoutCandidate[];
  bestCandidate: LayoutCandidate | null;
  totalSpaceSavings: number;
  processingTime: number;
  algorithm: string;
}

export interface OptimizationConstraints {
  maxRowChanges: number;
  preserveWBSGrouping: boolean;
  preserveCriticalPath: boolean;
  minGapDuration: number; // days
  maxConcurrentActivities: number;
}

/**
 * Generate optimized layout candidates using different algorithms
 */
export function generateLayoutCandidates(
  activities: any[],
  opportunities: any[],
  constraints: OptimizationConstraints = {
    maxRowChanges: 100,
    preserveWBSGrouping: true,
    preserveCriticalPath: true,
    minGapDuration: 1,
    maxConcurrentActivities: 3,
  }
): OptimizationResult {
  const startTime = Date.now();

  const candidates: LayoutCandidate[] = [];

  // Algorithm 1: Maximum Compression
  const maxCompression = generateMaximumCompressionLayout(
    activities,
    opportunities,
    constraints
  );
  if (maxCompression) candidates.push(maxCompression);

  // Algorithm 2: Balanced Optimization (default)
  const balanced = generateBalancedLayout(
    activities,
    opportunities,
    constraints
  );
  if (balanced) candidates.push(balanced);

  // Algorithm 3: Structure Preserving
  const structurePreserving = generateStructurePreservingLayout(
    activities,
    opportunities,
    constraints
  );
  if (structurePreserving) candidates.push(structurePreserving);

  // Algorithm 4: Critical Path Focus
  const criticalPathFocus = generateCriticalPathFocusLayout(
    activities,
    opportunities,
    constraints
  );
  if (criticalPathFocus) candidates.push(criticalPathFocus);

  // Score and rank candidates
  const scoredCandidates = scoreCandidates(candidates);
  const bestCandidate =
    scoredCandidates.length > 0 ? scoredCandidates[0] : null;

  const processingTime = Date.now() - startTime;

  return {
    candidates: scoredCandidates,
    bestCandidate,
    totalSpaceSavings: bestCandidate?.spaceSavings || 0,
    processingTime,
    algorithm: "multi_algorithm",
  };
}

/**
 * Maximum Compression Algorithm - Aggressive space savings
 */
function generateMaximumCompressionLayout(
  activities: any[],
  opportunities: any[],
  constraints: OptimizationConstraints
): LayoutCandidate | null {
  const rowSharingOpportunities = opportunities.filter(
    (opp) => opp.type === "row_sharing"
  );

  const appliedChanges: Array<{ activityId: string; newRow: number }> = [];
  let spaceSavings = 0;

  // Sort opportunities by space savings (descending)
  const sortedOpportunities = rowSharingOpportunities
    .sort((a, b) => b.spaceSavings - a.spaceSavings)
    .slice(0, constraints.maxRowChanges);

  for (const opportunity of sortedOpportunities) {
    const [activity1, activity2] = opportunity.activities;
    // Check if activities can be moved to the same row
    if (canApplyRowSharing(activity1, activity2, appliedChanges, activities)) {
      const targetRow = findOptimalRow(
        activity1,
        activity2,
        appliedChanges,
        activities
      );

      appliedChanges.push(
        { activityId: activity1, newRow: targetRow },
        { activityId: activity2, newRow: targetRow }
      );

      spaceSavings += opportunity.spaceSavings;
    }
  }

  if (appliedChanges.length === 0) return null;

  return {
    id: "max_compression",
    name: "Maximum Compression",
    description: "Aggressive space optimization with maximum row sharing",
    spaceSavings,
    activities: appliedChanges.map((change) => ({
      id: change.activityId,
      originalRow: getOriginalRow(change.activityId, activities),
      optimizedRow: change.newRow,
      rowChange: change.newRow - getOriginalRow(change.activityId, activities),
    })),
    constraints: ["time_overlap_prevention"],
    score: calculateScore(
      spaceSavings,
      appliedChanges.length,
      "maximum_compression"
    ),
    algorithm: "maximum_compression",
  };
}

/**
 * Balanced Optimization Algorithm - Good balance of space savings and readability
 */
function generateBalancedLayout(
  activities: any[],
  opportunities: any[],
  constraints: OptimizationConstraints
): LayoutCandidate | null {
  const rowSharingOpportunities = opportunities.filter(
    (opp) => opp.type === "row_sharing"
  );
  const appliedChanges: Array<{ activityId: string; newRow: number }> = [];
  let spaceSavings = 0;

  // Filter opportunities by gap duration and constraints
  const filteredOpportunities = rowSharingOpportunities
    .filter((opp) =>
      opp.activities.every((id: string) => {
        const activity = activities.find((a) => a.id === id);
        return activity && !activity.isCritical; // Don't move critical path activities
      })
    )
    .sort((a, b) => b.spaceSavings - a.spaceSavings)
    .slice(0, Math.min(50, constraints.maxRowChanges)); // Limit to 50 changes for balance

  for (const opportunity of filteredOpportunities) {
    const [activity1, activity2] = opportunity.activities;

    if (canApplyRowSharing(activity1, activity2, appliedChanges, activities)) {
      const targetRow = findOptimalRow(
        activity1,
        activity2,
        appliedChanges,
        activities
      );

      appliedChanges.push(
        { activityId: activity1, newRow: targetRow },
        { activityId: activity2, newRow: targetRow }
      );

      spaceSavings += opportunity.spaceSavings;
    }
  }

  if (appliedChanges.length === 0) return null;

  return {
    id: "balanced",
    name: "Balanced Optimization",
    description:
      "Balanced approach optimizing space while maintaining readability",
    spaceSavings,
    activities: appliedChanges.map((change) => ({
      id: change.activityId,
      originalRow: getOriginalRow(change.activityId, activities),
      optimizedRow: change.newRow,
      rowChange: change.newRow - getOriginalRow(change.activityId, activities),
    })),
    constraints: ["critical_path_preservation", "readability_maintenance"],
    score: calculateScore(spaceSavings, appliedChanges.length, "balanced"),
    algorithm: "balanced",
  };
}

/**
 * Structure Preserving Algorithm - Maintains WBS grouping
 */
function generateStructurePreservingLayout(
  activities: any[],
  opportunities: any[],
  constraints: OptimizationConstraints
): LayoutCandidate | null {
  // Group activities by WBS or similar structure
  const groupedActivities = groupActivitiesByStructure(activities);
  const appliedChanges: Array<{ activityId: string; newRow: number }> = [];
  let spaceSavings = 0;

  // Only apply optimizations within the same group
  for (const group of groupedActivities) {
    const groupOpportunities = opportunities.filter(
      (opp) =>
        opp.type === "row_sharing" &&
        opp.activities.every((id: string) =>
          group.some((activity) => activity.id === id)
        )
    );

    for (const opportunity of groupOpportunities.slice(0, 10)) {
      // Limit per group
      const [activity1, activity2] = opportunity.activities;

      if (
        canApplyRowSharing(activity1, activity2, appliedChanges, activities)
      ) {
        const targetRow = findOptimalRow(
          activity1,
          activity2,
          appliedChanges,
          activities
        );

        appliedChanges.push(
          { activityId: activity1, newRow: targetRow },
          { activityId: activity2, newRow: targetRow }
        );

        spaceSavings += opportunity.spaceSavings;
      }
    }
  }

  if (appliedChanges.length === 0) return null;

  return {
    id: "structure_preserving",
    name: "Structure Preserving",
    description: "Maintains WBS grouping while optimizing space",
    spaceSavings,
    activities: appliedChanges.map((change) => ({
      id: change.activityId,
      originalRow: getOriginalRow(change.activityId, activities),
      optimizedRow: change.newRow,
      rowChange: change.newRow - getOriginalRow(change.activityId, activities),
    })),
    constraints: ["wbs_grouping_preservation"],
    score: calculateScore(
      spaceSavings,
      appliedChanges.length,
      "structure_preserving"
    ),
    algorithm: "structure_preserving",
  };
}

/**
 * Critical Path Focus Algorithm - Prioritizes critical path activities
 */
function generateCriticalPathFocusLayout(
  activities: any[],
  opportunities: any[],
  constraints: OptimizationConstraints
): LayoutCandidate | null {
  const criticalActivities = activities.filter((a) => a.isCritical);
  const nonCriticalOpportunities = opportunities.filter(
    (opp) =>
      opp.type === "row_sharing" &&
      opp.activities.every(
        (id: string) => !activities.find((a) => a.id === id)?.isCritical
      )
  );

  const appliedChanges: Array<{ activityId: string; newRow: number }> = [];
  let spaceSavings = 0;

  // Only optimize non-critical activities
  for (const opportunity of nonCriticalOpportunities.slice(0, 30)) {
    const [activity1, activity2] = opportunity.activities;

    if (canApplyRowSharing(activity1, activity2, appliedChanges, activities)) {
      const targetRow = findOptimalRow(
        activity1,
        activity2,
        appliedChanges,
        activities
      );

      appliedChanges.push(
        { activityId: activity1, newRow: targetRow },
        { activityId: activity2, newRow: targetRow }
      );

      spaceSavings += opportunity.spaceSavings;
    }
  }

  if (appliedChanges.length === 0) return null;

  return {
    id: "critical_path_focus",
    name: "Critical Path Focus",
    description:
      "Optimizes non-critical activities while preserving critical path",
    spaceSavings,
    activities: appliedChanges.map((change) => ({
      id: change.activityId,
      originalRow: getOriginalRow(change.activityId, activities),
      optimizedRow: change.newRow,
      rowChange: change.newRow - getOriginalRow(change.activityId, activities),
    })),
    constraints: ["critical_path_preservation"],
    score: calculateScore(
      spaceSavings,
      appliedChanges.length,
      "critical_path_focus"
    ),
    algorithm: "critical_path_focus",
  };
}

/**
 * Helper Functions
 */

function canApplyRowSharing(
  activity1: string,
  activity2: string,
  appliedChanges: Array<{ activityId: string; newRow: number }>,
  activities: any[]
): boolean {
  // Check if activities haven't already been moved
  const alreadyMoved = appliedChanges.some(
    (change) =>
      change.activityId === activity1 || change.activityId === activity2
  );

  if (alreadyMoved) {
    return false;
  }

  // Check for time overlap
  const act1 = activities.find((a) => a.id === activity1);
  const act2 = activities.find((a) => a.id === activity2);

  if (!act1 || !act2) {
    return false;
  }

  const start1 = new Date(act1.start);
  const end1 = new Date(act1.finish);
  const start2 = new Date(act2.start);
  const end2 = new Date(act2.finish);

  const hasOverlap = !(end1 <= start2 || end2 <= start1);

  if (hasOverlap) {
    return false;
  }

  return true;
}

function findOptimalRow(
  activity1: string,
  activity2: string,
  appliedChanges: Array<{ activityId: string; newRow: number }>,
  activities: any[]
): number {
  // Try to find an existing row that can accommodate both activities
  // For now, use the lower of the two original rows to maximize space savings
  const originalRow1 = getOriginalRow(activity1, activities);
  const originalRow2 = getOriginalRow(activity2, activities);
  const targetRow = Math.min(originalRow1, originalRow2);

  return targetRow;
}

function getOriginalRow(activityId: string, activities: any[]): number {
  // For now, use the index as the original row
  return activities.findIndex((a) => a.id === activityId);
}

function groupActivitiesByStructure(activities: any[]): any[][] {
  // Simple grouping by first character of ID (could be enhanced with WBS parsing)
  const groups: { [key: string]: any[] } = {};

  activities.forEach((activity) => {
    const groupKey = activity.id.charAt(0);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
  });

  return Object.values(groups);
}

function calculateScore(
  spaceSavings: number,
  changeCount: number,
  algorithm: string
): number {
  const baseScore = spaceSavings * 10; // Space savings is most important
  const changePenalty = changeCount * 0.1; // Slight penalty for many changes
  const algorithmBonus = algorithm === "balanced" ? 5 : 0; // Bonus for balanced approach

  return Math.max(0, baseScore - changePenalty + algorithmBonus);
}

function scoreCandidates(candidates: LayoutCandidate[]): LayoutCandidate[] {
  return candidates
    .sort((a, b) => b.score - a.score)
    .map((candidate, index) => ({
      ...candidate,
      score: candidate.score + (candidates.length - index) * 0.5, // Ranking bonus
    }));
}
