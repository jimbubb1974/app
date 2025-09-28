import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";

import { analyzeScheduleLayout } from "../utils/autoLayoutAnalysis";
import { generateLayoutCandidates } from "../utils/autoLayoutOptimizer";

// Inline type to avoid import issues
interface OptimizationResult {
  candidates: Array<{
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
    algorithm: string;
  }>;
  bestCandidate: any;
  totalSpaceSavings: number;
  processingTime: number;
  algorithm: string;
}

// Inline type to avoid import issues
interface LayoutAnalysis {
  timeGaps: Array<{
    start: Date;
    end: Date;
    duration: number;
    availableRows: number;
    activitiesInGap: string[];
  }>;
  compatibilityMatrix: Array<{
    activity1: string;
    activity2: string;
    canShareRow: boolean;
    timeOverlap: boolean;
    gapDuration: number;
    spaceSavings: number;
    constraints: string[];
  }>;
  optimizationOpportunities: Array<{
    id: string;
    type: "row_sharing" | "gap_filling" | "path_optimization";
    activities: string[];
    spaceSavings: number;
    constraints: string[];
    priority: number;
    description: string;
  }>;
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

export function AutoLayoutTestDialog() {
  const autoLayoutOpen = useScheduleStore((s) => s.autoLayoutOpen);
  const setAutoLayoutOpen = useScheduleStore((s) => s.setAutoLayoutOpen);
  const data = useScheduleStore((s) => s.data);

  const [analysis, setAnalysis] = useState<LayoutAnalysis | null>(null);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (autoLayoutOpen && data?.activities) {
      console.log("🚀 Starting auto-layout analysis...");
      setIsAnalyzing(true);

      // Run analysis in a timeout to avoid blocking UI
      setTimeout(() => {
        try {
          const result = analyzeScheduleLayout(
            data.activities,
            (step, progress) => {
              console.log(`📊 ${step} (${progress}%)`);
            }
          );

          setAnalysis(result);
          setIsAnalyzing(false);
        } catch (error) {
          console.error("❌ Analysis failed:", error);
          setIsAnalyzing(false);
        }
      }, 100);
    }
  }, [autoLayoutOpen, data]);

  const handleClose = () => {
    setAutoLayoutOpen(false);
    setAnalysis(null);
  };

  const handleRunOptimization = () => {
    console.log("🚀 NEW: Running auto-layout optimization...");
    console.log("🚀 NEW: Analysis available:", !!analysis);
    console.log("🚀 NEW: Activities available:", !!data?.activities);

    if (analysis && data?.activities) {
      console.log(
        "🚀 NEW: Starting optimization with",
        analysis.optimizationOpportunities.length,
        "opportunities"
      );
      setIsOptimizing(true);

      setTimeout(() => {
        try {
          console.log("🔧 NEW: Generating layout candidates...");
          const result = generateLayoutCandidates(
            data.activities,
            analysis.optimizationOpportunities,
            {
              maxRowChanges: 100,
              preserveWBSGrouping: true,
              preserveCriticalPath: true,
              minGapDuration: 1,
              maxConcurrentActivities: 3,
            }
          );

          console.log("✅ NEW: Optimization complete!", result);
          setOptimizationResult(result);
          setIsOptimizing(false);
        } catch (error) {
          console.error("❌ NEW: Optimization failed:", error);
          setIsOptimizing(false);
        }
      }, 100);
    } else {
      console.log("❌ NEW: Missing analysis or activities");
    }
  };

  const handleApplyOptimization = () => {
    console.log("🚀 Applying best optimization...");

    if (optimizationResult?.bestCandidate) {
      const bestCandidate = optimizationResult.bestCandidate;
      console.log("📊 Applying optimization:", bestCandidate.name);
      console.log("📊 Activities to move:", bestCandidate.activities);
      console.log("📊 Space savings:", bestCandidate.spaceSavings, "rows");

      // Apply the optimization by updating activity positions
      if (data?.activities) {
        const updatedActivities = [...data.activities];

        bestCandidate.activities.forEach((activityChange) => {
          const activityIndex = updatedActivities.findIndex(
            (a) => a.id === activityChange.id
          );
          if (activityIndex !== -1) {
            // Update the activity's row position
            updatedActivities[activityIndex] = {
              ...updatedActivities[activityIndex],
              optimizedRow: activityChange.optimizedRow,
              originalRow: activityChange.originalRow,
              rowChange: activityChange.rowChange,
            };
            console.log(
              `📝 Moved ${activityChange.id} from row ${activityChange.originalRow} to row ${activityChange.optimizedRow}`
            );
          }
        });

        // Update the store with optimized activities
        const setData = useScheduleStore.getState().setData;
        setData({
          ...data,
          activities: updatedActivities,
          optimizationApplied: {
            algorithm: bestCandidate.algorithm,
            spaceSavings: bestCandidate.spaceSavings,
            activitiesMoved: bestCandidate.activities.length,
            appliedAt: new Date().toISOString(),
          },
        });

        console.log("✅ Optimization applied successfully!");
        alert(
          `Applied ${bestCandidate.name}: ${bestCandidate.spaceSavings} rows saved, ${bestCandidate.activities.length} activities moved`
        );

        // Close dialog after applying
        handleClose();
      }
    }
  };

  return (
    <Dialog
      open={autoLayoutOpen}
      onClose={handleClose}
      aria-labelledby="auto-layout-test-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="auto-layout-test-dialog-title">
        Auto-Layout Test Dialog
      </DialogTitle>

      <DialogContent dividers>
        {isAnalyzing ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Running Test Analysis...
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Testing dialog functionality...
            </Typography>
          </Box>
        ) : analysis ? (
          <Stack spacing={3}>
            <Typography variant="h6">Auto-Layout Analysis Results</Typography>

            {/* Baseline Metrics */}
            <Box p={2} border={1} borderColor="divider" borderRadius={1}>
              <Typography variant="subtitle1" gutterBottom>
                Baseline Metrics
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total Activities:</Typography>
                  <Typography fontWeight="bold">
                    {analysis.baselineMetrics.totalActivities}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Current Height:</Typography>
                  <Typography fontWeight="bold">
                    {analysis.baselineMetrics.totalHeight} rows
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Critical Path Length:</Typography>
                  <Typography fontWeight="bold">
                    {analysis.baselineMetrics.criticalPathLength} activities
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Time Gaps Found:</Typography>
                  <Typography fontWeight="bold">
                    {analysis.baselineMetrics.totalGaps}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Potential Row Savings:</Typography>
                  <Typography fontWeight="bold" color="primary">
                    {analysis.baselineMetrics.potentialSavings} rows
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Processing Time:</Typography>
                  <Typography fontWeight="bold">
                    {analysis.processingTime}ms
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Time Gaps */}
            <Box p={2} border={1} borderColor="divider" borderRadius={1}>
              <Typography variant="subtitle1" gutterBottom>
                Time Gaps ({analysis.timeGaps.length})
              </Typography>
              <Stack spacing={1}>
                {analysis.timeGaps.slice(0, 5).map((gap, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">
                      {gap.start.toLocaleDateString()} -{" "}
                      {gap.end.toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {gap.duration.toFixed(1)} days
                    </Typography>
                  </Box>
                ))}
                {analysis.timeGaps.length > 5 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {analysis.timeGaps.length - 5} more gaps
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Optimization Opportunities */}
            <Box p={2} border={1} borderColor="divider" borderRadius={1}>
              <Typography variant="subtitle1" gutterBottom>
                Optimization Opportunities (
                {analysis.optimizationOpportunities.length})
              </Typography>
              <Stack spacing={1}>
                {analysis.optimizationOpportunities
                  .slice(0, 5)
                  .map((opp, index) => (
                    <Box key={index} p={1} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {opp.type.replace("_", " ").toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {opp.description}
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={0.5}
                      >
                        <Typography variant="caption">
                          Activities: {opp.activities.join(", ")}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          Saves: {opp.spaceSavings} row
                          {opp.spaceSavings !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                {analysis.optimizationOpportunities.length > 5 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {analysis.optimizationOpportunities.length - 5} more
                    opportunities
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Optimization Results */}
            {optimizationResult && (
              <Box p={2} border={1} borderColor="divider" borderRadius={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Optimization Results ({optimizationResult.candidates.length}{" "}
                  candidates)
                </Typography>
                <Stack spacing={2}>
                  {optimizationResult.candidates.map((candidate, index) => (
                    <Box
                      key={candidate.id}
                      p={2}
                      bgcolor="grey.50"
                      borderRadius={1}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1}
                      >
                        <Typography variant="h6">{candidate.name}</Typography>
                        <Typography variant="h6" color="primary">
                          {candidate.spaceSavings} rows saved
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {candidate.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption">
                          Score: {candidate.score.toFixed(1)}
                        </Typography>
                        <Typography variant="caption">
                          {candidate.activities.length} activities moved
                        </Typography>
                      </Box>
                      {index === 0 && (
                        <Box
                          mt={1}
                          p={1}
                          bgcolor="primary.light"
                          borderRadius={1}
                        >
                          <Typography
                            variant="caption"
                            color="primary.contrastText"
                          >
                            🏆 BEST CANDIDATE
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Typography>No analysis data available.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {analysis && !optimizationResult && (
          <Button
            onClick={handleRunOptimization}
            variant="contained"
            disabled={isAnalyzing || isOptimizing}
          >
            {isOptimizing ? "Optimizing..." : "Run Optimization"}
          </Button>
        )}
        {optimizationResult && (
          <>
            <Button
              onClick={handleRunOptimization}
              variant="outlined"
              disabled={isAnalyzing || isOptimizing}
            >
              {isOptimizing ? "Re-optimizing..." : "Re-optimize"}
            </Button>
            <Button
              onClick={handleApplyOptimization}
              variant="contained"
              color="success"
              disabled={isOptimizing}
            >
              Apply Best Optimization
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
