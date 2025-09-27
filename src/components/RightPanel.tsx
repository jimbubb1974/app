import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useScheduleStore } from "../state/useScheduleStore";

export function RightPanel() {
  const open = useScheduleStore((s) => s.propertiesOpen);
  const toggle = useScheduleStore((s) => s.toggleProperties);

  if (!open) {
    return (
      <Box
        width={28}
        bgcolor="#ecf0f1"
        borderLeft="2px solid #bdc3c7"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ boxSizing: "border-box" }}
      >
        <IconButton size="small" onClick={toggle} aria-label="Open properties">
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      width={300}
      bgcolor="#ecf0f1"
      display="flex"
      flexDirection="column"
      borderLeft="2px solid #bdc3c7"
      sx={{ boxSizing: "border-box" }}
    >
      <Box
        px={1.5}
        py={0.75}
        bgcolor="#34495e"
        color="#fff"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Properties
        </Typography>
        <IconButton
          size="small"
          onClick={toggle}
          aria-label="Close properties"
          sx={{ color: "#fff" }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          Tier 2 properties will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
