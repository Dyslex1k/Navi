import * as turf from '@turf/turf';
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from 'geojson';
import { useMemo } from 'react';

const normalizeRoomKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

export const useIndoorData = (
  geojson?: FeatureCollection<Geometry>,
  activeLevel?: number,
  detectedRoomName?: string | null
) => {
  return useMemo(() => {
    if (!geojson?.features) return { mapData: undefined, labelData: undefined, detectedRoomData: undefined };

    const seen = new Set();
    const WALL_THICKNESS_METERS = -0.12;
    const processedFeatures: Feature<Geometry, GeoJsonProperties>[] = [];
    const labelFeatures: Feature<Geometry, GeoJsonProperties>[] = [];
    const detectedRoomKey = detectedRoomName ? normalizeRoomKey(detectedRoomName) : null;
    let detectedRoomFeature: Feature<Geometry, GeoJsonProperties> | null = null;

    geojson.features.forEach((f) => {
      const lvl = f.properties?.level_id;
      if (lvl !== activeLevel && lvl !== null) return;
      if (!f.geometry || !('coordinates' in f.geometry)) return;

      const key = JSON.stringify(f.geometry.coordinates);
      if (seen.has(key)) return;
      seen.add(key);

      // Label Processing
      if (f.properties?.name && f.properties?.feature_type === 'unit') {
        const center = turf.centroid(f);
        labelFeatures.push({
          ...center,
          properties: { name: f.properties.name.replace(/_/g, ' ').toUpperCase() }
        });

        const isDetectedRoom =
          !!detectedRoomKey &&
          normalizeRoomKey(String(f.properties.name)) === detectedRoomKey &&
          (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

        if (isDetectedRoom) {
          detectedRoomFeature = {
            ...f,
            properties: {
              ...f.properties,
              render_type: 'detected-room',
            },
          };
        }
      }

      // Wall & Floor Processing
      const isPolygon = f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon';
      if (f.properties?.feature_type === 'unit' && isPolygon) {
        try {
          const poly = f as Feature<Polygon | MultiPolygon>;
          const inset = turf.buffer(poly, WALL_THICKNESS_METERS, { units: 'meters' });
          if (inset?.geometry) {
            const wall = turf.difference(turf.featureCollection([poly, inset]));
            if (wall) {
              processedFeatures.push({ ...wall, properties: { ...f.properties, render_type: 'wall' } });
            }
          }
        } catch (e) { console.warn('Geometry error:', e); }
      }
      processedFeatures.push({ ...f, properties: { ...f.properties, render_type: 'floor' } });
    });

    return {
      mapData: { type: 'FeatureCollection' as const, features: processedFeatures },
      labelData: { type: 'FeatureCollection' as const, features: labelFeatures },
      detectedRoomData: detectedRoomFeature
        ? { type: 'FeatureCollection' as const, features: [detectedRoomFeature] }
        : undefined,
    };
  }, [geojson, activeLevel, detectedRoomName]);
};
