import type { BuildingSummary, IndoorBuildingData, IndoorBuildingInput } from '../models/map';
import { mapApi } from './apiClient';

export async function listBuildings(token: string): Promise<BuildingSummary[]> {
  const response = await mapApi.get<BuildingSummary[]>('/buildings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getBuildingById(token: string, buildingId: string): Promise<IndoorBuildingData> {
  const response = await mapApi.get<IndoorBuildingData>(`/buildings/${buildingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createBuilding(token: string, payload: IndoorBuildingInput): Promise<IndoorBuildingData> {
  const response = await mapApi.post<IndoorBuildingData>('/buildings', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateBuilding(
  token: string,
  buildingId: string,
  payload: IndoorBuildingInput,
): Promise<IndoorBuildingData> {
  const response = await mapApi.put<IndoorBuildingData>(`/buildings/${buildingId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function deleteBuilding(token: string, buildingId: string): Promise<void> {
  await mapApi.delete(`/buildings/${buildingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
