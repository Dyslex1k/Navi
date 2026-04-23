import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useAuthController } from '../../controllers/auth/useAuthController';
import { useMapsController } from '../../controllers/maps/useMapsController';
import type { IndoorBuildingData, IndoorBuildingInput } from '../../models/map';
import { AdminShell } from '../components/layout/AdminShell';
import { MapFormDialog } from '../components/maps/MapFormDialog';
import { MapTable } from '../components/maps/MapTable';

type FormState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; map: IndoorBuildingData };

export function DashboardPage() {
  const { user, token, logout } = useAuthController();
  const isAuthenticated = Boolean(user && token);

  const mapsController = useMapsController({
    token: token ?? '',
    username: user?.username ?? '',
    enabled: isAuthenticated,
  });
  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [pendingDelete, setPendingDelete] = useState<IndoorBuildingData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const header = useMemo(() => {
    if (mapsController.loading) {
      return 'Loading your maps...';
    }
    return `${mapsController.maps.length} map${mapsController.maps.length === 1 ? '' : 's'} managed by you`;
  }, [mapsController.loading, mapsController.maps.length]);

  if (!user || !token) {
    return null;
  }

  const dialogMode = formState.mode === 'edit' ? 'edit' : 'create';
  const isFormOpen = formState.mode !== 'closed';
  const editMap = formState.mode === 'edit' ? formState.map : undefined;

  const handleCreateOrUpdate = async (payload: IndoorBuildingInput) => {
    if (formState.mode === 'edit') {
      await mapsController.update(formState.map.id, payload);
      return;
    }
    await mapsController.create(payload);
  };

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }
    setDeleteError(null);
    try {
      await mapsController.remove(pendingDelete.id);
      setPendingDelete(null);
    } catch (requestError) {
      setDeleteError(requestError instanceof Error ? requestError.message : 'Delete failed');
    }
  };

  return (
    <AdminShell username={user.username} onLogout={() => void logout()}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <div>
            <Typography variant="h4">My Maps</Typography>
            <Typography color="text.secondary">{header}</Typography>
          </div>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={() => void mapsController.reload()}>
              Refresh
            </Button>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => setFormState({ mode: 'create' })}>
              New map
            </Button>
          </Stack>
        </Stack>

        {mapsController.error ? <Alert severity="error">{mapsController.error}</Alert> : null}

        <MapTable
          maps={mapsController.maps}
          onEdit={(map) => setFormState({ mode: 'edit', map })}
          onDelete={(map) => setPendingDelete(map)}
        />
      </Stack>

      <MapFormDialog
        open={isFormOpen}
        mode={dialogMode}
        initialValue={editMap}
        onClose={() => setFormState({ mode: 'closed' })}
        onSubmit={handleCreateOrUpdate}
      />

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete map</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete ? `Delete "${pendingDelete.name}"? This action cannot be undone.` : 'Delete selected map?'}
          </DialogContentText>
          {deleteError ? <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminShell>
  );
}
