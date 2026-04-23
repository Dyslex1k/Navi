export interface Building {
  id: string;
  name: string;
  coords: { longitude: number; latitude: number };
  floors?: number;
  rooms?: number;
}

export interface BuildingSearchProps {
  data: Building[];
  onSelect: (building: Building) => void;
  onClear: () => void;
  selectedBuilding: Building | null;
}