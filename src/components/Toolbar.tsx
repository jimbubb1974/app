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
  const setTimescaleOpen = useScheduleStore((s) => s.setTimescaleOpen);
  const setViewRange = useScheduleStore((s) => s.setViewRange);
  const setRangeOpen = useScheduleStore((s) => s.setRangeOpen);
  const setExportOpen = useScheduleStore((s) => s.setExportOpen);
  const setSettingsOpen = useScheduleStore((s) => s.setSettingsOpen);

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
      // Auto-fit to dataset on import
      const dates: number[] = [];
      for (const a of data.activities ?? []) {
        const s = new Date(a.start).getTime();
        const e = new Date(a.finish).getTime();
        if (!isNaN(s)) dates.push(s);
        if (!isNaN(e)) dates.push(e);
      }
      if (dates.length >= 2) {
        const min = Math.min(...dates);
        const max = Math.max(...dates);
        setViewRange(min, max);
      }
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
      sx={{
        minWidth: 0,
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        position: "sticky",
        top: 0,
        zIndex: 5,
        flexShrink: 0,
        minHeight: 40,
      }}
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
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => setExportOpen(true)}
      >
        Export
      </Button>
      <Button size="small" variant="contained" sx={btnSx}>
        Save Config
      </Button>
      <Button size="small" variant="contained" sx={btnSx} onClick={() => setSettingsOpen(true)}>
        Settings
      </Button>
      <Divider
        flexItem
        orientation="vertical"
        sx={{ borderColor: "#34495e", mx: 2 }}
      />
      <Typography variant="body2" sx={{ color: "#bdc3c7" }}>
        VIEW
      </Typography>
      {/* Manual view range controls (Tier 2 lightweight) */}
      {/* Future: move into a proper datepicker; keep simple buttons for now */}
      <Button size="small" variant="contained" sx={btnSx} onClick={fitAll}>
        Fit All
      </Button>
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => setRangeOpen(true)}
      >
        Set Range
      </Button>
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
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={() => setTimescaleOpen(true)}
      >
        Timescale
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
      <Button
        size="small"
        variant="contained"
        sx={btnSx}
        onClick={toggleProperties}
      >
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
