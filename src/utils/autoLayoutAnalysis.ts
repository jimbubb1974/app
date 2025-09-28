// Auto-Layout Analysis Engine (Alternative)
// Handles large schedule files efficiently with progress tracking

export interface TimeGap {
  start: Date;
  end: Date;
  duration: number; // in days
  availableRows: number;
  activitiesInGap: string[];
}

export interface ActivityCompatibility {
  activity1: string;
  activity2: string;
  canShareRow: boolean;
  timeOverlap: boolean;
  gapDuration: number;
  spaceSavings: number;
  constraints: string[];
}

export interface OptimizationOpportunity {
  id: string;
  type: "row_sharing" | "gap_filling" | "path_optimization";
  activities: string[];
  spaceSavings: number;
  constraints: string[];
  priority: number;
  description: string;
}

export interface LayoutAnalysis {
  timeGaps: TimeGap[];
  compatibilityMatrix: ActivityCompatibility[];
  optimizationOpportunities: OptimizationOpportunity[];
  baselineMetrics: {
    totalHeight: number;
    whiteSpacePercentage: number;
    averageRowUtilization: number;
    criticalPathLength: number;
    totalActivities: number;
    totalGaps: number;
    potentialSavings: number;
  };
  processingTime: number;
}

/**
 * Parse schedule data and identify all time gaps
 */
export function analyzeTimeGaps(activities: any[]): TimeGap[] {
  const gaps: TimeGap[] = [];

  // Sort activities by start date
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Find gaps between activities
  for (let i = 0; i < sortedActivities.length - 1; i++) {
    const current = sortedActivities[i];
    const next = sortedActivities[i + 1];

    const currentEnd = new Date(current.finish);
    const nextStart = new Date(next.start);

    // If there's a gap between activities
    if (currentEnd < nextStart) {
      const gapDuration =
        (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60 * 24);

      gaps.push({
        start: currentEnd,
        end: nextStart,
        duration: gapDuration,
        availableRows: 1, // Will be calculated based on row utilization
        activitiesInGap: [current.id, next.id],
      });
    }
  }

  return gaps;
}

/**
 * Analyze activity compatibility for row sharing (optimized for large files)
 */
export function analyzeActivityCompatibility(
  activities: any[]
): ActivityCompatibility[] {
  const compatibility: ActivityCompatibility[] = [];

  // Smart optimization: Only analyze activities that are close in time
  const timeWindow = 30; // days - only compare activities within 30 days
  const maxPairs = 10000; // Limit to prevent stack overflow

  let pairsAnalyzed = 0;

  for (let i = 0; i < activities.length && pairsAnalyzed < maxPairs; i++) {
    const activity1 = activities[i];
    const start1 = new Date(activity1.start);
    const end1 = new Date(activity1.finish);

    // Only check activities that start within the time window
    const timeWindowStart = new Date(
      start1.getTime() - timeWindow * 24 * 60 * 60 * 1000
    );
    const timeWindowEnd = new Date(
      end1.getTime() + timeWindow * 24 * 60 * 60 * 1000
    );

    for (
      let j = i + 1;
      j < activities.length && pairsAnalyzed < maxPairs;
      j++
    ) {
      const activity2 = activities[j];
      const start2 = new Date(activity2.start);
      const end2 = new Date(activity2.finish);

      // Skip if activity2 is outside our time window
      if (start2 < timeWindowStart || start2 > timeWindowEnd) {
        continue;
      }

      pairsAnalyzed++;

      // Check for time overlap
      const timeOverlap = !(end1 <= start2 || end2 <= start1);
      const gapDuration = timeOverlap
        ? 0
        : Math.min(
            Math.abs(start2.getTime() - end1.getTime()),
            Math.abs(start1.getTime() - end2.getTime())
          ) /
          (1000 * 60 * 60 * 24);

      const canShareRow = !timeOverlap && gapDuration > 0;
      const spaceSavings = canShareRow ? 1 : 0; // One row saved

      const constraints: string[] = [];
      if (timeOverlap) constraints.push("time_overlap");
      if (activity1.isCritical && activity2.isCritical)
        constraints.push("both_critical");

      compatibility.push({
        activity1: activity1.id,
        activity2: activity2.id,
        canShareRow,
        timeOverlap,
        gapDuration,
        spaceSavings,
        constraints,
      });
    }
  }

  return compatibility;
}

