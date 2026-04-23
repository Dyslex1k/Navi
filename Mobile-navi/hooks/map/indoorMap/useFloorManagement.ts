import { BUTTON_HEIGHT } from '@/components/ui/map/indoorMap/FloorPicker';
import { useCallback, useMemo, useState } from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export const useFloorManagement = (floorCount: number) => {
  const safeFloorCount = useMemo(() => {
    const parsed = Number(floorCount);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }, [floorCount]);

  const mapFloors = useMemo(
    () => Array.from({ length: safeFloorCount }, (_, index) => index),
    [safeFloorCount]
  );

  const defaultLevel = useMemo(() => (mapFloors.includes(0) ? 0 : mapFloors[0] || 0), [mapFloors]);
  const [activeLevel, setActiveLevel] = useState(defaultLevel);

  const floorsReversed = useMemo(() => [...mapFloors].reverse(), [mapFloors]);
  const translateY = useSharedValue(Math.max(0, floorsReversed.indexOf(defaultLevel)) * BUTTON_HEIGHT);

  const handleLevelChange = useCallback((level: number) => {
    const floorIndex = floorsReversed.indexOf(level);
    if (floorIndex === -1) return;

    setActiveLevel(level);
    translateY.value = withTiming(floorIndex * BUTTON_HEIGHT, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    });
  }, [floorsReversed, translateY]);

  return { activeLevel, setActiveLevel, mapFloors, translateY, handleLevelChange };
};
