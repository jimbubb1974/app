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
  Chip
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useScheduleStore } from "../state/useScheduleStore";
import { Activity } from "../types/schedule";

export function RightPanel() {
  const open = useScheduleStore((s) => s.propertiesOpen);
  const toggle = useScheduleStore((s) => s.toggleProperties);
  const width = useScheduleStore((s) => s.propertiesWidth);
  const setWidth = useScheduleStore((s) => s.setPropertiesWidth);
  const selectedActivityId = useScheduleStore((s) => s.selectedActivityId);
  const data = useScheduleStore((s) => s.data);
  const updateActivityProperty = useScheduleStore((s) => s.updateActivityProperty);
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
        {selectedActivityId && data ? (
          <ActivityProperties 
            activity={data.activities.find(a => a.id === selectedActivityId)!}
            onUpdate={(property, value) => updateActivityProperty(selectedActivityId, property, value)}
            onClose={() => setSelectedActivity(null)}
          />
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Click on an activity to view its properties
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select any activity in the Gantt chart to customize its appearance
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

function ActivityProperties({ activity, onUpdate, onClose }: ActivityPropertiesProps) {
  const handleColorChange = (color: string) => {
    onUpdate('customColor', color);
  };

  const handleBarHeightChange = (height: number) => {
    onUpdate('customBarHeight', height);
  };

  const handleFontSizeChange = (size: number) => {
    onUpdate('customFontSize', size);
  };

  const handleFontFamilyChange = (family: string) => {
    onUpdate('customFontFamily', family);
  };

  const handleBarStyleChange = (style: "solid" | "dashed" | "dotted") => {
    onUpdate('barStyle', style);
  };

  const handleShowLabelChange = (show: boolean) => {
    onUpdate('showLabel', show);
  };

  const handleReset = () => {
    onUpdate('customColor', undefined);
    onUpdate('customBarHeight', undefined);
    onUpdate('customFontSize', undefined);
    onUpdate('customFontFamily', undefined);
    onUpdate('barStyle', undefined);
    onUpdate('showLabel', undefined);
  };

  return (
    <Stack spacing={3}>
      {/* Activity Info */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {activity.name}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {activity.isCritical && (
            <Chip label="Critical" color="error" size="small" />
          )}
          {activity.percentComplete && (
            <Chip label={`${activity.percentComplete}% Complete`} color="primary" size="small" />
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Visual Customization */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Visual Properties
        </Typography>
        
        <Stack spacing={2}>
          {/* Color */}
          <FormControl size="small" fullWidth>
            <InputLabel>Bar Color</InputLabel>
            <Select
              label="Bar Color"
              value={activity.customColor || 'default'}
              onChange={(e) => handleColorChange(e.target.value === 'default' ? undefined : e.target.value)}
            >
              <MenuItem value="default">Default (Blue)</MenuItem>
              <MenuItem value="#e74c3c">Red</MenuItem>
              <MenuItem value="#27ae60">Green</MenuItem>
              <MenuItem value="#f39c12">Orange</MenuItem>
              <MenuItem value="#9b59b6">Purple</MenuItem>
              <MenuItem value="#1abc9c">Teal</MenuItem>
              <MenuItem value="#e67e22">Dark Orange</MenuItem>
              <MenuItem value="#34495e">Dark Blue</MenuItem>
            </Select>
          </FormControl>

          {/* Bar Height */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Bar Height: {activity.customBarHeight || 'Default'}px
            </Typography>
            <TextField
              size="small"
              type="number"
              value={activity.customBarHeight || ''}
              onChange={(e) => handleBarHeightChange(Number(e.target.value) || undefined)}
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
              value={activity.barStyle || 'solid'}
              onChange={(e) => handleBarStyleChange(e.target.value as "solid" | "dashed" | "dotted")}
            >
              <MenuItem value="solid">Solid</MenuItem>
              <MenuItem value="dashed">Dashed</MenuItem>
              <MenuItem value="dotted">Dotted</MenuItem>
            </Select>
          </FormControl>

          {/* Font Size */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Label Font Size: {activity.customFontSize || 'Default'}px
            </Typography>
            <TextField
              size="small"
              type="number"
              value={activity.customFontSize || ''}
              onChange={(e) => handleFontSizeChange(Number(e.target.value) || undefined)}
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
              value={activity.customFontFamily || 'default'}
              onChange={(e) => handleFontFamilyChange(e.target.value === 'default' ? undefined : e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="Arial, sans-serif">Arial</MenuItem>
              <MenuItem value="Helvetica, sans-serif">Helvetica</MenuItem>
              <MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
              <MenuItem value="'Courier New', monospace">Courier New</MenuItem>
              <MenuItem value="'Segoe UI', sans-serif">Segoe UI</MenuItem>
            </Select>
          </FormControl>

          {/* Show Label */}
          <FormControl size="small" fullWidth>
            <InputLabel>Show Label</InputLabel>
            <Select
              label="Show Label"
              value={activity.showLabel !== false ? 'true' : 'false'}
              onChange={(e) => handleShowLabelChange(e.target.value === 'true')}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Divider />

      {/* Actions */}
      <Stack direction="row" spacing={1}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleReset}
          fullWidth
        >
          Reset to Default
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onClose}
          fullWidth
        >
          Close
        </Button>
      </Stack>
    </Stack>
  );
}
