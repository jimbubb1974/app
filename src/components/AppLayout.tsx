import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box display="flex" flexDirection="column" height="100vh" bgcolor="#f5f5f5">
      {children}
    </Box>
  );
}


