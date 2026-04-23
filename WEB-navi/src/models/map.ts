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
  author?: string;
};

export type IndoorBuildingData = {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number;
  rooms: number;
  baseMap: FeatureCollection;
  NavGraph: PathEdgesData;
  BeaconPositions: FeatureCollection;
  author?: string;
  created_by?: string;
};

export type PathEdgeProperties = {
  from_id: string;
  to_id: string;
  cost?: string | number;
};

export type Feature = {
  type: string;
  geometry?: Geometry;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Geometry = {
  type: string;
  coordinates?: unknown;
  [key: string]: unknown;
};

export type FeatureCollection = {
  type: string;
  features: Feature[];
  [key: string]: unknown;
};

export type PathEdgesData = {
  type: string;
  features: Array<
    Feature & {
      geometry: {
        type: 'LineString' | string;
        coordinates: unknown;
      };
      properties: PathEdgeProperties;
    }
  >;
  [key: string]: unknown;
};

export type NavigationPath = {
  geometry: Feature & {
    geometry: {
      type: 'LineString' | string;
      coordinates: unknown;
    };
  };
  distance: number;
};

export type IndoorBuildingInput = {
  name: string;
  coords: Coordinates;
  floors: number;
  baseMap: FeatureCollection;
  NavGraph: PathEdgesData;
  BeaconPositions: FeatureCollection;
};

export const emptyFeatureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

export const emptyPathEdgesData: PathEdgesData = {
  type: 'FeatureCollection',
  features: [],
};
