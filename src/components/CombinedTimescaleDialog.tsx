import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
} from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";

const CombinedTimescaleDialog: React.FC = () => {
  const {
    timescaleOpen,
    setTimescaleOpen,
    timescaleTop,
    timescaleBottom,
    setTimescale,
    timelineFormatSettings,
    setTimelineFormatSettings,
  } = useScheduleStore();

  const [top, setTop] = useState(timescaleTop);
  const [bottom, setBottom] = useState(timescaleBottom);
  const [formatSettings, setFormatSettings] = useState(timelineFormatSettings);

  useEffect(() => {
    setTop(timescaleTop);
    setBottom(timescaleBottom);
    setFormatSettings(timelineFormatSettings);
  }, [timescaleTop, timescaleBottom, timelineFormatSettings]);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...formatSettings, [key]: value };
    setFormatSettings(newSettings);
    setTimelineFormatSettings(newSettings);
  };

  const handleTimescaleChange = (newTop: string, newBottom: string) => {
    setTop(newTop);
    setBottom(newBottom);
    setTimescale(newTop as any, newBottom as any);
  };

  const handleClose = () => {
    setTimescaleOpen(false);
  };

  const handleSave = () => {
    setTimescale(top as any, bottom as any);
    setTimescaleOpen(false);
  };

  const getFormatPreview = (
    format: string,
    customFormat: string,
    isTopTier: boolean
  ) => {
    const now = new Date();
    const sampleDate = new Date(2024, 0, 15); // January 15, 2024

    if (format === "custom") {
      return customFormat || "MM/YYYY";
    }

    if (isTopTier) {
      if (top === "year") {
        switch (format) {
          case "full":
            return "2024";
          case "abbreviated":
            return "24";
          case "short":
            return "24";
          case "numeric":
            return "2024";
          default:
            return "2024";
        }
      } else {
        // Month as top tier
        switch (format) {
          case "full":
            return "January 2024";
          case "abbreviated":
            return "Jan 24";
          case "short":
            return "Jan";
          case "numeric":
            return "1/2024";
          default:
            return "January 2024";
        }
      }
    } else {
      // Bottom tier
      if (bottom === "month") {
        switch (format) {
          case "full":
            return "January 2024";
          case "abbreviated":
            return "Jan 24";
          case "short":
            return "Jan";
          case "numeric":
            return "1/2024";
          default:
            return "January 2024";
        }
      } else {
        // Week as bottom tier
        switch (format) {
          case "full":
            return "Week of Jan 15";
          case "abbreviated":
            return "Jan 15";
          case "short":
            return "15";
          case "numeric":
            return "1/15";
          default:
            return "Week of Jan 15";
        }
      }
    }
  };

  return (
    <Dialog
      open={timescaleOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Timescale & Format Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Timescale Structure */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Timescale Structure
            </Typography>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Top Row</InputLabel>
                <Select
                  label="Top Row"
                  value={top}
                  onChange={(e) =>
                    handleTimescaleChange(e.target.value as any, bottom)
                  }
                >
                  <MenuItem value="year">Year</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Bottom Row</InputLabel>
                <Select
                  label="Bottom Row"
                  value={bottom}
                  onChange={(e) =>
                    handleTimescaleChange(top, e.target.value as any)
                  }
                >
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Timeline Format Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Timeline Text Formatting
            </Typography>

            {/* Enable/Disable */}
            <FormControlLabel
              control={
                <Switch
                  checked={formatSettings.enabled}
                  onChange={(e) =>
                    handleSettingChange("enabled", e.target.checked)
                  }
                />
              }
              label="Enable Custom Timeline Formatting"
            />

            {formatSettings.enabled && (
              <>
                {/* Format Options - Aligned with timescale structure */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Top Tier Format</InputLabel>
                    <Select
                      label="Top Tier Format"
                      value={formatSettings.topTierFormat}
                      onChange={(e) =>
                        handleSettingChange("topTierFormat", e.target.value)
                      }
                    >
                      {top === "year"
                        ? [
                            // Year format options
                            <MenuItem key="full" value="full">
                              Full (2024)
                            </MenuItem>,
                            <MenuItem key="abbreviated" value="abbreviated">
                              Abbreviated (24)
                            </MenuItem>,
                            <MenuItem key="short" value="short">
                              Short (24)
                            </MenuItem>,
                            <MenuItem key="numeric" value="numeric">
                              Numeric (2024)
                            </MenuItem>,
                            <MenuItem key="custom" value="custom">
                              Custom Format
                            </MenuItem>,
                          ]
                        : [
                            // Month format options
                            <MenuItem key="full" value="full">
                              Full (January 2024)
                            </MenuItem>,
                            <MenuItem key="abbreviated" value="abbreviated">
                              Abbreviated (Jan 24)
                            </MenuItem>,
                            <MenuItem key="short" value="short">
                              Short (Jan)
                            </MenuItem>,
                            <MenuItem key="numeric" value="numeric">
                              Numeric (1/2024)
                            </MenuItem>,
                            <MenuItem key="custom" value="custom">
                              Custom Format
                            </MenuItem>,
                          ]}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Bottom Tier Format</InputLabel>
                    <Select
                      label="Bottom Tier Format"
                      value={formatSettings.bottomTierFormat}
                      onChange={(e) =>
                        handleSettingChange("bottomTierFormat", e.target.value)
                      }
                    >
                      {bottom === "month"
                        ? [
                            // Month format options (when bottom tier is months)
                            <MenuItem key="full" value="full">
                              Full (January 2024)
                            </MenuItem>,
                            <MenuItem key="abbreviated" value="abbreviated">
                              Abbreviated (Jan 24)
                            </MenuItem>,
                            <MenuItem key="short" value="short">
                              Short (Jan)
                            </MenuItem>,
                            <MenuItem key="numeric" value="numeric">
                              Numeric (1/2024)
                            </MenuItem>,
                            <MenuItem key="custom" value="custom">
                              Custom Format
                            </MenuItem>,
                          ]
                        : [
                            // Week format options (when bottom tier is weeks)
                            <MenuItem key="full" value="full">
                              Full (Week of Jan 15)
                            </MenuItem>,
                            <MenuItem key="abbreviated" value="abbreviated">
                              Abbreviated (Jan 15)
                            </MenuItem>,
                            <MenuItem key="short" value="short">
                              Short (15)
                            </MenuItem>,
                            <MenuItem key="numeric" value="numeric">
                              Numeric (1/15)
                            </MenuItem>,
                            <MenuItem key="custom" value="custom">
                              Custom Format
                            </MenuItem>,
                          ]}
                    </Select>
                  </FormControl>
                </Stack>

                {/* Custom Format Fields */}
                {(formatSettings.topTierFormat === "custom" ||
                  formatSettings.bottomTierFormat === "custom") && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    {formatSettings.topTierFormat === "custom" && (
                      <TextField
                        size="small"
                        fullWidth
                        label="Top Tier Custom Format"
                        value={formatSettings.topTierCustomFormat}
                        onChange={(e) =>
                          handleSettingChange(
                            "topTierCustomFormat",
                            e.target.value
                          )
                        }
                        placeholder="MM/YYYY"
                        helperText="Use date format tokens (MM = month, YYYY = year, etc.)"
                      />
                    )}
                    {formatSettings.bottomTierFormat === "custom" && (
                      <TextField
                        size="small"
                        fullWidth
                        label="Bottom Tier Custom Format"
                        value={formatSettings.bottomTierCustomFormat}
                        onChange={(e) =>
                          handleSettingChange(
                            "bottomTierCustomFormat",
                            e.target.value
                          )
                        }
                        placeholder={bottom === "month" ? "MM/YYYY" : "MM/DD"}
                        helperText="Use date format tokens (MM = month, DD = day, YYYY = year, YY = 2-digit year)"
                      />
                    )}
                  </Stack>
                )}

                {/* Format Previews */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Top Tier Preview:{" "}
                      {getFormatPreview(
                        formatSettings.topTierFormat,
                        formatSettings.topTierCustomFormat,
                        true
                      )}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Bottom Tier Preview:{" "}
                      {getFormatPreview(
                        formatSettings.bottomTierFormat,
                        formatSettings.bottomTierCustomFormat,
                        false
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CombinedTimescaleDialog;
