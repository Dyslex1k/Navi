import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';

type AdminShellProps = PropsWithChildren<{
  username: string;
  onLogout: () => void;
}>;

export function AdminShell({ username, onLogout, children }: AdminShellProps) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)' }}>
        <Toolbar sx={{ borderBottom: '1px solid #E2E8DA', bgcolor: 'rgba(247,248,244,0.85)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Na-vi Map Manager
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {username}
            </Typography>
            <Button variant="outlined" onClick={onLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>{children}</Container>
    </Box>
  );
}
