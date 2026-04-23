export type SearchBuilding = {
  id: string;
  name: string;
  coords: { longitude: number; latitude: number };
  floors?: number;
  rooms?: number;
};
