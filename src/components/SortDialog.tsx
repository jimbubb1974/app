import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";
import { useState, useEffect } from "react";

export function SortDialog() {
  const sortOpen = useScheduleStore((s) => s.sortOpen);
  const setSortOpen = useScheduleStore((s) => s.setSortOpen);
  const sortSettings = useScheduleStore((s) => s.sortSettings);
  const setSortSettings = useScheduleStore((s) => s.setSortSettings);

  const [localSettings, setLocalSettings] = useState(sortSettings);

  useEffect(() => {
    setLocalSettings(sortSettings);
  }, [sortSettings]);

  const handleApply = () => {
    setSortSettings(localSettings);
    setSortOpen(false);
  };

  const handleCancel = () => {
    setLocalSettings(sortSettings);
    setSortOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: false,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
    };
    setLocalSettings(defaultSettings);
  };

  const handleSortByChange = (value: string) => {
    setLocalSettings((prev) => ({ ...prev, sortBy: value as any }));
  };

  const handleSortOrderChange = (value: string) => {
    setLocalSettings((prev) => ({ ...prev, sortOrder: value as any }));
  };

  return (
    <Dialog
      open={sortOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Sort Activities</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Enable Sort */}
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.enabled}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    enabled: e.target.checked,
                  }))
                }
              />
            }
            label="Enable Sorting"
          />

          {localSettings.enabled && (
            <>
              <Divider />

              {/* Sort By */}
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={localSettings.sortBy}
                    onChange={(e) => handleSortByChange(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Activity Name</MenuItem>
                    <MenuItem value="startDate">Start Date</MenuItem>
                    <MenuItem value="finishDate">Finish Date</MenuItem>
                    <MenuItem value="duration">Duration</MenuItem>
                    <MenuItem value="totalFloat">Total Float</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Choose the field to sort activities by
                </Typography>
              </Box>

              {/* Sort Order */}
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort Order</InputLabel>
                  <Select
                    value={localSettings.sortOrder}
                    onChange={(e) => handleSortOrderChange(e.target.value)}
                    label="Sort Order"
                  >
                    <MenuItem value="asc">Ascending (A-Z, 1-9)</MenuItem>
                    <MenuItem value="desc">Descending (Z-A, 9-1)</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Choose the order for sorting
                </Typography>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset
        </Button>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Sort
        </Button>
      </DialogActions>
    </Dialog>
  );
}
