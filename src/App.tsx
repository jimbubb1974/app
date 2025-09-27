import "./App.css";
import { Box } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
import { Toolbar } from "./components/Toolbar";
import { LeftPanel } from "./components/LeftPanel";
import { GanttChart } from "./components/GanttChart";
import { RightPanel } from "./components/RightPanel";
import { StatusBar } from "./components/StatusBar";
import { TimescaleDialog } from "./components/TimescaleDialog";
import { RangeDialog } from "./components/RangeDialog";
import { ExportDialog } from "./components/ExportDialog";
import { SettingsDialog } from "./components/SettingsDialog";

function App() {
  return (
    <AppLayout>
      <Toolbar />
      <Box
        display="flex"
        flex={1}
        bgcolor="#fff"
        sx={{ minWidth: 0, boxSizing: "border-box", overflow: "hidden" }}
      >
        <LeftPanel />
        <GanttChart />
        <RightPanel />
      </Box>
      <StatusBar />
      <TimescaleDialog />
      <RangeDialog />
      <ExportDialog />
      <SettingsDialog />
    </AppLayout>
  );
}

export default App;
