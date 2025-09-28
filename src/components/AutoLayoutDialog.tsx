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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useScheduleStore } from "../state/useScheduleStore";
// Temporary inline types to test dialog functionality
interface SimpleAnalysis {
  message: string;
  activityCount: number;
}

function simpleAnalysis(activities: any[]): SimpleAnalysis {
  return {
    message: "Analysis complete",
    activityCount: activities.length,
  };
}

export function AutoLayoutDialog() {
  const autoLayoutOpen = useScheduleStore((s) => s.autoLayoutOpen);
  const setAutoLayoutOpen = useScheduleStore((s) => s.setAutoLayoutOpen);
  const data = useScheduleStore((s) => s.data);

  console.log("AutoLayoutDialog render - autoLayoutOpen:", autoLayoutOpen);

  const [analysis, setAnalysis] = useState<SimpleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    console.log(
      "AutoLayoutDialog useEffect - autoLayoutOpen:",
      autoLayoutOpen,
      "data:",
      !!data
    );
    if (autoLayoutOpen && data?.activities && data?.relationships) {
      console.log("Starting analysis...");
      setIsAnalyzing(true);

      // Run analysis in a timeout to avoid blocking UI
      setTimeout(() => {
        try {
          const result = simpleAnalysis(data.activities);
          setAnalysis(result);
          setIsAnalyzing(false);
        } catch (error) {
          console.error("Analysis failed:", error);
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
    // TODO: Implement optimization engine
    console.log("Running optimization...");
  };

  console.log("Rendering AutoLayoutDialog with open:", autoLayoutOpen);

  return (
    <Dialog
      open={autoLayoutOpen}
      onClose={handleClose}
      aria-labelledby="auto-layout-dialog-title"
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle id="auto-layout-dialog-title">
        Auto-Layout Analysis
      </DialogTitle>

      <DialogContent dividers>
        {isAnalyzing ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analyzing Schedule Layout...
            </Typography>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Parsing schedule data, building dependency graph, and identifying
              optimization opportunities...
            </Typography>
          </Box>
        ) : analysis ? (
          <Stack spacing={3}>
            <Typography variant="h6">Analysis Results</Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography>Message:</Typography>
              <Typography fontWeight="bold">{analysis.message}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography>Activity Count:</Typography>
              <Typography fontWeight="bold">
                {analysis.activityCount}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography>No analysis data available.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {analysis && (
          <Button
            onClick={handleRunOptimization}
            variant="contained"
            disabled={isAnalyzing}
          >
            Run Optimization
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
