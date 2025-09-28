import {
  Box,
  IconButton,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Button,
  Chip,
  Collapse,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Grid,
  Paper,
  Slider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useScheduleStore } from "../state/useScheduleStore";
import type { Activity } from "../types/schedule";
import { useState, useEffect } from "react";

// Predefined color palettes
const PREDEFINED_COLORS = [
  // Primary colors
  { name: "Blue", value: "#3498db" },
  { name: "Red", value: "#e74c3c" },
  { name: "Green", value: "#27ae60" },
  { name: "Orange", value: "#f39c12" },
  { name: "Purple", value: "#9b59b6" },
  { name: "Teal", value: "#1abc9c" },

  // Secondary colors
  { name: "Dark Blue", value: "#34495e" },
  { name: "Dark Orange", value: "#e67e22" },
  { name: "Dark Red", value: "#c0392b" },
  { name: "Dark Green", value: "#27ae60" },
  { name: "Dark Purple", value: "#8e44ad" },
  { name: "Dark Teal", value: "#16a085" },

  // Light colors
  { name: "Light Gray", value: "#f8f9fa" },
  { name: "Light Blue", value: "#e9ecef" },
  { name: "Light Green", value: "#d4edda" },
  { name: "Light Yellow", value: "#fff3cd" },
  { name: "Light Pink", value: "#f8d7da" },
  { name: "Light Orange", value: "#ffeaa7" },

  // Neutral colors
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#2c3e50" },
  { name: "Gray", value: "#95a5a6" },
  { name: "Light Gray", value: "#bdc3c7" },
  { name: "White", value: "#ffffff" },
];

