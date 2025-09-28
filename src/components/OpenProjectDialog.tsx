import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

export function OpenProjectDialog() {
  const open = useScheduleStore((s) => s.openProjectOpen);
  const setOpen = useScheduleStore((s) => s.setOpenProjectOpen);
  const listSavedProjects = useScheduleStore((s) => s.listSavedProjects);
  const loadProjectByName = useScheduleStore((s) => s.loadProjectByName);
  const deleteSavedProject = useScheduleStore((s) => s.deleteSavedProject);

  const [projects, setProjects] = useState<{ name: string; savedAt: string }[]>(
    []
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      listSavedProjects().then(setProjects);
      setSelected(null);
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, query]);

  const handleLoad = async () => {
    if (!selected) return;
    await loadProjectByName(selected);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    await deleteSavedProject(selected);
    const next = await listSavedProjects();
    setProjects(next);
    setSelected(null);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Open Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            size="small"
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filtered.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No saved projects
            </Typography>
          ) : (
            <List dense>
              {filtered.map((p) => (
                <ListItem
                  key={p.name}
                  selected={selected === p.name}
                  onClick={() => setSelected(p.name)}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemText
                    primary={p.name}
                    secondary={new Date(p.savedAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleDelete} color="error" disabled={!selected}>
          Delete
        </Button>
        <Button onClick={handleLoad} variant="contained" disabled={!selected}>
          Load
        </Button>
      </DialogActions>
    </Dialog>
  );
}
