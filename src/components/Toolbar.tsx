import {
  Box,
  Button,
  Divider,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  FileOpen,
  Save,
  Settings,
  Visibility,
  ZoomIn,
  ZoomOut,
  Palette,
  Label,
  Timeline,
  Analytics,
  Tune,
  ViewSidebar,
  AccountTree,
  FilterList,
  Sort,
  AutoFixHigh,
} from "@mui/icons-material";
import { useScheduleStore } from "../state/useScheduleStore";
import { useRef, useState } from "react";
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
  const setCriticalPathOpen = useScheduleStore((s) => s.setCriticalPathOpen);
  const setSourceFile = useScheduleStore((s) => s.setSourceFile);
  const logicLinesEnabled = useScheduleStore((s) => s.logicLinesEnabled);
  const setLogicLinesEnabled = useScheduleStore((s) => s.setLogicLinesEnabled);
  const setFilterOpen = useScheduleStore((s) => s.setFilterOpen);
  const setSortOpen = useScheduleStore((s) => s.setSortOpen);
  const setAutoLayoutOpen = useScheduleStore((s) => s.setAutoLayoutOpen);
  const settings = useScheduleStore((s) => s.settings);

  // Menu state
  const [fileMenuAnchor, setFileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [formatMenuAnchor, setFormatMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [analysisMenuAnchor, setAnalysisMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [filterSortMenuAnchor, setFilterSortMenuAnchor] =
    useState<null | HTMLElement>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    setter: (anchor: HTMLElement | null) => void
  ) => {
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter: (anchor: HTMLElement | null) => void) => {
    setter(null);
  };

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
      // Track source file
      setSourceFile({
        type: ext === "xer" || ext === "txt" ? "XER" : "JSON",
        filename: file.name,
        importedAt: new Date().toISOString(),
      });
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

  const menuButtonSx = {
    color: "#fff",
    textTransform: "none",
    px: 2,
    py: 1,
    "&:hover": {
      backgroundColor: "#34495e",
    },
  } as const;

  function blurActiveElement() {
    try {
      const active = document.activeElement as HTMLElement | null;
      if (active) active.blur();
    } catch {}
  }

  function applyDefaultsToAllActivities() {
    if (!data?.activities) return;
    
    const updatedActivities = data.activities.map(activity => ({
      ...activity,
      // Reset all custom properties to undefined so they use defaults
      customColor: undefined,
      customBarHeight: undefined,
      customFontSize: undefined,
      customFontFamily: undefined,
      barStyle: undefined,
      labelPosition: undefined,
    }));

    setData({
      ...data,
      activities: updatedActivities,
    });
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        bgcolor="#2c3e50"
        color="#fff"
        boxShadow={1}
        sx={{
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 5,
          flexShrink: 0,
          minHeight: 32,
        }}
      >
        {/* File Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setFileMenuAnchor)}
        >
          File
        </Button>

        {/* View Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setViewMenuAnchor)}
        >
          View
        </Button>

        {/* Format Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setFormatMenuAnchor)}
        >
          Format
        </Button>

        {/* Analysis Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setAnalysisMenuAnchor)}
        >
          Analysis
        </Button>

        {/* Layout Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setLayoutMenuAnchor)}
        >
          Layout
        </Button>

        {/* Filter & Sort Menu */}
        <Button
          sx={menuButtonSx}
          onClick={(e) => handleMenuOpen(e, setFilterSortMenuAnchor)}
        >
          Filter & Sort
        </Button>
      </Box>

      {/* File Menu */}
      <Menu
        anchorEl={fileMenuAnchor}
        open={Boolean(fileMenuAnchor)}
        onClose={() => handleMenuClose(setFileMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => {
            inputRef.current?.click();
            handleMenuClose(setFileMenuAnchor);
          }}
        >
          <ListItemIcon>
            <FileOpen fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setExportOpen(true);
            handleMenuClose(setFileMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Save fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFileMenuAnchor)}>
          <ListItemIcon>
            <Save fontSize="small" />
          </ListItemIcon>
          <ListItemText>Save Config</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Menu */}
      <Menu
        anchorEl={viewMenuAnchor}
        open={Boolean(viewMenuAnchor)}
        onClose={() => handleMenuClose(setViewMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => {
            fitAll();
            handleMenuClose(setViewMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Fit All</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setRangeOpen(true);
            handleMenuClose(setViewMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Set Range</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            zoom(0.8);
            handleMenuClose(setViewMenuAnchor);
          }}
        >
          <ListItemIcon>
            <ZoomIn fontSize="small" />
          </ListItemIcon>
          <ListItemText>Zoom In</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            zoom(1.25);
            handleMenuClose(setViewMenuAnchor);
          }}
        >
          <ListItemIcon>
            <ZoomOut fontSize="small" />
          </ListItemIcon>
          <ListItemText>Zoom Out</ListItemText>
        </MenuItem>
      </Menu>

      {/* Format Menu */}
      <Menu
        anchorEl={formatMenuAnchor}
        open={Boolean(formatMenuAnchor)}
        onClose={() => handleMenuClose(setFormatMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setSettingsOpen(true);
            handleMenuClose(setFormatMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Defaults</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            applyDefaultsToAllActivities();
            handleMenuClose(setFormatMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Apply Defaults Everywhere</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFormatMenuAnchor)}>
          <ListItemIcon>
            <Palette fontSize="small" />
          </ListItemIcon>
          <ListItemText>Colors</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(setFormatMenuAnchor)}>
          <ListItemIcon>
            <Label fontSize="small" />
          </ListItemIcon>
          <ListItemText>Labels</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setTimescaleOpen(true);
            handleMenuClose(setFormatMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Timeline fontSize="small" />
          </ListItemIcon>
          <ListItemText>Timescale & Format</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setLogicLinesEnabled(!logicLinesEnabled);
            handleMenuClose(setFormatMenuAnchor);
          }}
        >
          <ListItemIcon>
            <AccountTree fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {logicLinesEnabled ? "Hide Logic Lines" : "Show Logic Lines"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setCriticalPathOpen(true);
            handleMenuClose(setFormatMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Analytics fontSize="small" />
          </ListItemIcon>
          <ListItemText>Critical Path</ListItemText>
        </MenuItem>
      </Menu>

      {/* Analysis Menu */}
      <Menu
        anchorEl={analysisMenuAnchor}
        open={Boolean(analysisMenuAnchor)}
        onClose={() => handleMenuClose(setAnalysisMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={() => handleMenuClose(setAnalysisMenuAnchor)}>
          <ListItemIcon>
            <Analytics fontSize="small" />
          </ListItemIcon>
          <ListItemText>Coming Soon</ListItemText>
        </MenuItem>
      </Menu>

      {/* Layout Menu */}
      <Menu
        anchorEl={layoutMenuAnchor}
        open={Boolean(layoutMenuAnchor)}
        onClose={() => handleMenuClose(setLayoutMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={() => handleMenuClose(setLayoutMenuAnchor)}>
          <ListItemIcon>
            <Tune fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manual Mode</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setAutoLayoutOpen(true);
            handleMenuClose(setLayoutMenuAnchor);
          }}
        >
          <ListItemIcon>
            <AutoFixHigh fontSize="small" />
          </ListItemIcon>
          <ListItemText>Auto Layout</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            toggleProperties();
            handleMenuClose(setLayoutMenuAnchor);
          }}
        >
          <ListItemIcon>
            <ViewSidebar fontSize="small" />
          </ListItemIcon>
          <ListItemText>Toggle Properties</ListItemText>
        </MenuItem>
      </Menu>

      {/* Filter & Sort Menu */}
      <Menu
        anchorEl={filterSortMenuAnchor}
        open={Boolean(filterSortMenuAnchor)}
        onClose={() => handleMenuClose(setFilterSortMenuAnchor)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setFilterOpen(true);
            handleMenuClose(setFilterSortMenuAnchor);
          }}
        >
          <ListItemIcon>
            <FilterList fontSize="small" />
          </ListItemIcon>
          <ListItemText>Filter Activities</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            blurActiveElement();
            setSortOpen(true);
            handleMenuClose(setFilterSortMenuAnchor);
          }}
        >
          <ListItemIcon>
            <Sort fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sort Activities</ListItemText>
        </MenuItem>
      </Menu>

      {/* Hidden file input */}
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
    </>
  );
}
