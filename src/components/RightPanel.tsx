import { Box, Typography } from "@mui/material";

export function RightPanel() {
  return (
    <Box
      width={300}
      bgcolor="#ecf0f1"
      display="flex"
      flexDirection="column"
      borderLeft="2px solid #bdc3c7"
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
        <Box component="span">×</Box>
      </Box>
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          Tier 2 properties will appear here.
        </Typography>
      </Box>
    </Box>
  );
}
