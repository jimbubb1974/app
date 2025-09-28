// Simple version of auto-layout analysis to test imports

export interface SimpleAnalysis {
  message: string;
  activityCount: number;
}

export function simpleAnalysis(activities: any[]): SimpleAnalysis {
  return {
    message: "Analysis complete",
    activityCount: activities.length,
  };
}
