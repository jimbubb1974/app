import { Box, Button, Divider, Typography } from '@mui/material';
import { useRef } from 'react';
import { useScheduleStore } from '../state/useScheduleStore';
import { parseXer } from '../parsers/xer';
import { parseJson } from '../parsers/json';

export function Toolbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setData = useScheduleStore((s) => s.setData);
  const setStatus = useScheduleStore((s) => s.setStatus);
  const setError = useScheduleStore((s) => s.setError);

  async function handleImport(file: File) {
    setStatus('loading');
    setError(undefined);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let data;
      if (ext === 'json') {
        data = await parseJson(file);
      } else if (ext === 'xer' || ext === 'txt') {
        data = await parseXer(file);
      } else {
        // Default to JSON for Tier 1 to simplify testing
        data = await parseJson(file);
      }
      setData(data);
      setStatus('loaded');
    } catch (e: any) {
      setStatus('error');
      setError(e?.message ?? 'Import failed');
    }
  }

  return (
    <Box display="flex" alignItems="center" gap={2} px={2} py={1} bgcolor="#2c3e50" color="#fff" boxShadow={1}>
      <Typography variant="body2" sx={{ color: '#bdc3c7' }}>FILE</Typography>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }} onClick={() => inputRef.current?.click()}>Import</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Export</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Save Config</Button>
      <Divider flexItem orientation="vertical" sx={{ borderColor: '#34495e', mx: 2 }} />
      <Typography variant="body2" sx={{ color: '#bdc3c7' }}>VIEW</Typography>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Zoom In</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Zoom Out</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Fit All</Button>
      <Divider flexItem orientation="vertical" sx={{ borderColor: '#34495e', mx: 2 }} />
      <Typography variant="body2" sx={{ color: '#bdc3c7' }}>FORMAT</Typography>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Colors</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Labels</Button>
      <Divider flexItem orientation="vertical" sx={{ borderColor: '#34495e', mx: 2 }} />
      <Typography variant="body2" sx={{ color: '#bdc3c7' }}>ANALYSIS</Typography>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Critical Path</Button>
      <Divider flexItem orientation="vertical" sx={{ borderColor: '#34495e', mx: 2 }} />
      <Typography variant="body2" sx={{ color: '#bdc3c7' }}>LAYOUT</Typography>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Manual Mode</Button>
      <Button size="small" variant="contained" sx={{ bgcolor: '#34495e' }}>Auto Layout</Button>

      <input ref={inputRef} type="file" accept=".json,.xer,.txt" style={{ display: 'none' }}
             onChange={(e) => {
               const f = e.target.files?.[0];
               if (f) handleImport(f);
               e.currentTarget.value = '';
             }} />
    </Box>
  );
}


