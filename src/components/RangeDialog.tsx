import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Box,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

function toDateInputValue(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function RangeDialog() {
  const open = useScheduleStore((s) => s.rangeOpen);
  const setOpen = useScheduleStore((s) => s.setRangeOpen);
  const viewStart = useScheduleStore((s) => s.viewStart);
  const viewEnd = useScheduleStore((s) => s.viewEnd);
  const setViewRange = useScheduleStore((s) => s.setViewRange);
  const extMin = useScheduleStore((s) => s.dataMin);
  const extMax = useScheduleStore((s) => s.dataMax);

  const [startVal, setStartVal] = useState<string>(toDateInputValue(viewStart));
  const [endVal, setEndVal] = useState<string>(toDateInputValue(viewEnd));

  // Keep local fields in sync when dialog opens or external range changes
  useMemo(() => {
    setStartVal(toDateInputValue(viewStart));
    setEndVal(toDateInputValue(viewEnd));
  }, [open, viewStart, viewEnd]);

  function apply() {
    const s = startVal ? new Date(startVal).getTime() : viewStart;
    const e = endVal ? new Date(endVal).getTime() : viewEnd;
    if (s && e && !isNaN(s) && !isNaN(e) && s < e) setViewRange(s, e);
    setOpen(false);
  }

  function fitToExtent() {
    if (extMin !== undefined && extMax !== undefined) {
      setViewRange(extMin, extMax);
    }
    setOpen(false);
  }

  function setToEarliest() {
    if (extMin !== undefined) {
      setStartVal(toDateInputValue(extMin));
    }
  }

  function setToLatest() {
    if (extMax !== undefined) {
      setEndVal(toDateInputValue(extMax));
    }
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Set View Range</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label="Start"
              type="date"
              size="small"
              value={startVal}
              onChange={(e) => setStartVal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={setToEarliest}
              disabled={extMin === undefined}
            >
              Earliest
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <TextField
              label="End"
              type="date"
              size="small"
              value={endVal}
              onChange={(e) => setEndVal(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={setToLatest}
              disabled={extMax === undefined}
            >
              Latest
            </Button>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={fitToExtent} color="secondary">
          Fit to data
        </Button>
        <Button onClick={apply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
