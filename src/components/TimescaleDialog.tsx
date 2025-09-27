import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { useScheduleStore } from '../state/useScheduleStore';

export function TimescaleDialog() {
  const open = useScheduleStore(s => s.timescaleOpen);
  const top = useScheduleStore(s => s.timescaleTop);
  const bottom = useScheduleStore(s => s.timescaleBottom);
  const setTimescale = useScheduleStore(s => s.setTimescale);
  const setTimescaleOpen = useScheduleStore(s => s.setTimescaleOpen);

  return (
    <Dialog open={open} onClose={() => setTimescaleOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Timescale Settings</DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={2} mt={1}>
          <FormControl size="small" fullWidth>
            <InputLabel id="ts-top">Top Row</InputLabel>
            <Select labelId="ts-top" label="Top Row" value={top} onChange={(e) => setTimescale(e.target.value as any, bottom)}>
              <MenuItem value="year">Year</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel id="ts-bottom">Bottom Row</InputLabel>
            <Select labelId="ts-bottom" label="Bottom Row" value={bottom} onChange={(e) => setTimescale(top, e.target.value as any)}>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="week">Week</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTimescaleOpen(false)} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}


