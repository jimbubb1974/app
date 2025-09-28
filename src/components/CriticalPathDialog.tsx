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
  TextField,
  Stack,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material";
import { useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

interface CriticalPathSettings {
  enabled: boolean;
  displayMethod: "color" | "outline";
  criticalColor: string;
  outlineColor: string;
  outlineWidth: number;
  criteria: "isCritical" | "totalFloat";
  floatThreshold: number;
}

export function CriticalPathDialog() {
  const open = useScheduleStore((s) => s.criticalPathOpen);
  const setOpen = useScheduleStore((s) => s.setCriticalPathOpen);
  const data = useScheduleStore((s) => s.data);
  const criticalPathSettings = useScheduleStore((s) => s.criticalPathSettings);
  const setCriticalPathSettings = useScheduleStore(
    (s) => s.setCriticalPathSettings
  );

  const [settings, setSettings] =
    useState<CriticalPathSettings>(criticalPathSettings);

  const handleSave = () => {
    setCriticalPathSettings(settings);
    setOpen(false);
  };

  const handleCancel = () => {
    setSettings(criticalPathSettings);
    setOpen(false);
  };

  const handleDisplayMethodChange = (method: "color" | "outline") => {
    setSettings((prev) => ({ ...prev, displayMethod: method }));
  };

  const handleCriteriaChange = (criteria: "isCritical" | "totalFloat") => {
    setSettings((prev) => ({ ...prev, criteria }));
  };

  const handleFloatThresholdChange = (threshold: number) => {
    setSettings((prev) => ({ ...prev, floatThreshold: threshold }));
  };

  const handleColorChange = (color: string, type: "critical" | "outline") => {
    if (type === "critical") {
      setSettings((prev) => ({ ...prev, criticalColor: color }));
    } else {
      setSettings((prev) => ({ ...prev, outlineColor: color }));
    }
  };

  const handleOutlineWidthChange = (width: number) => {
    setSettings((prev) => ({ ...prev, outlineWidth: width }));
  };

  const handleEnabledChange = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, enabled }));
  };

  // Calculate critical path statistics
  const getCriticalPathStats = () => {
    if (!data) return { total: 0, critical: 0, withFloat: 0 };

    const total = data.activities.length;
    const critical = data.activities.filter((a) => a.isCritical).length;
    const withFloat = data.activities.filter(
      (a) => a.totalFloatDays !== undefined
    ).length;

    return { total, critical, withFloat };
  };

  const stats = getCriticalPathStats();

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Critical Path Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Enable/Disable */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enabled}
                  onChange={(e) => handleEnabledChange(e.target.checked)}
                />
              }
              label="Enable Critical Path Highlighting"
            />
          </Box>

          {settings.enabled && (
            <>
              <Divider />

              {/* Display Method */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Display Method
                </Typography>
                <FormControl size="small" fullWidth>
                  <InputLabel>How to highlight critical activities</InputLabel>
                  <Select
                    label="How to highlight critical activities"
                    value={settings.displayMethod}
                    onChange={(e) =>
                      handleDisplayMethodChange(
                        e.target.value as "color" | "outline"
                      )
                    }
                  >
                    <MenuItem value="color">Change bar color</MenuItem>
                    <MenuItem value="outline">Add colored outline</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Color Settings */}
              {settings.displayMethod === "color" && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Color Settings
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 32,
                        backgroundColor: settings.criticalColor,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const color = prompt(
                          "Enter color (hex, rgb, or name):",
                          settings.criticalColor
                        );
                        if (color) handleColorChange(color, "critical");
                      }}
                    />
                    <TextField
                      size="small"
                      label="Critical Path Color"
                      value={settings.criticalColor}
                      onChange={(e) =>
                        handleColorChange(e.target.value, "critical")
                      }
                      placeholder="#e74c3c"
                    />
                  </Stack>
                </Box>
              )}

              {settings.displayMethod === "outline" && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Outline Settings
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 32,
                          backgroundColor: "#ffffff",
                          border: `3px solid ${settings.outlineColor}`,
                          borderRadius: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const color = prompt(
                            "Enter outline color (hex, rgb, or name):",
                            settings.outlineColor
                          );
                          if (color) handleColorChange(color, "outline");
                        }}
                      />
                      <TextField
                        size="small"
                        label="Outline Color"
                        value={settings.outlineColor}
                        onChange={(e) =>
                          handleColorChange(e.target.value, "outline")
                        }
                        placeholder="#e74c3c"
                      />
                    </Stack>
                    <TextField
                      size="small"
                      label="Outline Width (px)"
                      type="number"
                      value={settings.outlineWidth}
                      onChange={(e) =>
                        handleOutlineWidthChange(Number(e.target.value))
                      }
                      inputProps={{ min: 1, max: 10 }}
                    />
                  </Stack>
                </Box>
              )}

              <Divider />

              {/* Critical Path Criteria */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Critical Path Definition
                </Typography>
                <FormControl size="small" fullWidth>
                  <InputLabel>How to identify critical activities</InputLabel>
                  <Select
                    label="How to identify critical activities"
                    value={settings.criteria}
                    onChange={(e) =>
                      handleCriteriaChange(
                        e.target.value as "isCritical" | "totalFloat"
                      )
                    }
                  >
                    <MenuItem value="isCritical">
                      Use isCritical flag from data
                    </MenuItem>
                    <MenuItem value="totalFloat">
                      Use total float threshold
                    </MenuItem>
                  </Select>
                </FormControl>

                {settings.criteria === "totalFloat" && (
                  <Box mt={2}>
                    <TextField
                      size="small"
                      label="Total Float Threshold (days)"
                      type="number"
                      value={settings.floatThreshold}
                      onChange={(e) =>
                        handleFloatThresholdChange(Number(e.target.value))
                      }
                      inputProps={{ min: 0, max: 365 }}
                      helperText="Activities with total float ≤ this value will be considered critical"
                    />
                  </Box>
                )}
              </Box>

              <Divider />

              {/* Data Statistics */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Statistics
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    label={`Total Activities: ${stats.total}`}
                    color="primary"
                  />
                  <Chip
                    label={`Critical Flag: ${stats.critical}`}
                    color="secondary"
                  />
                  <Chip
                    label={`With Float Data: ${stats.withFloat}`}
                    color="default"
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {stats.critical > 0 && "✓ Critical flags found in data"}
                  {stats.critical === 0 &&
                    stats.withFloat > 0 &&
                    "⚠ No critical flags, but float data available"}
                  {stats.critical === 0 &&
                    stats.withFloat === 0 &&
                    "⚠ No critical path data available"}
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
