import { Box, Button, Divider, Typography } from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";
import { useRef } from "react";
// toggle handled here too so user can collapse/expand from toolbar in future
import { parseXer } from "../parsers/xer";
import { parseJson } from "../parsers/json";

export function Toolbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setData = useScheduleStore((s) => s.setData);
  const setStatus = useScheduleStore((s) => s.setStatus);
  const setError = useScheduleStore((s) => s.setError);
  const fitAll = useScheduleStore((s) => s.fitAll);
  const zoom = useScheduleStore((s) => s.zoom);
  const toggleProperties = useScheduleStore((s) => s.toggleProperties);

  async function handleImport(file: File) {
    setStatus("loading");
    setError(undefined);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let data;
      if (ext === "json") {
        data = await parseJson(file);
      } else if (ext === "xer" || ext === "txt") {
        data = await parseXer(file);
      } else {
        // Default to JSON for Tier 1 to simplify testing
        data = await parseJson(file);
      }
      setData(data);
      setStatus("loaded");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Import failed");
    }
  }

  const btnSx = {
    bgcolor: "#34495e",
    whiteSpace: "nowrap",
    textTransform: "none",
    minWidth: 0,
    px: 1.2,
    py: 0.4,
    lineHeight: 1.2,
  } as const;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1.5}
      py={0.5}
      bgcolor="#2c3e50"
      color="#fff"
      boxShadow={1}
      sx={{ minWidth: 0 }}
    >
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        FILE
      </Typography>
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => inputRef.current?.click()}
      >
        Import
      </Button>
      <Button size="small" variant="contained" sx={btnSx}>
        Export
      </Button>
      <Button size="small" variant="contained" sx={btnSx}>
        Save Config
      </Button>
      <Divider
        flexItem
        orientation="vertical"
        sx={{ borderColor: "#34495e", mx: 2 }}
      />
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        VIEW
      </Typography>
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => zoom(0.8)}
      >
        Zoom In
      </Button>
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => zoom(1.25)}
      >
        Zoom Out
      </Button>
      <Button size="small" variant="contained" sx={btnSx} onClick={fitAll}>
        Fit All
      </Button>
      <Divider
        flexItem
        orientation="vertical"
        sx={{ borderColor: "#34495e", mx: 2 }}
      />
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        FORMAT
      </Typography>
      <Button size="small" variant="contained" sx={btnSx}>
        Colors
      </Button>
      <Button size="small" variant="contained" sx={btnSx}>
        Labels
      </Button>
      <Divider
        flexItem
        orientation="vertical"
        sx={{ borderColor: "#34495e", mx: 2 }}
      />
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        ANALYSIS
      </Typography>
      <Button size="small" variant="contained" sx={btnSx}>
        Critical Path
      </Button>
      <Divider
        flexItem
        orientation="vertical"
        sx={{ borderColor: "#34495e", mx: 2 }}
      />
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        LAYOUT
      </Typography>
      <Button size="small" variant="contained" sx={btnSx}>
        Manual Mode
      </Button>
      <Button size="small" variant="contained" sx={btnSx}>
        Auto Layout
      </Button>
      <Button size="small" variant="contained" sx={btnSx} onClick={toggleProperties}>
        Toggle Properties
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept=".json,.xer,.txt"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImport(f);
          e.currentTarget.value = "";
        }}
      />
    </Box>
  );
}
