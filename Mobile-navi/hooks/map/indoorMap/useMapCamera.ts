import { IndoorBuildingData } from "@/api/types";
import { getRoomCenters } from "@/utils/mapUtils";
import { CameraRef } from "@maplibre/maplibre-react-native";
import { useCallback, useMemo } from "react";

export const useMapCamera = (cameraRef: React.RefObject<CameraRef | null>, indoorBuildingData: IndoorBuildingData) => {
  const roomCenters = useMemo(() => getRoomCenters(indoorBuildingData.geojson), [indoorBuildingData]);

  const snapToRoom = useCallback((roomName: string, onLevelChange?: (lvl: number) => void) => {
    const center = roomCenters.get(roomName);
    if (!center || !cameraRef.current) return;

    onLevelChange?.(center.level);
    cameraRef.current.setCamera({
      centerCoordinate: [center.longitude, center.latitude],
      zoomLevel: 20,
      animationDuration: 700,
      animationMode: 'easeTo',
    });
  }, [roomCenters, cameraRef]);

  return { snapToRoom };
};