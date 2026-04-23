import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import type { IndoorBuildingData } from '../../../models/map';

type MapTableProps = {
  maps: IndoorBuildingData[];
  onEdit: (map: IndoorBuildingData) => void;
  onDelete: (map: IndoorBuildingData) => void;
};

export function MapTable({ maps, onEdit, onDelete }: MapTableProps) {
  if (maps.length === 0) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" color="text.secondary">
          You have no uploaded maps yet.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Coordinates</TableCell>
            <TableCell>Floors</TableCell>
            <TableCell>Rooms</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {maps.map((map) => (
            <TableRow key={map.id} hover>
              <TableCell>{map.name}</TableCell>
              <TableCell>
                {map.coords.latitude}, {map.coords.longitude}
              </TableCell>
              <TableCell>{map.floors}</TableCell>
              <TableCell>{map.rooms}</TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => onEdit(map)}>
                      <EditNoteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => onDelete(map)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
