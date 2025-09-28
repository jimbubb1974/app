import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";
import { useState, useEffect } from "react";

export function FilterDialog() {
  const filterOpen = useScheduleStore((s) => s.filterOpen);
  const setFilterOpen = useScheduleStore((s) => s.setFilterOpen);
  const filterSettings = useScheduleStore((s) => s.filterSettings);
  const setFilterSettings = useScheduleStore((s) => s.setFilterSettings);

  const [localSettings, setLocalSettings] = useState(filterSettings);

  useEffect(() => {
    setLocalSettings(filterSettings);
  }, [filterSettings]);

  const handleApply = () => {
    setFilterSettings(localSettings);
    setFilterOpen(false);
  };

  const handleCancel = () => {
    setLocalSettings(filterSettings);
    setFilterOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: false,
      nameFilter: "",
      criticalOnly: false,
      dateRange: {
        enabled: false,
        startDate: "",
        endDate: "",
      },
    };
    setLocalSettings(defaultSettings);
  };

  const handleNameFilterChange = (value: string) => {
    setLocalSettings((prev) => ({ ...prev, nameFilter: value }));
  };

  const handleCriticalOnlyChange = (checked: boolean) => {
    setLocalSettings((prev) => ({ ...prev, criticalOnly: checked }));
  };

  const handleDateRangeEnabledChange = (checked: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, enabled: checked },
    }));
  };

  const handleStartDateChange = (value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, startDate: value },
    }));
  };

  const handleEndDateChange = (value: string) => {
    setLocalSettings((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, endDate: value },
    }));
  };

  return (
    <Dialog
      open={filterOpen}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Filter Activities</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Enable Filter */}
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
            label="Enable Filtering"
          />

          {localSettings.enabled && (
            <>
              <Divider />

              {/* Name Filter */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Name Filter
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter activities by name..."
                  value={localSettings.nameFilter}
                  onChange={(e) => handleNameFilterChange(e.target.value)}
                />
                <Typography variant="caption" color="text.secondary">
                  Leave empty to show all activities
                </Typography>
              </Box>

              {/* Critical Path Filter */}
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.criticalOnly}
                    onChange={(e) => handleCriticalOnlyChange(e.target.checked)}
                  />
                }
                label="Show only critical path activities"
              />

              {/* Date Range Filter */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localSettings.dateRange.enabled}
                      onChange={(e) =>
                        handleDateRangeEnabledChange(e.target.checked)
                      }
                    />
                  }
                  label="Filter by date range"
                />

                {localSettings.dateRange.enabled && (
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      value={localSettings.dateRange.startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      value={localSettings.dateRange.endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Stack>
                )}
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
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
}
