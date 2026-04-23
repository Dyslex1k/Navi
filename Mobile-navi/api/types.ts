import type { FeatureCollection, Geometry, LineString } from 'geojson';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ApiBuildingSummary {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number;
  rooms: number;
  author?: string | null;
}

export interface ApiIndoorBuilding {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number; 
  baseMap: FeatureCollection<Geometry>;
  NavGraph: PathEdgesData;
  BeaconPositions: FeatureCollection<Geometry>;
  author?: string | null;
}

export interface BuildingSummary {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number;
  rooms: number;
  author: string | null;
}

export interface IndoorBuildingData {
  id: string;
  name: string;
  coords: Coordinates;
  floors: number;
  geojson: FeatureCollection<Geometry>;
  NavGraph: PathEdgesData;
  BeaconPositions: FeatureCollection<Geometry>;
  author: string | null;
}

export interface BeaconPresenceConfig {
  id: string;
  name: string;
  coords: Coordinates;
}

export type BeaconFeatureProperties = {
  mac_address?: string;
  room_id?: string;
};

export type PathEdgeProperties = {
  from_id: string;
  to_id: string;
  cost?: string | number;
};


export type PathEdgesData = FeatureCollection<LineString, PathEdgeProperties>;

export class BuildingsApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'BuildingsApiError';
  }
}