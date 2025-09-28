import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useScheduleStore } from "../state/useScheduleStore";
import { ExportDirectoryDialog } from "./ExportDirectoryDialog";

type ExportFormat = "svg" | "png" | "pdf" | "json";
type ExportRange = "current" | "full";
type PageSize = "8.5x11" | "11x17";
type Orientation = "portrait" | "landscape";

interface ExportOptions {
  format: ExportFormat;
  range: ExportRange;
  scale: number;
  includeHeader: boolean;
  includeFooter: boolean;
  headerText: string;
  footerText: string;
  includeChartTitle: boolean;
  chartTitle: string;
  includeChartCaption: boolean;
  chartCaption: string;
  filename: string;
  pageSize: PageSize;
  orientation: Orientation;
}

export function ExportDialog() {
  const open = useScheduleStore((s) => s.exportOpen);
  const setOpen = useScheduleStore((s) => s.setExportOpen);
  const data = useScheduleStore((s) => s.data);
  const viewStart = useScheduleStore((s) => s.viewStart);
  const viewEnd = useScheduleStore((s) => s.viewEnd);
  const dataMin = useScheduleStore((s) => s.dataMin);
  const dataMax = useScheduleStore((s) => s.dataMax);
  const sourceFile = useScheduleStore((s) => s.sourceFile);
  const settings = useScheduleStore((s) => s.settings);
  const leftOpen = useScheduleStore((s) => s.leftOpen);
  const leftWidth = useScheduleStore((s) => s.leftWidth);
  const propertiesOpen = useScheduleStore((s) => s.propertiesOpen);
  const propertiesWidth = useScheduleStore((s) => s.propertiesWidth);
  const timescaleTop = useScheduleStore((s) => s.timescaleTop);
  const timescaleBottom = useScheduleStore((s) => s.timescaleBottom);
  const exportPath = useScheduleStore((s) => s.exportPath);
  const setExportPath = useScheduleStore((s) => s.setExportPath);

  const [options, setOptions] = useState<ExportOptions>({
    format: "png",
    range: "current",
    scale: 2,
    includeHeader: true,
    includeFooter: true,
    headerText: data?.projectName || "Project Schedule",
    footerText: `Generated on ${new Date().toLocaleDateString()}`,
    filename: "gantt-chart",
    pageSize: "8.5x11",
    orientation: "landscape",
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const setSuccessNotification = useScheduleStore(
    (s) => s.setSuccessNotification
  );

  const handleFormatChange = (format: ExportFormat) => {
    setOptions((prev) => ({ ...prev, format }));
  };

  const handleRangeChange = (range: ExportRange) => {
    setOptions((prev) => ({ ...prev, range }));
  };

  const handleScaleChange = (scale: number) => {
    setOptions((prev) => ({ ...prev, scale: Math.max(1, Math.min(4, scale)) }));
  };

  const handleTextChange = (field: keyof ExportOptions, value: string) => {
    setOptions((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: keyof ExportOptions) => {
    setOptions((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getViewRangeText = () => {
    if (options.range === "current") {
      if (viewStart && viewEnd) {
        const start = new Date(viewStart).toLocaleDateString();
        const end = new Date(viewEnd).toLocaleDateString();
        return `${start} - ${end}`;
      }
      return "Current view";
    } else {
      if (dataMin && dataMax) {
        const start = new Date(dataMin).toLocaleDateString();
        const end = new Date(dataMax).toLocaleDateString();
        return `${start} - ${end}`;
      }
      return "Full schedule";
    }
  };

  const handleExport = async () => {
    try {
      const fileExtension = options.format === "json" ? "json" : options.format;
      const fullFilename = `${options.filename}.${fileExtension}`;

      let actualSaveLocation = "Downloads folder";

      if (options.format === "svg") {
        actualSaveLocation = await exportSVG(options, exportPath);
      } else if (options.format === "png") {
        actualSaveLocation = await exportPNG(options, exportPath);
      } else if (options.format === "pdf") {
        actualSaveLocation = await exportPDF(options, exportPath);
      } else if (options.format === "json") {
        actualSaveLocation = await exportJSON(exportPath, options);
      }

      // Show success notification with actual save location
      setSuccessNotification({
        open: true,
        message: `File saved: ${fullFilename} in ${actualSaveLocation}`,
      });

      setOpen(false);
    } catch (error) {
      // Silently fail; UI will show nothing. Optionally you can wire to snackbar state.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      disablePortal
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      disableScrollLock
    >
      <DialogTitle>Export Chart</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* File Format */}
          <FormControl size="small" fullWidth>
            <InputLabel>File Format</InputLabel>
            <Select
              label="File Format"
              value={options.format}
              onChange={(e) =>
                handleFormatChange(e.target.value as ExportFormat)
              }
            >
              <MenuItem value="svg">SVG (Vector)</MenuItem>
              <MenuItem value="png">PNG (Raster)</MenuItem>
              <MenuItem value="pdf">PDF (Document)</MenuItem>
              <MenuItem value="json">
                JSON (Project with Customizations)
              </MenuItem>
            </Select>
          </FormControl>

          {/* Export Range */}
          <FormControl size="small" fullWidth>
            <InputLabel>Export Range</InputLabel>
            <Select
              label="Export Range"
              value={options.range}
              onChange={(e) => handleRangeChange(e.target.value as ExportRange)}
            >
              <MenuItem value="current">
                Current View ({getViewRangeText()})
              </MenuItem>
              <MenuItem value="full">
                Full Schedule ({getViewRangeText()})
              </MenuItem>
            </Select>
          </FormControl>

          {/* Quality/Scale */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quality (Scale Factor)
            </Typography>
            <TextField
              size="small"
              type="number"
              value={options.scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              inputProps={{ min: 1, max: 4, step: 0.5 }}
              helperText="Higher values = better quality, larger file size"
              sx={{ width: 120 }}
            />
          </Box>

          {/* PDF Page Options - only show when PDF is selected */}
          {options.format === "pdf" && (
            <>
              <FormControl size="small" fullWidth>
                <InputLabel>Page Size</InputLabel>
                <Select
                  label="Page Size"
                  value={options.pageSize}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      pageSize: e.target.value as PageSize,
                    }))
                  }
                >
                  <MenuItem value="8.5x11">8.5" × 11" (Letter)</MenuItem>
                  <MenuItem value="11x17">11" × 17" (Tabloid)</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  label="Orientation"
                  value={options.orientation}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      orientation: e.target.value as Orientation,
                    }))
                  }
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <Divider />

          {/* Header Options */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeHeader}
                  onChange={() => handleToggle("includeHeader")}
                />
              }
              label="Include Header"
            />
            {options.includeHeader && (
              <TextField
                size="small"
                fullWidth
                label="Header Text"
                value={options.headerText}
                onChange={(e) => handleTextChange("headerText", e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Footer Options */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={options.includeFooter}
                  onChange={() => handleToggle("includeFooter")}
                />
              }
              label="Include Footer"
            />
            {options.includeFooter && (
              <TextField
                size="small"
                fullWidth
                label="Footer Text"
                value={options.footerText}
                onChange={(e) => handleTextChange("footerText", e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Export Settings */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Export Settings
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                fullWidth
                label="Filename"
                value={options.filename}
                onChange={(e) => handleTextChange("filename", e.target.value)}
                helperText="File extension will be added automatically"
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => setSettingsDialogOpen(true)}
              >
                Settings
              </Button>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Directory: {exportPath}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleExport} variant="contained">
          Export
        </Button>
      </DialogActions>

      {/* Export Settings Dialog */}
      <ExportDirectoryDialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onConfirm={(path, filename) => {
          setExportPath(path);
          setOptions((prev) => ({ ...prev, filename }));
          setSettingsDialogOpen(false);
        }}
        currentFilename={options.filename}
      />
    </Dialog>
  );
}

// Export functions
async function exportSVG(
  options: ExportOptions,
  exportPath: string
): Promise<string> {
  const svg = document.querySelector(
    'svg[data-export-id="gantt"]'
  ) as SVGSVGElement | null;
  if (!svg) return "Downloads folder";

  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Remove the rectangle above the timescale (the gap filler)
  // Look for rectangles with negative y values (above the timescale)
  const allRects = clone.querySelectorAll("rect");
  allRects.forEach((rect) => {
    const y = rect.getAttribute("y");
    if (y && parseFloat(y) < 0) {
      rect.remove();
    }
  });

  // Capture and embed all font styles
  const textElements = clone.querySelectorAll("text");
  const originalTextElements = svg.querySelectorAll("text");

  textElements.forEach((textEl, index) => {
    const originalText = originalTextElements[index];
    if (originalText) {
      const computedStyle = getComputedStyle(originalText as Element);
      textEl.setAttribute("font-family", computedStyle.fontFamily);
      textEl.setAttribute("font-size", computedStyle.fontSize);
      textEl.setAttribute("font-weight", computedStyle.fontWeight);
      textEl.setAttribute("font-style", computedStyle.fontStyle);
    }
  });

  // Add header and footer if enabled
  if (options.includeHeader || options.includeFooter) {
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const headerHeight = options.includeHeader ? 30 : 0;
    const footerHeight = options.includeFooter ? 30 : 0;

    // Adjust SVG dimensions
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height + headerHeight + footerHeight));

    // Add header
    if (options.includeHeader) {
      const headerGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const headerText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      headerText.setAttribute("x", String(width / 2));
      headerText.setAttribute("y", "20");
      headerText.setAttribute("text-anchor", "middle");
      headerText.setAttribute("font-size", "16");
      headerText.setAttribute("font-weight", "bold");
      headerText.textContent = options.headerText;
      headerGroup.appendChild(headerText);
      clone.insertBefore(headerGroup, clone.firstChild);
    }

    // Add footer
    if (options.includeFooter) {
      const footerGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const footerText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      footerText.setAttribute("x", String(width / 2));
      footerText.setAttribute("y", String(height + headerHeight + 20));
      footerText.setAttribute("text-anchor", "middle");
      footerText.setAttribute("font-size", "12");
      footerText.textContent = options.footerText;
      footerGroup.appendChild(footerText);
      clone.appendChild(footerGroup);
    }

    // Shift ALL content down if header is present to make room for the title
    if (options.includeHeader) {
      // Shift the timescale header groups
      const timescaleGroups = clone.querySelectorAll(
        'g[transform*="translate(0, 16)"]'
      );
      timescaleGroups.forEach((group) => {
        if (group.getAttribute("transform")) {
          const currentTransform = group.getAttribute("transform") || "";
          group.setAttribute(
            "transform",
            currentTransform.replace(
              /translate\(([^,]+),\s*([^)]+)\)/,
              (match, x, y) => `translate(${x}, ${parseFloat(y) + 30})`
            )
          );
        } else {
          group.setAttribute("transform", `translate(0, 46)`); // 16 + 30
        }
      });

      // Shift the bars group and other content
      const barsGroup = clone.querySelector('g[transform*="translate(0, 72)"]'); // The bars group
      const otherGroups = clone.querySelectorAll(
        'g:not([transform*="translate(0, 16)"])'
      ); // Not the header groups

      [barsGroup, ...otherGroups].forEach((group) => {
        if (group && !group.querySelector("text[text-anchor='middle']")) {
          if (group.getAttribute("transform")) {
            const currentTransform = group.getAttribute("transform") || "";
            group.setAttribute(
              "transform",
              currentTransform.replace(
                /translate\(([^,]+),\s*([^)]+)\)/,
                (match, x, y) => `translate(${x}, ${parseFloat(y) + 30})`
              )
            );
          } else {
            group.setAttribute("transform", `translate(0, 30)`);
          }
        }
      });
    }
  }

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([`<?xml version="1.0" standalone="no"?>\n${source}`], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  // Try to save directly to selected directory using File System Access API
  if ((window as any).exportDirectoryHandle) {
    try {
      const fileHandle = await (
        window as any
      ).exportDirectoryHandle.getFileHandle(`${options.filename}.svg`, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      // File saved successfully - return the actual directory name
      const result = (window as any).exportDirectoryHandle.name || exportPath;
      return result;
    } catch (error) {
      console.error("Failed to save to directory:", error);
      // Fallback to download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.filename}.svg`;
      a.click();
      return "Downloads folder";
    }
  } else {
    // Fallback to download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.filename}.svg`;
    a.click();
    return "Downloads folder";
  }
  URL.revokeObjectURL(url);
}

async function exportPNG(
  options: ExportOptions,
  exportPath: string
): Promise<string> {
  const svg = document.querySelector(
    'svg[data-export-id="gantt"]'
  ) as SVGSVGElement | null;
  if (!svg) return "Downloads folder";

  // Create a clone and embed font styles
  const svgClone = svg.cloneNode(true) as SVGSVGElement;

  // Remove the rectangle above the timescale (the gap filler)
  // Look for rectangles with negative y values (above the timescale)
  const allRects = svgClone.querySelectorAll("rect");
  allRects.forEach((rect) => {
    const y = rect.getAttribute("y");
    if (y && parseFloat(y) < 0) {
      rect.remove();
    }
  });

  const textElements = svgClone.querySelectorAll("text");
  const originalTextElements = svg.querySelectorAll("text");

  textElements.forEach((textEl, index) => {
    const originalText = originalTextElements[index];
    if (originalText) {
      const computedStyle = getComputedStyle(originalText as Element);
      textEl.setAttribute("font-family", computedStyle.fontFamily);
      textEl.setAttribute("font-size", computedStyle.fontSize);
      textEl.setAttribute("font-weight", computedStyle.fontWeight);
      textEl.setAttribute("font-style", computedStyle.fontStyle);
    }
  });

  // Add header and footer if enabled (same logic as SVG)
  if (options.includeHeader || options.includeFooter) {
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const headerHeight = options.includeHeader ? 30 : 0;
    const footerHeight = options.includeFooter ? 30 : 0;

    // Adjust SVG dimensions
    svgClone.setAttribute("width", String(width));
    svgClone.setAttribute(
      "height",
      String(height + headerHeight + footerHeight)
    );

    // Add header
    if (options.includeHeader) {
      const headerGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const headerText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      headerText.setAttribute("x", String(width / 2));
      headerText.setAttribute("y", "20");
      headerText.setAttribute("text-anchor", "middle");
      headerText.setAttribute("font-size", "16");
      headerText.setAttribute("font-weight", "bold");
      headerText.textContent = options.headerText;
      headerGroup.appendChild(headerText);
      svgClone.insertBefore(headerGroup, svgClone.firstChild);
    }

    // Add footer
    if (options.includeFooter) {
      const footerGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      const footerText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      footerText.setAttribute("x", String(width / 2));
      footerText.setAttribute("y", String(height + headerHeight + 20));
      footerText.setAttribute("text-anchor", "middle");
      footerText.setAttribute("font-size", "12");
      footerText.textContent = options.footerText;
      footerGroup.appendChild(footerText);
      svgClone.appendChild(footerGroup);
    }

    // Shift ALL content down if header is present to make room for the title
    if (options.includeHeader) {
      // Shift the timescale header groups
      const timescaleGroups = svgClone.querySelectorAll(
        'g[transform*="translate(0, 16)"]'
      );
      timescaleGroups.forEach((group) => {
        if (group.getAttribute("transform")) {
          const currentTransform = group.getAttribute("transform") || "";
          group.setAttribute(
            "transform",
            currentTransform.replace(
              /translate\(([^,]+),\s*([^)]+)\)/,
              (match, x, y) => `translate(${x}, ${parseFloat(y) + 30})`
            )
          );
        } else {
          group.setAttribute("transform", `translate(0, 46)`); // 16 + 30
        }
      });

      // Shift the bars group and other content
      const barsGroup = svgClone.querySelector(
        'g[transform*="translate(0, 72)"]'
      ); // The bars group
      const otherGroups = svgClone.querySelectorAll(
        'g:not([transform*="translate(0, 16)"])'
      ); // Not the header groups

      [barsGroup, ...otherGroups].forEach((group) => {
        if (group && !group.querySelector("text[text-anchor='middle']")) {
          if (group.getAttribute("transform")) {
            const currentTransform = group.getAttribute("transform") || "";
            group.setAttribute(
              "transform",
              currentTransform.replace(
                /translate\(([^,]+),\s*([^)]+)\)/,
                (match, x, y) => `translate(${x}, ${parseFloat(y) + 30})`
              )
            );
          } else {
            group.setAttribute("transform", `translate(0, 30)`);
          }
        }
      });
    }
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  const width = svg.width.baseVal.value;
  const height = svg.height.baseVal.value;
  const finalHeight =
    height +
    (options.includeHeader ? 30 : 0) +
    (options.includeFooter ? 30 : 0);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(width * options.scale);
  canvas.height = Math.floor(finalHeight * options.scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(options.scale, 0, 0, options.scale, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, finalHeight);
  ctx.drawImage(img, 0, 0, width, finalHeight);

  URL.revokeObjectURL(url);

  return new Promise<string>((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve("Downloads folder");
        return;
      }
      // Try to save directly to selected directory using File System Access API
      if ((window as any).exportDirectoryHandle) {
        try {
          const fileHandle = await (
            window as any
          ).exportDirectoryHandle.getFileHandle(`${options.filename}.png`, {
            create: true,
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          // File saved successfully - return the actual directory name
          const result =
            (window as any).exportDirectoryHandle.name || exportPath;
          return result;
        } catch (error) {
          console.error("Failed to save to directory:", error);
          // Fallback to download
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${options.filename}.png`;
          link.click();
          URL.revokeObjectURL(link.href);
          resolve("Downloads folder");
        }
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${options.filename}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
        resolve("Downloads folder");
      }
    }, "image/png");
  });
}

async function exportPDF(
  options: ExportOptions,
  exportPath: string
): Promise<string> {
  try {
    const jsPDF = (await import("jspdf")).default;
    const svg = document.querySelector(
      'svg[data-export-id="gantt"]'
    ) as SVGSVGElement | null;
    if (!svg) return "Downloads folder";

    // Create a clone and embed font styles
    const svgClone = svg.cloneNode(true) as SVGSVGElement;
    const textElements = svgClone.querySelectorAll("text");
    const originalTextElements = svg.querySelectorAll("text");

    textElements.forEach((textEl, index) => {
      const originalText = originalTextElements[index];
      if (originalText) {
        const computedStyle = getComputedStyle(originalText as Element);
        textEl.setAttribute("font-family", computedStyle.fontFamily);
        textEl.setAttribute("font-size", computedStyle.fontSize);
        textEl.setAttribute("font-weight", computedStyle.fontWeight);
        textEl.setAttribute("font-style", computedStyle.fontStyle);
      }
    });

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = url;
    });

    // Convert SVG to canvas first for better PDF compatibility
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Calculate PDF dimensions based on selected page size and orientation
    const isLandscape = options.orientation === "landscape";
    const baseWidth = options.pageSize === "8.5x11" ? 8.5 : 11;
    const baseHeight = options.pageSize === "8.5x11" ? 11 : 17;

    const pdfWidth = isLandscape
      ? Math.max(baseWidth, baseHeight)
      : Math.min(baseWidth, baseHeight);
    const pdfHeight = isLandscape
      ? Math.min(baseWidth, baseHeight)
      : Math.max(baseWidth, baseHeight);

    const margin = 0.75; // 0.75 inch margins on all sides
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    // Scale to fit within content area with margins
    const scale = Math.min(
      contentWidth / (width / 96),
      contentHeight / (height / 96)
    );

    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: "in",
      format: options.pageSize === "8.5x11" ? "a4" : "a3",
    });

    // Add header if enabled
    if (options.includeHeader) {
      pdf.setFontSize(16);
      pdf.text(options.headerText, pdfWidth / 2, margin + 0.2, {
        align: "center",
      });
    }

    // Add the chart - centered horizontally, positioned at top
    const chartWidth = (width / 96) * scale;
    const chartHeight = (height / 96) * scale;

    // Ensure proper horizontal centering
    const chartX = (pdfWidth - chartWidth) / 2;
    const chartY = margin + (options.includeHeader ? 0.3 : 0);

    pdf.addImage(canvas, "PNG", chartX, chartY, chartWidth, chartHeight);

    // Add footer if enabled
    if (options.includeFooter) {
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(10);
      pdf.text(options.footerText, pdfWidth / 2, pageHeight - margin - 0.1, {
        align: "center",
      });
    }

    URL.revokeObjectURL(url);

    // Try to save directly to selected directory using File System Access API
    if ((window as any).exportDirectoryHandle) {
      try {
        const pdfBlob = pdf.output("blob");
        const fileHandle = await (
          window as any
        ).exportDirectoryHandle.getFileHandle(`${options.filename}.pdf`, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
        // File saved successfully - return the actual directory name
        return (window as any).exportDirectoryHandle.name || exportPath;
      } catch (error) {
        console.error("Failed to save to directory:", error);
        // Fallback to download
        pdf.save(`${options.filename}.pdf`);
        return "Downloads folder";
      }
    } else {
      // Fallback to download
      pdf.save(`${options.filename}.pdf`);
      return "Downloads folder";
    }
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
}

// Comprehensive JSON export with all customizations
async function exportJSON(
  exportPath: string,
  options: ExportOptions
): Promise<string> {
  const store = useScheduleStore.getState();

  const comprehensiveData = {
    projectName: store.data?.projectName || "Project Schedule",
    sourceFile: store.sourceFile,
    activities: store.data?.activities || [],
    relationships: store.data?.relationships || [],
    layout: {
      panels: {
        leftPanel: {
          open: store.leftOpen,
          width: store.leftWidth,
        },
        rightPanel: {
          open: store.propertiesOpen,
          width: store.propertiesWidth,
        },
      },
      timescale: {
        top: store.timescaleTop,
        bottom: store.timescaleBottom,
      },
      viewRange: {
        start: store.viewStart,
        end: store.viewEnd,
      },
    },
    visualSettings: {
      global: store.settings,
      defaults: {
        barColor: "#3498db",
        barStyle: "solid",
        showLabels: true,
      },
    },
    filterSettings: store.filterSettings,
    sortSettings: store.sortSettings,
    criticalPathSettings: store.criticalPathSettings,
    timelineFormatSettings: store.timelineFormatSettings,
    logicLinesEnabled: store.logicLinesEnabled,
    customizations: {
      lastModified: new Date().toISOString(),
      version: "1.0",
    },
  };

  const jsonString = JSON.stringify(comprehensiveData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Try to save directly to selected directory using File System Access API
  if ((window as any).exportDirectoryHandle) {
    try {
      const fileHandle = await (
        window as any
      ).exportDirectoryHandle.getFileHandle(`${options.filename}.json`, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      // File saved successfully - return the actual directory name
      return (window as any).exportDirectoryHandle.name || exportPath;
    } catch (error) {
      console.error("Failed to save JSON to directory:", error);
      // Fallback to download
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.filename}.json`;
      a.click();
      return "Downloads folder";
    }
  } else {
    // Fallback to download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${options.filename}.json`;
    a.click();
    return "Downloads folder";
  }
  URL.revokeObjectURL(url);
}
