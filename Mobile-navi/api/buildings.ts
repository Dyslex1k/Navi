import type {
  ApiBuildingSummary,
  ApiIndoorBuilding,
  BeaconFeatureProperties,
  BeaconPresenceConfig,
  BuildingSummary,
  IndoorBuildingData
} from '@/api/types';

import apiClient from './client';

const mapSummary = (building: ApiBuildingSummary): BuildingSummary => ({
  ...building,
  author: building.author ?? null,
});

const mapIndoor = (building: ApiIndoorBuilding): IndoorBuildingData => ({
  id: building.id,
  name: building.name,
  coords: building.coords,
  floors: building.floors,
  geojson: building.baseMap,
  NavGraph: building.NavGraph,
  BeaconPositions: building.BeaconPositions,
  author: building.author ?? null,
});


export const fetchAllBuildings = async (): Promise<BuildingSummary[]> => {
  const { data } = await apiClient.get<ApiBuildingSummary[]>('/buildings/all');
  return data.map(mapSummary);
};

export const fetchIndoorBuildingData = async (id: string): Promise<IndoorBuildingData> => {
  const { data } = await apiClient.get<ApiIndoorBuilding>(`/buildings/${id}`);
  return mapIndoor(data);
};


export const getPresenceBeaconsByBuilding = (indoor: IndoorBuildingData): BeaconPresenceConfig[] => {
  return indoor.BeaconPositions.features
    .filter((f) => f.geometry?.type === 'Point')
    .map((feature, index) => {
      const props = feature.properties as BeaconFeatureProperties;
      const [longitude, latitude] = (feature.geometry as any).coordinates;
      
      return {
        id: props?.mac_address ?? `beacon-${index + 1}`,
        name: props?.room_id?.trim() || `beacon_${index + 1}`,
        coords: { longitude, latitude },
      };
    });
};
