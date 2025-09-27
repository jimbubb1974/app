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
}

export function SettingsDialog() {
  const open = useScheduleStore((s) => s.settingsOpen);
  const setOpen = useScheduleStore((s) => s.setSettingsOpen);
  const settings = useScheduleStore((s) => s.settings);
  const setSettings = useScheduleStore((s) => s.setSettings);

  const [localSettings, setLocalSettings] = useState<SettingsOptions>({
    activitySpacing: settings.activitySpacing,
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    barHeight: settings.barHeight,
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
    });
    setOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      activitySpacing: 28,
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      barHeight: 20,
    };
    setLocalSettings(defaultSettings);
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
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Defaults
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
