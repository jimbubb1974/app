import { Box } from "@mui/material";
import { useScheduleStore } from "../state/useScheduleStore";

export function StatusBar() {
  const data = useScheduleStore((s) => s.data);
  const count = data?.activities.length ?? 0;
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
      py={0.5}
      bgcolor="#34495e"
      color="#fff"
      fontSize={12}
    >
      <Box display="flex" gap={4}>
        <span>Activities: {count}</span>
        <span>Critical Path: —</span>
        <span>Project Duration: —</span>
      </Box>
      <div>Ready</div>
    </Box>
  );
}