// Helper functions for color conversion
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function RightPanel() {
  const open = useScheduleStore((s) => s.propertiesOpen);
  const toggle = useScheduleStore((s) => s.toggleProperties);
  const width = useScheduleStore((s) => s.propertiesWidth);
  const setWidth = useScheduleStore((s) => s.setPropertiesWidth);
  const selectedActivityId = useScheduleStore((s) => s.selectedActivityId);
  const selectedActivityIds = useScheduleStore((s) => s.selectedActivityIds);
  const data = useScheduleStore((s) => s.data);
  const updateActivityProperty = useScheduleStore(
    (s) => s.updateActivityProperty
  );
  const updateMultipleActivities = useScheduleStore(
    (s) => s.updateMultipleActivities
  );
  const setSelectedActivity = useScheduleStore((s) => s.setSelectedActivity);

  if (!open) {
    return (
      <Box
        width={28}
        bgcolor="#ecf0f1"
        borderLeft="2px solid #bdc3c7"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ boxSizing: "border-box" }}
      >
        <IconButton size="small" onClick={toggle} aria-label="Open properties">
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      width={width}
      bgcolor="#ecf0f1"
      display="flex"
      flexDirection="column"
      borderLeft="2px solid #bdc3c7"
      sx={{ boxSizing: "border-box", position: "relative" }}
    >
      <Box
        px={1.5}
        py={0.75}
        bgcolor="#34495e"
        color="#fff"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ position: "sticky", top: 0, zIndex: 3 }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Properties
        </Typography>
        <IconButton
          size="small"
          onClick={toggle}
          aria-label="Close properties"
          sx={{ color: "#fff" }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* Resizer handle */}
      <Box
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startW = width;
          function onMove(ev: MouseEvent) {
            setWidth(startW + (startX - ev.clientX));
          }
          function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          }
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp, { once: true });
        }}
        sx={{
          position: "absolute",
          left: -4,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: "col-resize",
          zIndex: 2,
        }}
      />
      <Box p={2} sx={{ overflowY: "auto", flex: 1 }}>
        {selectedActivityIds.length > 0 && data ? (
          selectedActivityIds.length === 1 ? (
            <ActivityProperties
              activity={
                data.activities.find((a) => a.id === selectedActivityIds[0])!
              }
              onUpdate={(property, value) =>
                updateActivityProperty(selectedActivityIds[0], property, value)
              }
              onClose={() => setSelectedActivity(null)}
            />
          ) : (
            <MultiActivityProperties
              activities={data.activities.filter((a) =>
                selectedActivityIds.includes(a.id)
              )}
              onUpdate={(property, value) =>
                updateMultipleActivities(selectedActivityIds, property, value)
              }
              onClose={() => setSelectedActivity(null)}
            />
          )
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on an activity to view its properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hold Shift and click to select multiple activities
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface ActivityPropertiesProps {
  activity: Activity;
  onUpdate: (property: keyof Activity, value: any) => void;
  onClose: () => void;
}

function ActivityProperties({
  activity,
  onUpdate,
  onClose,
}: ActivityPropertiesProps) {
  const [barSectionOpen, setBarSectionOpen] = useState(false);
  const [labelSectionOpen, setLabelSectionOpen] = useState(false);
  const [infoSectionOpen, setInfoSectionOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerTab, setColorPickerTab] = useState(0);
  const [customColor, setCustomColor] = useState(
    activity?.customColor || "#3498db"
  );
  const [rgbValues, setRgbValues] = useState({ r: 52, g: 152, b: 219 });
  const [hexInput, setHexInput] = useState(activity?.customColor || "#3498db");

  const handleColorChange = (color: string) => {
    onUpdate("customColor", color);
  };

  // Update RGB values when color changes
  useEffect(() => {
    const rgb = hexToRgb(customColor);
    if (rgb) {
      setRgbValues(rgb);
      setHexInput(customColor);
    }
  }, [customColor]);

  const handlePredefinedColor = (color: string) => {
    setCustomColor(color);
    handleColorChange(color);
    setColorPickerOpen(false);
  };

  const handleRgbChange = (component: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgbValues, [component]: value };
    setRgbValues(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCustomColor(hex);
    setHexInput(hex);
  };

  const handleHexChange = (hex: string) => {
    if (/^#?[0-9A-F]{6}$/i.test(hex)) {
      const normalizedHex = hex.startsWith("#") ? hex : `#${hex}`;
      setHexInput(normalizedHex);
      setCustomColor(normalizedHex);
      const rgb = hexToRgb(normalizedHex);
      if (rgb) setRgbValues(rgb);
    }
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  const handleColorSelect = (color: string) => {
    handleColorChange(color);
  };

  const handleBarHeightChange = (height: number) => {
    onUpdate("customBarHeight", height);
  };

  const handleFontSizeChange = (size: number) => {
    onUpdate("customFontSize", size);
  };

  const handleFontFamilyChange = (family: string) => {
    onUpdate("customFontFamily", family);
  };

  const handleBarStyleChange = (style: "solid" | "dashed" | "dotted") => {
    onUpdate("barStyle", style);
  };

  const handleLabelPositionChange = (
    position: "left" | "right" | "top" | "bottom" | "bar" | "none" | "mixed"
  ) => {
    if (position !== "mixed") {
      onUpdate("labelPosition", position);
    }
  };

  const handleReset = () => {
    onUpdate("customColor", undefined);
    onUpdate("customBarHeight", undefined);
    onUpdate("customFontSize", undefined);
    onUpdate("customFontFamily", undefined);
    onUpdate("barStyle", undefined);
    onUpdate("labelPosition", undefined);
  };

  return (
    <Stack spacing={3}>
      {/* Activity Info */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: "#000000" }}>
          {activity.name}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {activity.isCritical && (
            <Chip label="Critical" color="error" size="small" />
          )}
          {activity.percentComplete && (
            <Chip
              label={`${activity.percentComplete}% Complete`}
              color="primary"
              size="small"
            />
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Activity Information */}
      <Box>
        <ListItemButton
          onClick={() => setInfoSectionOpen(!infoSectionOpen)}
          sx={{ px: 0, py: 1 }}
        >
          <Typography
            variant="subtitle2"
            sx={{ flexGrow: 1, color: "#000000" }}
          >
            Activity Information
          </Typography>
          {infoSectionOpen ? (
            <ExpandLess sx={{ color: "#000000" }} />
          ) : (
            <ExpandMore sx={{ color: "#000000" }} />
          )}
        </ListItemButton>
        <Collapse in={infoSectionOpen} timeout="auto" unmountOnExit>
          <Stack spacing={2} sx={{ pl: 2, pr: 1 }}>
            {/* Total Float */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ color: "#000000" }}>
                  Total Float
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "medium", color: "#000000" }}
                >
                  {activity.totalFloatDays !== undefined
                    ? `${activity.totalFloatDays.toFixed(1)} days`
                    : "Not available"}
                </Typography>
              </Stack>
              {activity.totalFloatDays !== undefined &&
                activity.totalFloatDays <= 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#000000", mt: 0.5, display: "block" }}
                  >
                    Critical path activity (zero or negative float)
                  </Typography>
                )}
            </Box>

            {/* Duration */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ color: "#000000" }}>
                  Duration
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "medium", color: "#000000" }}
                >
                  {activity.durationDays !== undefined
                    ? `${activity.durationDays.toFixed(1)} days`
                    : "Not available"}
                </Typography>
              </Stack>
            </Box>

            {/* Critical Path Status */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" sx={{ color: "#000000" }}>
                  Critical Path Status
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "medium", color: "#000000" }}
                >
                  {activity.isCritical === true
                    ? "Critical Path Activity"
                    : activity.isCritical === false
                      ? "Non-Critical Activity"
                      : "Unknown"}
                </Typography>
              </Stack>
            </Box>

            {/* Progress */}
            {activity.percentComplete !== undefined && (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    Progress
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "medium", color: "#000000" }}
                  >
                    {activity.percentComplete}% Complete
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </Collapse>
      </Box>

      <Divider />

      {/* Visual Customization */}
      <Box>
        <Stack spacing={2}>
          {/* Bar Section */}
          <Box>
            <ListItemButton
              onClick={() => setBarSectionOpen(!barSectionOpen)}
              sx={{ px: 0, py: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ flexGrow: 1, color: "#000000" }}
              >
                Bar Properties
              </Typography>
              {barSectionOpen ? (
                <ExpandLess sx={{ color: "#000000" }} />
              ) : (
                <ExpandMore sx={{ color: "#000000" }} />
              )}
            </ListItemButton>
            <Collapse in={barSectionOpen} timeout="auto" unmountOnExit>
              <Stack spacing={2} sx={{ pl: 2, pr: 1 }}>
                {/* Color */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Bar Color
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 32,
                        backgroundColor: activity.customColor || "#3498db",
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => setColorPickerOpen(true)}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleColorChange(undefined)}
                    >
                      Default
                    </Button>
                  </Stack>
                </Box>

                {/* Bar Height */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Bar Height: {activity.customBarHeight || "Default"}px
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={activity.customBarHeight || ""}
                    onChange={(e) =>
                      handleBarHeightChange(Number(e.target.value) || undefined)
                    }
                    placeholder="Default"
                    inputProps={{ min: 8, max: 40 }}
                    fullWidth
                  />
                </Box>

                {/* Bar Style */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Bar Style</InputLabel>
                  <Select
                    label="Bar Style"
                    value={activity.barStyle || "solid"}
                    onChange={(e) =>
                      handleBarStyleChange(
                        e.target.value as "solid" | "dashed" | "dotted"
                      )
                    }
                  >
                    <MenuItem value="solid">Solid</MenuItem>
                    <MenuItem value="dashed">Dashed</MenuItem>
                    <MenuItem value="dotted">Dotted</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Collapse>
          </Box>

          {/* Label Section */}
          <Box>
            <ListItemButton
              onClick={() => setLabelSectionOpen(!labelSectionOpen)}
              sx={{ px: 0, py: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ flexGrow: 1, color: "#000000" }}
              >
                Label Properties
              </Typography>
              {labelSectionOpen ? (
                <ExpandLess sx={{ color: "#000000" }} />
              ) : (
                <ExpandMore sx={{ color: "#000000" }} />
              )}
            </ListItemButton>
            <Collapse in={labelSectionOpen} timeout="auto" unmountOnExit>
              <Stack spacing={2} sx={{ pl: 2, pr: 1 }}>
                {/* Font Size */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Label Font Size: {activity.customFontSize || "Default"}px
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={activity.customFontSize || ""}
                    onChange={(e) =>
                      handleFontSizeChange(Number(e.target.value) || undefined)
                    }
                    placeholder="Default"
                    inputProps={{ min: 8, max: 24 }}
                    fullWidth
                  />
                </Box>

                {/* Font Family */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Label Font</InputLabel>
                  <Select
                    label="Label Font"
                    value={activity.customFontFamily || "default"}
                    onChange={(e) =>
                      handleFontFamilyChange(
                        e.target.value === "default"
                          ? undefined
                          : e.target.value
                      )
                    }
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                    <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
                    <MenuItem value="'Times New Roman', serif">
                      Times New Roman
                    </MenuItem>
                    <MenuItem value="'Courier New', monospace">
                      Courier New
                    </MenuItem>
                    <MenuItem value="'Segoe UI', sans-serif">Segoe UI</MenuItem>
                  </Select>
                </FormControl>

                {/* Label Position */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Label Position</InputLabel>
                  <Select
                    label="Label Position"
                    value={activity.labelPosition || "right"}
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
                  >
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="top">Top</MenuItem>
                    <MenuItem value="bottom">Bottom</MenuItem>
                    <MenuItem value="bar">Inside Bar</MenuItem>
                    <MenuItem value="none">None</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Actions */}
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={handleReset} fullWidth>
          Reset to Default
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} fullWidth>
          Close
        </Button>
      </Stack>

      {/* Color Picker Dialog */}
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        currentColor={activity.customColor || "#3498db"}
        onColorSelect={handleColorSelect}
      />
    </Stack>
  );
}

// Advanced Color Picker Component
function ColorPickerDialog({
  open,
  onClose,
  currentColor,
  onColorSelect,
}: {
  open: boolean;
  onClose: () => void;
  currentColor: string;
  onColorSelect: (color: string) => void;
}) {
  const [tab, setTab] = useState(0);
  const [customColor, setCustomColor] = useState(currentColor);
  const [rgbValues, setRgbValues] = useState({ r: 52, g: 152, b: 219 });
  const [hexInput, setHexInput] = useState(currentColor);

  useEffect(() => {
    const rgb = hexToRgb(customColor);
    if (rgb) {
      setRgbValues(rgb);
      setHexInput(customColor);
    }
  }, [customColor]);

  const handleRgbChange = (component: "r" | "g" | "b", value: number) => {
    const newRgb = { ...rgbValues, [component]: value };
    setRgbValues(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setCustomColor(hex);
    setHexInput(hex);
  };

  const handleHexChange = (hex: string) => {
    if (/^#?[0-9A-F]{6}$/i.test(hex)) {
      const normalizedHex = hex.startsWith("#") ? hex : `#${hex}`;
      setHexInput(normalizedHex);
      setCustomColor(normalizedHex);
      const rgb = hexToRgb(normalizedHex);
      if (rgb) setRgbValues(rgb);
    }
  };

  const handleApply = () => {
    onColorSelect(customColor);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Choose Bar Color</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Predefined" />
            <Tab label="RGB" />
            <Tab label="HEX" />
          </Tabs>

          {/* Predefined Colors Tab */}
          {tab === 0 && (
            <Grid container spacing={1}>
              {PREDEFINED_COLORS.map((color, index) => (
                <Grid item xs={4} sm={3} key={`color-${index}-${color.value}`}>
                  <Paper
                    sx={{
                      p: 1,
                      cursor: "pointer",
                      backgroundColor: color.value,
                      color: color.value === "#ffffff" ? "#000000" : "#ffffff",
                      textAlign: "center",
                      border:
                        customColor === color.value
                          ? "2px solid #000"
                          : "1px solid #ccc",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => setCustomColor(color.value)}
                  >
                    <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                      {color.name}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* RGB Tab */}
          {tab === 1 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Red: {rgbValues.r}
                </Typography>
                <Slider
                  value={rgbValues.r}
                  onChange={(_, value) => handleRgbChange("r", value as number)}
                  min={0}
                  max={255}
                  sx={{ color: "#f44336" }}
                />
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Green: {rgbValues.g}
                </Typography>
                <Slider
                  value={rgbValues.g}
                  onChange={(_, value) => handleRgbChange("g", value as number)}
                  min={0}
                  max={255}
                  sx={{ color: "#4caf50" }}
                />
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Blue: {rgbValues.b}
                </Typography>
                <Slider
                  value={rgbValues.b}
                  onChange={(_, value) => handleRgbChange("b", value as number)}
                  min={0}
                  max={255}
                  sx={{ color: "#2196f3" }}
                />
              </Box>
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Preview
                </Typography>
                <Box
                  sx={{
                    width: 100,
                    height: 50,
                    backgroundColor: customColor,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    mx: "auto",
                  }}
                />
              </Box>
            </Stack>
          )}

          {/* HEX Tab */}
          {tab === 2 && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="HEX Color"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={(e) => handleHexChange(e.target.value)}
                placeholder="#3498db"
                helperText="Enter a 6-digit hex color code"
              />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" gutterBottom>
                  Preview
                </Typography>
                <Box
                  sx={{
                    width: 100,
                    height: 50,
                    backgroundColor: customColor,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    mx: "auto",
                  }}
                />
              </Box>
            </Stack>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApply}
          variant="contained"
          sx={{ backgroundColor: customColor }}
        >
          Apply Color
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface MultiActivityPropertiesProps {
  activities: Activity[];
  onUpdate: (property: keyof Activity, value: any) => void;
  onClose: () => void;
}

function MultiActivityProperties({
  activities,
  onUpdate,
  onClose,
}: MultiActivityPropertiesProps) {
  const [barSectionOpen, setBarSectionOpen] = useState(false);
  const [labelSectionOpen, setLabelSectionOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3498db");

  const handleColorChange = (color: string) => {
    onUpdate("customColor", color);
  };

  const handleColorPickerClose = () => {
    setColorPickerOpen(false);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    handleColorChange(color);
  };

  const handleBarHeightChange = (height: number) => {
    onUpdate("customBarHeight", height);
  };

  const handleFontSizeChange = (size: number) => {
    onUpdate("customFontSize", size);
  };

  const handleFontFamilyChange = (family: string) => {
    onUpdate("customFontFamily", family);
  };

  const handleBarStyleChange = (style: "solid" | "dashed" | "dotted") => {
    onUpdate("barStyle", style);
  };

  const handleLabelPositionChange = (
    position: "left" | "right" | "top" | "bottom" | "bar" | "none" | "mixed"
  ) => {
    if (position !== "mixed") {
      onUpdate("labelPosition", position);
    }
  };

  const handleReset = () => {
    onUpdate("customColor", undefined);
    onUpdate("customBarHeight", undefined);
    onUpdate("customFontSize", undefined);
    onUpdate("customFontFamily", undefined);
    onUpdate("barStyle", undefined);
    onUpdate("labelPosition", undefined);
  };

  return (
    <Stack spacing={3}>
      {/* Multi-Activity Info */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: "#000000" }}>
          {activities.length} Activities Selected
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {activities.slice(0, 3).map((activity, index) => (
            <Chip
              key={activity.id}
              label={
                activity.name.length > 20
                  ? activity.name.substring(0, 20) + "..."
                  : activity.name
              }
              size="small"
              color="primary"
            />
          ))}
          {activities.length > 3 && (
            <Chip
              label={`+${activities.length - 3} more`}
              size="small"
              color="default"
            />
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Bulk Visual Customization */}
      <Box>
        <Stack spacing={2}>
          {/* Bar Section */}
          <Box>
            <ListItemButton
              onClick={() => setBarSectionOpen(!barSectionOpen)}
              sx={{ px: 0, py: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ flexGrow: 1, color: "#000000" }}
              >
                Bar Properties
              </Typography>
              {barSectionOpen ? (
                <ExpandLess sx={{ color: "#000000" }} />
              ) : (
                <ExpandMore sx={{ color: "#000000" }} />
              )}
            </ListItemButton>
            <Collapse in={barSectionOpen} timeout="auto" unmountOnExit>
              <Stack spacing={2} sx={{ pl: 2, pr: 1 }}>
                {/* Color */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Bar Color
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 32,
                        backgroundColor: selectedColor,
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => setColorPickerOpen(true)}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleColorChange(undefined)}
                    >
                      Default
                    </Button>
                  </Stack>
                </Box>

                {/* Bar Height */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Bar Height
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value=""
                    onChange={(e) =>
                      handleBarHeightChange(Number(e.target.value) || undefined)
                    }
                    placeholder="Default"
                    inputProps={{ min: 8, max: 40 }}
                    fullWidth
                  />
                </Box>

                {/* Bar Style */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Bar Style</InputLabel>
                  <Select
                    label="Bar Style"
                    value="solid"
                    onChange={(e) =>
                      handleBarStyleChange(
                        e.target.value as "solid" | "dashed" | "dotted"
                      )
                    }
                  >
                    <MenuItem value="solid">Solid</MenuItem>
                    <MenuItem value="dashed">Dashed</MenuItem>
                    <MenuItem value="dotted">Dotted</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Collapse>
          </Box>

          {/* Label Section */}
          <Box>
            <ListItemButton
              onClick={() => setLabelSectionOpen(!labelSectionOpen)}
              sx={{ px: 0, py: 1 }}
            >
              <Typography
                variant="subtitle2"
                sx={{ flexGrow: 1, color: "#000000" }}
              >
                Label Properties
              </Typography>
              {labelSectionOpen ? (
                <ExpandLess sx={{ color: "#000000" }} />
              ) : (
                <ExpandMore sx={{ color: "#000000" }} />
              )}
            </ListItemButton>
            <Collapse in={labelSectionOpen} timeout="auto" unmountOnExit>
              <Stack spacing={2} sx={{ pl: 2, pr: 1 }}>
                {/* Font Size */}
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Label Font Size
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value=""
                    onChange={(e) =>
                      handleFontSizeChange(Number(e.target.value) || undefined)
                    }
                    placeholder="Default"
                    inputProps={{ min: 8, max: 24 }}
                    fullWidth
                  />
                </Box>

                {/* Font Family */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Label Font</InputLabel>
                  <Select
                    label="Label Font"
                    value="default"
                    onChange={(e) =>
                      handleFontFamilyChange(
                        e.target.value === "default"
                          ? undefined
                          : e.target.value
                      )
                    }
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="Arial, sans-serif">Arial</MenuItem>
                    <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
                    <MenuItem value="'Times New Roman', serif">
                      Times New Roman
                    </MenuItem>
                    <MenuItem value="'Courier New', monospace">
                      Courier New
                    </MenuItem>
                    <MenuItem value="'Segoe UI', sans-serif">Segoe UI</MenuItem>
                  </Select>
                </FormControl>

                {/* Label Position */}
                <FormControl size="small" fullWidth>
                  <InputLabel>Label Position</InputLabel>
                  <Select
                    label="Label Position"
                    value={(() => {
                      // Check if all activities have the same label position
                      const positions = activities.map(
                        (a) => a.labelPosition || "right"
                      );
                      const uniquePositions = [...new Set(positions)];
                      return uniquePositions.length === 1
                        ? uniquePositions[0]
                        : "mixed";
                    })()}
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
                  >
                    <MenuItem value="mixed" disabled>
                      Mixed (select activities individually)
                    </MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                    <MenuItem value="top">Top</MenuItem>
                    <MenuItem value="bottom">Bottom</MenuItem>
                    <MenuItem value="bar">Inside Bar</MenuItem>
                    <MenuItem value="none">None</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Actions */}
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={handleReset} fullWidth>
          Reset All to Default
        </Button>
        <Button variant="outlined" size="small" onClick={onClose} fullWidth>
          Close
        </Button>
      </Stack>

      {/* Color Picker Dialog */}
      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        currentColor={selectedColor}
        onColorSelect={handleColorSelect}
      />
    </Stack>
  );
}