/**
 * Identify optimization opportunities (optimized for large files)
 */
export function identifyOptimizationOpportunities(
  timeGaps: TimeGap[],
  compatibility: ActivityCompatibility[]
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];

  // Row sharing opportunities (limit to prevent memory issues)
  const rowSharing = compatibility
    .filter((c) => c.canShareRow)
    .slice(0, 1000) // Limit to top 1000 row sharing opportunities
    .map((c, index) => ({
      id: `row_sharing_${index}`,
      type: "row_sharing" as const,
      activities: [c.activity1, c.activity2],
      spaceSavings: c.spaceSavings,
      constraints: c.constraints,
      priority: c.gapDuration > 30 ? 1 : 2, // Longer gaps = higher priority
      description: `Activities ${c.activity1} and ${c.activity2} can share a row (${c.gapDuration.toFixed(1)} day gap)`,
    }));

  opportunities.push(...rowSharing);

  // Gap filling opportunities (limit to prevent memory issues)
  const gapFilling = timeGaps
    .filter((gap) => gap.duration > 1) // Only gaps longer than 1 day
    .slice(0, 500) // Limit to top 500 gap filling opportunities
    .map((gap, index) => ({
      id: `gap_filling_${index}`,
      type: "gap_filling" as const,
      activities: gap.activitiesInGap,
      spaceSavings: 0, // Gap filling doesn't save rows directly
      constraints: [],
      priority: gap.duration > 7 ? 1 : 3, // Longer gaps = higher priority
      description: `Gap between activities: ${gap.duration.toFixed(1)} days (${gap.start.toLocaleDateString()} - ${gap.end.toLocaleDateString()})`,
    }));

  opportunities.push(...gapFilling);

  return opportunities;
}

/**
 * Calculate baseline metrics
 */
export function calculateBaselineMetrics(activities: any[]): {
  totalHeight: number;
  whiteSpacePercentage: number;
  averageRowUtilization: number;
  criticalPathLength: number;
  totalActivities: number;
  totalGaps: number;
  potentialSavings: number;
} {
  const totalActivities = activities.length;
  const criticalActivities = activities.filter((a) => a.isCritical);
  const criticalPathLength = criticalActivities.length;

  // Calculate total duration
  const totalDuration = activities.reduce((sum, activity) => {
    const start = new Date(activity.start);
    const end = new Date(activity.finish);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  }, 0);

  // Estimate white space (simplified calculation)
  const whiteSpacePercentage = 0; // Would need actual row analysis
  const averageRowUtilization = 1.0; // Would need actual analysis

  return {
    totalHeight: totalActivities,
    whiteSpacePercentage,
    averageRowUtilization,
    criticalPathLength,
    totalActivities,
    totalGaps: 0, // Will be calculated from time gaps
    potentialSavings: 0, // Will be calculated from opportunities
  };
}

/**
 * Main analysis function with progress tracking
 */
export function analyzeScheduleLayout(
  activities: any[],
  onProgress?: (step: string, progress: number) => void
): LayoutAnalysis {
  const startTime = Date.now();

  if (onProgress) onProgress("Initializing analysis...", 0);

  // Phase 1: Time gap analysis
  if (onProgress) onProgress("Analyzing time gaps...", 10);
  const timeGaps = analyzeTimeGaps(activities);

  // Phase 2: Activity compatibility analysis
  if (onProgress) onProgress("Analyzing activity compatibility...", 30);
  const compatibility = analyzeActivityCompatibility(activities);

  // Phase 3: Optimization opportunities
  if (onProgress) onProgress("Identifying optimization opportunities...", 60);
  const opportunities = identifyOptimizationOpportunities(
    timeGaps,
    compatibility
  );

  // Phase 4: Baseline metrics
  if (onProgress) onProgress("Calculating baseline metrics...", 80);
  const baselineMetrics = calculateBaselineMetrics(activities);

  // Update metrics with calculated values
  baselineMetrics.totalGaps = timeGaps.length;
  baselineMetrics.potentialSavings = opportunities.reduce(
    (sum, opp) => sum + opp.spaceSavings,
    0
  );

  const processingTime = Date.now() - startTime;

  if (onProgress) onProgress("Analysis complete!", 100);

  return {
    timeGaps,
    compatibilityMatrix: compatibility,
    optimizationOpportunities: opportunities,
    baselineMetrics,
    processingTime,
  };
}
