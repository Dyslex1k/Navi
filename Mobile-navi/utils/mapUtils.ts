import { RoomSelection } from '@/hooks/pathfinding/useIndoorNavigation';
import * as turf from '@turf/turf';
import { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * Normalises room names for consistent comparison
 */
export const normalizeRoomKey = (value: string): string => 
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Calculates the center point of every unit in a building
 */
export const getRoomCenters = (geojson: FeatureCollection) => {
  const centers = new Map<string, { longitude: number; latitude: number; level: number }>();
  
  geojson.features.forEach((feature: Feature<Geometry>) => {
    const { properties } = feature;
    if (properties?.feature_type === 'unit' && properties?.name) {
      try {
        const center = turf.centroid(feature);
        centers.set(properties.name, {
          longitude: center.geometry.coordinates[0],
          latitude: center.geometry.coordinates[1],
          level: Number(properties?.level_id ?? 0),
        });
      } catch (e) {
        console.warn(`Invalid geometry for room: ${properties.name}`);
      }
    }
  });
  return centers;
};

/**
 * Checks if the user's detected room matches their destination
 */
export const checkArrival = (
  current: RoomSelection | null, 
  destination: RoomSelection | null
): boolean => {
  if (!current || !destination) return false;
  return normalizeRoomKey(current.name) === normalizeRoomKey(destination.name);
};