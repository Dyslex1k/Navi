import { getPresenceBeaconsByBuilding } from "@/api/buildings";
import { IndoorBuildingData } from "@/api/types";
import { useMemo } from "react";
import { useBeaconPresence } from "../bluetooth/useBeaconPresence";

export const useMapPresence = (indoorBuildingData: IndoorBuildingData) => {
  const presenceBeacons = useMemo(() => getPresenceBeaconsByBuilding(indoorBuildingData), [indoorBuildingData]);
  const { room: detectedRoomName, error: presenceError } = useBeaconPresence({
    enabled: true,
    beacons: presenceBeacons,
  });

  const normalizeRoomKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const autoLocation = Boolean(detectedRoomName && detectedRoomName.toUpperCase() !== 'UNKNOWN');

  // Map the raw string from beacon to a RoomSelection object
  const detectedRoom = useMemo(() => {
    if (!detectedRoomName) return null;
    const key = normalizeRoomKey(detectedRoomName);
    const feature = indoorBuildingData.geojson.features.find(f => 
      f.properties?.feature_type === 'unit' && normalizeRoomKey(f.properties.name) === key
    );
    return feature ? { name: feature.properties?.name, level: Number(feature.properties?.level_id) } : null;
  }, [detectedRoomName, indoorBuildingData]);

  return { detectedRoom, autoLocation, presenceError };
};