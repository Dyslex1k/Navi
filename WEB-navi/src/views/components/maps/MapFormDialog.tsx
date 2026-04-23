import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  emptyFeatureCollection,
  emptyPathEdgesData,
  type FeatureCollection,
  type IndoorBuildingData,
  type IndoorBuildingInput,
  type PathEdgesData,
} from '../../../models/map';

type MapFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValue?: IndoorBuildingData;
  onClose: () => void;
  onSubmit: (payload: IndoorBuildingInput) => Promise<void>;
};

type FormState = {
  name: string;
  latitude: string;
  longitude: string;
  floors: string;
  baseMap: string;
  navGraph: string;
  beaconPositions: string;
};

function stringifyOrDefault(value: unknown, fallback: unknown): string {
  return JSON.stringify(value ?? fallback, null, 2);
}

function toFormState(initialValue?: IndoorBuildingData): FormState {
  if (!initialValue) {
    return {
      name: '',
      latitude: '',
      longitude: '',
      floors: '1',
      baseMap: stringifyOrDefault(emptyFeatureCollection, emptyFeatureCollection),
      navGraph: stringifyOrDefault(emptyPathEdgesData, emptyPathEdgesData),
      beaconPositions: stringifyOrDefault(emptyFeatureCollection, emptyFeatureCollection),
    };
  }

  return {
    name: initialValue.name,
    latitude: String(initialValue.coords.latitude),
    longitude: String(initialValue.coords.longitude),
    floors: String(initialValue.floors),
    baseMap: stringifyOrDefault(initialValue.baseMap, emptyFeatureCollection),
    navGraph: stringifyOrDefault(initialValue.NavGraph, emptyPathEdgesData),
    beaconPositions: stringifyOrDefault(initialValue.BeaconPositions, emptyFeatureCollection),
  };
}

function stripGeoJsonFields<T>(value: T, keysToStrip: ReadonlySet<string>): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripGeoJsonFields(item, keysToStrip)) as T;
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([key]) => !keysToStrip.has(key));
    const sanitized = Object.fromEntries(entries.map(([key, item]) => [key, stripGeoJsonFields(item, keysToStrip)]));
    return sanitized as T;
  }

  return value;
}

async function readGeoJsonFile(file: File): Promise<string> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;
  return JSON.stringify(parsed, null, 2);
}

