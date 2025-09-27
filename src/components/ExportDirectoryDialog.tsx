import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { FolderOpen, Folder } from "@mui/icons-material";
import { useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";

interface ExportDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (path: string, filename: string) => void;
  currentFilename?: string;
}

export function ExportDirectoryDialog({
  open,
  onClose,
  onConfirm,
  currentFilename = "gantt-chart",
}: ExportDirectoryDialogProps) {
  const exportPath = useScheduleStore((s) => s.exportPath);
  const [selectedPath, setSelectedPath] = useState(exportPath);
  const [filename, setFilename] = useState(currentFilename);

  const handleBrowse = async () => {
    try {
      // Use the File System Access API if available (modern browsers)
      if ("showDirectoryPicker" in window) {
        console.log("File System Access API is available");
        const directoryHandle = await (window as any).showDirectoryPicker({
          mode: "readwrite",
          startIn: "documents",
        });
        console.log("Directory selected:", directoryHandle);
        // Store the directory handle for later use
        (window as any).exportDirectoryHandle = directoryHandle;
        setSelectedPath(directoryHandle.name);
        console.log(
          "Directory handle stored:",
          (window as any).exportDirectoryHandle
        );
      } else {
        console.log("File System Access API not available, using fallback");
        // Fallback: use a simple prompt for directory path
        const path = prompt("Enter export directory path:", selectedPath);
        if (path) {
          setSelectedPath(path);
        }
      }
    } catch (error) {
      console.log("Directory selection failed:", error);
      // Directory selection cancelled or failed - silently handle
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedPath, filename);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPath(exportPath); // Reset to current value
    setFilename(currentFilename); // Reset filename
    onClose();
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
      <DialogTitle>Export Settings</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Filename */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Filename
            </Typography>
            <TextField
              size="small"
              fullWidth
              label="File name"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="gantt-chart"
              helperText="File extension will be added automatically"
            />
          </Box>

          {/* Directory Selection */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Export Directory
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                label="Save to"
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                placeholder="./export"
                helperText="Default: ./export (relative to project root)"
              />
              <IconButton
                onClick={handleBrowse}
                color="primary"
                title="Browse for directory"
              >
                <FolderOpen />
              </IconButton>
            </Stack>
          </Box>

          {/* Preview */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Export Preview
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Folder color="action" />
              <Typography variant="caption" color="text.secondary">
                Files will be saved as: {filename || "gantt-chart"}.* in{" "}
                {selectedPath || "./export"}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Apply Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
