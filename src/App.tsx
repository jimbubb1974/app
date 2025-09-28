import "./App.css";
import { Box, Snackbar, Alert } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
import { Toolbar } from "./components/Toolbar";
import { LeftPanel } from "./components/LeftPanel";
import { GanttChart } from "./components/GanttChart";
import { RightPanel } from "./components/RightPanel";
import { StatusBar } from "./components/StatusBar";
import CombinedTimescaleDialog from "./components/CombinedTimescaleDialog";
import { RangeDialog } from "./components/RangeDialog";
import { ExportDialog } from "./components/ExportDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { CriticalPathDialog } from "./components/CriticalPathDialog";
import { FilterDialog } from "./components/FilterDialog";
import { SortDialog } from "./components/SortDialog";
import { AutoLayoutTestDialog } from "./components/AutoLayoutTestDialog";
import { useScheduleStore } from "./state/useScheduleStore";

function App() {
  const successNotification = useScheduleStore((s) => s.successNotification);
  const setSuccessNotification = useScheduleStore(
    (s) => s.setSuccessNotification
  );

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
      <CombinedTimescaleDialog />
      <RangeDialog />
      <ExportDialog />
      <SettingsDialog />
      <CriticalPathDialog />
      <FilterDialog />
      <SortDialog />
      <AutoLayoutTestDialog />

      {/* Global Success Notification */}
      <Snackbar
        open={successNotification.open}
        autoHideDuration={3000}
        onClose={() => setSuccessNotification({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessNotification({ open: false, message: "" })}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successNotification.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

export default App;
