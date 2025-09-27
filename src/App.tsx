import './App.css';
import { Box } from '@mui/material';
import { AppLayout } from './components/AppLayout';
import { Toolbar } from './components/Toolbar';
import { LeftPanel } from './components/LeftPanel';
import { GanttChart } from './components/GanttChart';
import { RightPanel } from './components/RightPanel';
import { StatusBar } from './components/StatusBar';

function App() {
  return (
    <AppLayout>
      <Toolbar />
      <Box display="flex" flex={1} bgcolor="#fff">
        <LeftPanel />
        <GanttChart />
        <RightPanel />
      </Box>
      <StatusBar />
    </AppLayout>
  );
}

export default App
