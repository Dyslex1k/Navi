import { IndoorBuildingData } from '@/api/types';
import { RoomSelection, useIndoorNavigation } from "@/hooks/pathfinding/useIndoorNavigation";
import { checkArrival } from "@/utils/mapUtils";
import { buildTurnByTurnSteps } from "@/utils/turnByTurn";
import { CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef, useState } from "react";
import { useMapCamera } from "./useMapCamera";

export interface ControllerProps {
  indoorBuildingData: IndoorBuildingData;
  autoLocation: boolean;
  detectedRoom: RoomSelection | null;
  cameraRef: React.RefObject<CameraRef | null>;
  onLevelChange: (level: number) => void;
}

const roomKeyFromNodeId = (nodeId: string) => nodeId.replace(/_[a-z]$/i, '');
const nodeKeyFromRoomName = (roomName: string) => roomName.trim().toLowerCase().replace(/\s+/g, '_');

export const useIndoorMapController = ({
  indoorBuildingData,
  autoLocation,
  detectedRoom,
  cameraRef,
  onLevelChange,
}: ControllerProps) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [pathProgressNodeIndex, setPathProgressNodeIndex] = useState(0);
  const previousDetectedRoomRef = useRef<RoomSelection | null>(null);
  const { snapToRoom } = useMapCamera(cameraRef, indoorBuildingData);

  const nav = useIndoorNavigation({
    geojson: indoorBuildingData.geojson,
    edgesData: indoorBuildingData.NavGraph,
    autoLocation,
    onRouteLevelChange: onLevelChange,
  });

  useEffect(() => {
    setActiveStepIndex(0);
    setPathProgressNodeIndex(0);
  }, [nav.navigationPath]);

  useEffect(() => {
    if (autoLocation && detectedRoom) {
      snapToRoom(detectedRoom.name);
    }
  }, [detectedRoom?.name, autoLocation, snapToRoom]);

  useEffect(() => {
    if (!autoLocation || !detectedRoom) {
      return;
    }

    if (nav.navigationPath) {
      previousDetectedRoomRef.current = detectedRoom;
      return;
    }

    const currentStartName = nav.startRoom?.name;
    if (currentStartName === detectedRoom.name) {
      previousDetectedRoomRef.current = detectedRoom;
      return;
    }

    nav.setDetectedStartRoom(detectedRoom, previousDetectedRoomRef.current);
    previousDetectedRoomRef.current = detectedRoom;
  }, [
    autoLocation,
    detectedRoom,
    nav.navigationPath,
    nav.setDetectedStartRoom,
    nav.startRoom?.name,
  ]);

  const routeSteps = useMemo(() => {
    const path = nav.navigationPath;
    if (!path?.nodeIds || !path?.geometry?.geometry?.coordinates) return [];

    return buildTurnByTurnSteps(
      path.nodeIds,
      path.geometry.geometry.coordinates as [number, number][]
    );
  }, [nav.navigationPath]);

  const pathNodeIds = useMemo(() => nav.navigationPath?.nodeIds ?? [], [nav.navigationPath?.nodeIds]);

  useEffect(() => {
    if (!autoLocation || !detectedRoom || !pathNodeIds.length || !routeSteps.length) {
      return;
    }

    const resolvedNodeId = nav.resolveNodeIdForRoom(detectedRoom.name);
    let onPathIndex = resolvedNodeId ? pathNodeIds.indexOf(resolvedNodeId) : -1;

    if (onPathIndex < 0) {
      const roomNodeKey = nodeKeyFromRoomName(detectedRoom.name);
      onPathIndex = pathNodeIds.findIndex((nodeId) => {
        const nodeRoomKey = roomKeyFromNodeId(nodeId);
        return nodeId === roomNodeKey || nodeId.startsWith(`${roomNodeKey}_`) || nodeRoomKey === roomNodeKey;
      });
    }

    if (onPathIndex < 0) {
      return;
    }

    setPathProgressNodeIndex((previous) => Math.max(previous, onPathIndex));

    const currentRoomKey = roomKeyFromNodeId(pathNodeIds[onPathIndex]);
    const nextStepIndex = routeSteps.findIndex(
      (step, index) => index >= activeStepIndex && step.fromRoomKey === currentRoomKey
    );

    if (nextStepIndex >= 0) {
      setActiveStepIndex((previous) => Math.max(previous, nextStepIndex));
      return;
    }

    if (onPathIndex >= pathNodeIds.length - 1) {
      setActiveStepIndex(routeSteps.length - 1);
    }
  }, [
    activeStepIndex,
    autoLocation,
    detectedRoom,
    nav.resolveNodeIdForRoom,
    pathNodeIds,
    routeSteps,
  ]);

  const activeStep = useMemo(() =>
    routeSteps[activeStepIndex] || null,
    [routeSteps, activeStepIndex]);

  const renderedNavigationPath = useMemo(() => {
    const path = nav.navigationPath;
    const coordinates = path?.geometry?.geometry?.coordinates as [number, number][] | undefined;
    const nodeIds = path?.nodeIds;

    if (!path || !coordinates?.length || !nodeIds?.length) {
      return path ?? null;
    }

    const clampedStartIndex = Math.min(pathProgressNodeIndex, coordinates.length - 1);
    const remainingCoordinates = coordinates.slice(clampedStartIndex);

    if (remainingCoordinates.length < 2) {
      return null;
    }

    return {
      ...path,
      geometry: {
        ...path.geometry,
        geometry: {
          ...path.geometry.geometry,
          coordinates: remainingCoordinates,
        },
      },
      nodeIds: nodeIds.slice(clampedStartIndex),
    };
  }, [nav.navigationPath, pathProgressNodeIndex]);

  return {
    ...nav,
    renderedNavigationPath,
    routeSteps,
    activeStep,
    activeStepIndex,
    setActiveStepIndex,
    hasArrived: checkArrival(detectedRoom, nav.endRoom),
    canSnapToDetectedRoom: autoLocation && !!detectedRoom,
    snapToDetectedRoom: () => detectedRoom && snapToRoom(detectedRoom.name),
  };
};
