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
  Slider,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

interface SettingsOptions {
  activitySpacing: number; // pixels between activity rows
  fontSize: number; // base font size
  fontFamily: string; // font family
  barHeight: number; // height of activity bars
  defaultLabelPosition: "left" | "right" | "top" | "bottom" | "bar" | "none";
  defaultBarStyle:
    | "solid"
    | "dashed"
    | "dotted"
    | "rounded"
    | "barbell"
    | "sharp"
    | "pill";
}

export function SettingsDialog() {
  const open = useScheduleStore((s) => s.settingsOpen);
  const setOpen = useScheduleStore((s) => s.setSettingsOpen);
  const settings = useScheduleStore((s) => s.settings);
  const setSettings = useScheduleStore((s) => s.setSettings);
  const data = useScheduleStore((s) => s.data);
  const setData = useScheduleStore((s) => s.setData);

  const [localSettings, setLocalSettings] = useState<SettingsOptions>({
    activitySpacing: settings.activitySpacing,
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    barHeight: settings.barHeight,
    defaultLabelPosition: settings.defaultLabelPosition,
    defaultBarStyle: settings.defaultBarStyle || "solid",
  });

  const handleSpacingChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, activitySpacing: value }));
  };

  const handleFontSizeChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, fontSize: value }));
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    setLocalSettings((prev) => ({ ...prev, fontFamily }));
  };

  const handleBarHeightChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, barHeight: value }));
  };

  const handleLabelPositionChange = (
    position: "left" | "right" | "top" | "bottom" | "bar" | "none"
  ) => {
    setLocalSettings((prev) => ({ ...prev, defaultLabelPosition: position }));
  };

  const handleBarStyleChange = (
    style:
      | "solid"
      | "dashed"
      | "dotted"
      | "rounded"
      | "barbell"
      | "sharp"
      | "pill"
  ) => {
    setLocalSettings((prev) => ({ ...prev, defaultBarStyle: style }));
  };

  const handleApply = () => {
    setSettings(localSettings);
    setOpen(false);
  };

  const handleCancel = () => {
    setLocalSettings({
      activitySpacing: settings.activitySpacing,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily,
      barHeight: settings.barHeight,
      defaultLabelPosition: settings.defaultLabelPosition,
      defaultBarStyle: settings.defaultBarStyle || "solid",
    });
    setOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      activitySpacing: 28,
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      barHeight: 20,
      defaultLabelPosition: "bar" as const,
      defaultBarStyle: "solid" as const,
    };
    setLocalSettings(defaultSettings);
  };

  const handleApplyDefaultsEverywhere = () => {
    // Persist the current local settings as the global defaults first
    setSettings(localSettings);

    // Then clear per-activity overrides so they inherit the defaults
    if (!data?.activities) return;
    const updatedActivities = data.activities.map((activity) => ({
      ...activity,
      customColor: undefined,
      customBarHeight: undefined,
      customFontSize: undefined,
      customFontFamily: undefined,
      barStyle: undefined,
      labelPosition: undefined,
    }));

    setData({
      ...data,
      activities: updatedActivities,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Visual Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={4} mt={1}>
          {/* Activity Spacing */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Activity Row Spacing
            </Typography>
            <Box px={2}>
              <Slider
                value={localSettings.activitySpacing}
                onChange={(_, value) => handleSpacingChange(value as number)}
                min={20}
                max={50}
                step={2}
                marks={[
                  { value: 20, label: "Compact" },
                  { value: 35, label: "Standard" },
                  { value: 50, label: "Spacious" },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Controls vertical spacing between activity rows
            </Typography>
          </Box>

          <Divider />

          {/* Font Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Font Settings
            </Typography>

            <Stack spacing={3}>
              {/* Font Family */}
              <FormControl size="small" fullWidth>
                <InputLabel>Font Family</InputLabel>
                <Select
                  label="Font Family"
                  value={localSettings.fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                  <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                  <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
                  <MenuItem value="'Times New Roman', serif">
                    Times New Roman
                  </MenuItem>
                  <MenuItem value="'Courier New', monospace">
                    Courier New
                  </MenuItem>
                  <MenuItem value="'Segoe UI', sans-serif">Segoe UI</MenuItem>
                  <MenuItem value="'Calibri', sans-serif">Calibri</MenuItem>
                  <MenuItem value="'Georgia', serif">Georgia</MenuItem>
                </Select>
              </FormControl>

              {/* Font Size */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Font Size
                </Typography>
                <Box px={2}>
                  <Slider
                    value={localSettings.fontSize}
                    onChange={(_, value) =>
                      handleFontSizeChange(value as number)
                    }
                    min={8}
                    max={20}
                    step={1}
                    marks={[
                      { value: 8, label: "8px" },
                      { value: 12, label: "12px" },
                      { value: 16, label: "16px" },
                      { value: 20, label: "20px" },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}px`}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Bar Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Bar Settings
            </Typography>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Bar Height
              </Typography>
              <Box px={2}>
                <Slider
                  value={localSettings.barHeight}
                  onChange={(_, value) =>
                    handleBarHeightChange(value as number)
                  }
                  min={12}
                  max={32}
                  step={2}
                  marks={[
                    { value: 12, label: "Thin" },
                    { value: 20, label: "Standard" },
                    { value: 32, label: "Thick" },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Controls the height of activity bars
              </Typography>
            </Box>

            {/* Default Label Position */}
            <Box mt={3}>
              <FormControl fullWidth>
                <InputLabel>Default Label Position</InputLabel>
                <Select
                  value={localSettings.defaultLabelPosition}
                  onChange={(e) =>
                    handleLabelPositionChange(
                      e.target.value as
                        | "left"
                        | "right"
                        | "top"
                        | "bottom"
                        | "bar"
                        | "none"
                    )
                  }
                  label="Default Label Position"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                  <MenuItem value="bar">Inside Bar</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Default position for activity labels
              </Typography>
            </Box>

            {/* Default Bar Style */}
            <Box mt={3}>
              <FormControl fullWidth>
                <InputLabel>Default Bar Style</InputLabel>
                <Select
                  value={localSettings.defaultBarStyle}
                  onChange={(e) =>
                    handleBarStyleChange(
                      e.target.value as
                        | "solid"
                        | "dashed"
                        | "dotted"
                        | "rounded"
                        | "barbell"
                        | "sharp"
                        | "pill"
                    )
                  }
                  label="Default Bar Style"
                >
                  <MenuItem value="solid">Solid</MenuItem>
                  <MenuItem value="dashed">Dashed</MenuItem>
                  <MenuItem value="dotted">Dotted</MenuItem>
                  <MenuItem value="rounded">Rounded</MenuItem>
                  <MenuItem value="barbell">Barbell</MenuItem>
                  <MenuItem value="sharp">Sharp</MenuItem>
                  <MenuItem value="pill">Pill</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Default style for activity bars
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Defaults
        </Button>
        <Button onClick={handleApplyDefaultsEverywhere} color="primary">
          Apply Defaults Everywhere
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