export function MapFormDialog({ open, mode, initialValue, onClose, onSubmit }: MapFormDialogProps) {
  const [form, setForm] = useState<FormState>(toFormState(initialValue));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialValue));
      setError(null);
    }
  }, [open, initialValue]);

  const title = mode === 'create' ? 'Create map' : 'Edit map';
  const submitText = mode === 'create' ? 'Create' : 'Save changes';

  const parsePayload = (): IndoorBuildingInput => {
    if (isCreateMode) {
      const requiredFields: Array<[FormState[keyof FormState], string]> = [
        [form.name, 'Map name'],
        [form.latitude, 'Latitude'],
        [form.longitude, 'Longitude'],
        [form.floors, 'Floors'],
        [form.baseMap, 'BaseMap JSON'],
        [form.navGraph, 'NavGraph JSON'],
        [form.beaconPositions, 'BeaconPositions JSON'],
      ];

      const missingField = requiredFields.find(([value]) => !value.trim());
      if (missingField) {
        throw new Error(`${missingField[1]} is required.`);
      }
    }

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    const floors = Number(form.floors);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Latitude and longitude must be valid numbers.');
    }

    if (!form.name.trim()) {
      throw new Error('Name is required.');
    }

    if (!Number.isInteger(floors) || floors < 1) {
      throw new Error('Floors must be a whole number greater than or equal to 1.');
    }

    let baseMap: FeatureCollection;
    let navGraph: PathEdgesData;
    let beaconPositions: FeatureCollection;

    try {
      baseMap = JSON.parse(form.baseMap) as FeatureCollection;
    } catch {
      throw new Error('BaseMap must be valid JSON.');
    }

    try {
      navGraph = JSON.parse(form.navGraph) as PathEdgesData;
    } catch {
      throw new Error('NavGraph must be valid JSON.');
    }

    try {
      beaconPositions = JSON.parse(form.beaconPositions) as FeatureCollection;
    } catch {
      throw new Error('BeaconPositions must be valid JSON.');
    }

    const sanitizedBaseMap = stripGeoJsonFields(baseMap, new Set(['layer', 'path']));

    return {
      name: form.name.trim(),
      coords: { latitude, longitude },
      floors,
      baseMap: sanitizedBaseMap,
      NavGraph: navGraph,
      BeaconPositions: beaconPositions,
    } satisfies IndoorBuildingInput;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const parsedPayload = parsePayload();
      await onSubmit(parsedPayload);
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save map');
    } finally {
      setSaving(false);
    }
  };

  const handleGeoJsonUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    key: 'baseMap' | 'navGraph' | 'beaconPositions',
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const formattedJson = await readGeoJsonFile(file);
      setForm((current) => ({ ...current, [key]: formattedJson }));
      setError(null);
    } catch {
      setError('Could not parse uploaded GeoJSON file.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Map name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required={isCreateMode}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Latitude"
              value={form.latitude}
              onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))}
              required={isCreateMode}
              fullWidth
            />
            <TextField
              label="Longitude"
              value={form.longitude}
              onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))}
              required={isCreateMode}
              fullWidth
            />
          </Stack>
          <TextField
            label="Floors"
            helperText="Total number of floors, e.g. 3"
            value={form.floors}
            onChange={(event) => setForm((current) => ({ ...current, floors: event.target.value }))}
            type="number"
            inputProps={{ min: 1, step: 1 }}
            required={isCreateMode}
            fullWidth
          />

          <Accordion slotProps={{ transition: { timeout: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', mr: 1 }}
              >
                <Typography variant="subtitle2">BaseMap (GeoJSON converted to JSON)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  onClick={(event) => event.stopPropagation()}
                  onFocusCapture={(event) => event.stopPropagation()}
                >
                  Upload BaseMap .geojson
                  <input
                    hidden
                    type="file"
                    accept=".geojson,.json"
                    onChange={(event) => void handleGeoJsonUpload(event, 'baseMap')}
                  />
                </Button>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="BaseMap JSON"
                multiline
                minRows={8}
                value={form.baseMap}
                onChange={(event) => setForm((current) => ({ ...current, baseMap: event.target.value }))}
                required={isCreateMode}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>

          <Accordion slotProps={{ transition: { timeout: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', mr: 1 }}
              >
                <Typography variant="subtitle2">NavGraph (GeoJSON converted to JSON)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  onClick={(event) => event.stopPropagation()}
                  onFocusCapture={(event) => event.stopPropagation()}
                >
                  Upload NavGraph .geojson
                  <input
                    hidden
                    type="file"
                    accept=".geojson,.json"
                    onChange={(event) => void handleGeoJsonUpload(event, 'navGraph')}
                  />
                </Button>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="NavGraph JSON"
                multiline
                minRows={8}
                value={form.navGraph}
                onChange={(event) => setForm((current) => ({ ...current, navGraph: event.target.value }))}
                required={isCreateMode}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>

          <Accordion slotProps={{ transition: { timeout: 0 } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%', mr: 1 }}
              >
                <Typography variant="subtitle2">BeaconPositions (GeoJSON converted to JSON)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  onClick={(event) => event.stopPropagation()}
                  onFocusCapture={(event) => event.stopPropagation()}
                >
                  Upload BeaconPositions .geojson
                  <input
                    hidden
                    type="file"
                    accept=".geojson,.json"
                    onChange={(event) => void handleGeoJsonUpload(event, 'beaconPositions')}
                  />
                </Button>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="BeaconPositions JSON"
                multiline
                minRows={8}
                value={form.beaconPositions}
                onChange={(event) => setForm((current) => ({ ...current, beaconPositions: event.target.value }))}
                required={isCreateMode}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} disabled={saving} variant="contained">
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
