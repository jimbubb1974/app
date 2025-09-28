import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

export function SaveProjectDialog() {
  const open = useScheduleStore((s) => s.saveProjectOpen);
  const setOpen = useScheduleStore((s) => s.setSaveProjectOpen);
  const saveCurrentProject = useScheduleStore((s) => s.saveCurrentProject);
  const data = useScheduleStore((s) => s.data);

  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(data?.projectName || "Untitled");
  }, [open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveCurrentProject(name.trim());
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Save Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
