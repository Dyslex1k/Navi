import type { Feature, FeatureCollection, Geometry, LineString } from 'geojson';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BuildingSummary = {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number;
  rooms: number;
  author?: string | null;
};

export type IndoorBuildingData = {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number[];
  geojson: FeatureCollection<Geometry>;
  NavGraph: PathEdgesData,
  BeaconPositions: FeatureCollection<Geometry>,
  author?: string | null;
};

export type PathEdgeProperties = {
  from_id: string;
  to_id: string;
  cost?: string | number;
};

export type PathEdgesData = FeatureCollection<LineString, PathEdgeProperties>;

export type NavigationPath = {
  geometry: Feature<LineString>;
  distance: number;
  nodeIds?: string[];
};
