import * as turf from '@turf/turf';
import type { FeatureCollection, Geometry } from 'geojson';

import type { NavigationPath, PathEdgesData } from '@/types/map';
import { generatePath } from '@/utils/pathfinding';
import { useCallback, useMemo, useState } from 'react';

export type SelectingType = 'start' | 'end';

export interface RoomSelection {
  name: string;
  level: number;
}

interface UseIndoorNavigationParams {
  geojson: FeatureCollection<Geometry>;
  edgesData: PathEdgesData;
  autoLocation: boolean;
  onRouteLevelChange?: (level: number) => void;
}

const roomKeyFromNode = (nodeId: string) => nodeId.replace(/_[a-z]$/i, '');
const toPoint = (coordinates: [number, number]) => turf.point(coordinates);

export const useIndoorNavigation = ({
  geojson,
  edgesData,
  autoLocation,
  onRouteLevelChange,
}: UseIndoorNavigationParams) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [startRoom, setStartRoom] = useState<RoomSelection | null>(null);
  const [endRoom, setEndRoom] = useState<RoomSelection | null>(null);
  const [selectingType, setSelectingType] = useState<SelectingType>('end');
  const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);
  const [hasPendingRouteConfirmation, setHasPendingRouteConfirmation] = useState(false);

  const normalizeNodeId = useCallback((value: string) => value.trim().toLowerCase().replace(/\s+/g, '_'), []);

  const clearNavigationPath = useCallback(() => {
    setNavigationPath(null);
  }, []);

  const graphNodeCoords = useMemo(() => {
    const nodeCoords = new Map<string, [number, number]>();

    edgesData.features.forEach((feature) => {
      const { from_id, to_id } = feature.properties;
      const coords = feature.geometry.coordinates;
      if (!coords?.length) {
        return;
      }

      nodeCoords.set(normalizeNodeId(from_id), coords[0] as [number, number]);
      nodeCoords.set(normalizeNodeId(to_id), coords[coords.length - 1] as [number, number]);
    });

    return nodeCoords;
  }, [edgesData.features, normalizeNodeId]);

  const graphAdjacency = useMemo(() => {
    const adjacency = new Map<string, Set<string>>();
    edgesData.features.forEach((feature) => {
      const from = normalizeNodeId(feature.properties.from_id);
      const to = normalizeNodeId(feature.properties.to_id);
      if (!adjacency.has(from)) adjacency.set(from, new Set());
      if (!adjacency.has(to)) adjacency.set(to, new Set());
      adjacency.get(from)!.add(to);
      adjacency.get(to)!.add(from);
    });
    return adjacency;
  }, [edgesData.features, normalizeNodeId]);

  const roomCenters = useMemo(() => {
    const centers = new Map<string, [number, number]>();

    geojson.features.forEach((feature) => {
      const properties = feature.properties;
      if (properties?.feature_type !== 'unit' || typeof properties?.name !== 'string') {
        return;
      }

      try {
        const center = turf.centroid(feature as any);
        if (center.geometry?.type !== 'Point') {
          return;
        }

        centers.set(normalizeNodeId(properties.name), center.geometry.coordinates as [number, number]);
      } catch {
        // Done to ingore invalid geometry
      }
    });

    return centers;
  }, [geojson.features, normalizeNodeId]);

  const findNearestNodeId = useCallback(
    (targetCoordinates: [number, number], candidates: string[]) => {
      let nearestNodeId = candidates[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      candidates.forEach((candidate) => {
        const nodeCoordinates = graphNodeCoords.get(candidate);
        if (!nodeCoordinates) {
          return;
        }

        const distance = turf.distance(toPoint(targetCoordinates), toPoint(nodeCoordinates), { units: 'meters' });
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestNodeId = candidate;
        }
      });

      return nearestNodeId;
    },
    [graphNodeCoords]
  );

  const resolveRoomToNodeId = useCallback(
    (roomName: string, previousNodeId?: string | null) => {
      const key = normalizeNodeId(roomName);
      const roomKey = roomKeyFromNode(key);
      const candidates = [...graphNodeCoords.keys()].filter((id) => roomKeyFromNode(id) === roomKey);

      if (!candidates.length) {
        return null;
      }

      if (candidates.length === 1) {
        return candidates[0];
      }

      if (previousNodeId) {
        const previous = normalizeNodeId(previousNodeId);
        const connected = candidates.filter((candidate) => graphAdjacency.get(candidate)?.has(previous));

        if (connected.length === 1) {
          return connected[0];
        }

        if (connected.length > 1) {
          candidates.splice(0, candidates.length, ...connected);
        } else {
          const previousCoordinates = graphNodeCoords.get(previous);
          if (previousCoordinates) {
            return findNearestNodeId(previousCoordinates, candidates);
          }
        }
      }

      const centerCoordinates = roomCenters.get(key);
      if (!centerCoordinates) {
        return candidates.sort()[0];
      }

      return findNearestNodeId(centerCoordinates, candidates);
    },
    [findNearestNodeId, graphAdjacency, graphNodeCoords, normalizeNodeId, roomCenters]
  );

  const roomResults = useMemo<RoomSelection[]>(() => {
    if (!searchQuery || !geojson?.features) {
      return [];
    }

    const normalizedSearchQuery = searchQuery.toLowerCase();

    return geojson.features
      .filter((feature) => {
        const properties = feature.properties;
        return (
          properties?.feature_type === 'unit' &&
          typeof properties?.name === 'string' &&
          properties.name.toLowerCase().includes(normalizedSearchQuery)
        );
      })
      .map((feature) => {
        const properties = feature.properties;
        return {
          name: typeof properties?.name === 'string' ? properties.name : '',
          level: Number(properties?.level_id ?? 0),
        };
      });
  }, [geojson, searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearching(false);
  }, []);

  const calculateRoute = useCallback(
    (start: RoomSelection | null, end: RoomSelection | null, previousStart?: RoomSelection | null) => {
      if (!start || !end) {
        clearNavigationPath();
        return;
      }

      try {
        const resolvedPrevious = previousStart ? resolveRoomToNodeId(previousStart.name) : null;
        const resolvedStart = resolveRoomToNodeId(start.name, resolvedPrevious);
        const resolvedEnd = resolveRoomToNodeId(end.name, resolvedStart);
        if (!resolvedStart || !resolvedEnd || resolvedStart === resolvedEnd) {
          clearNavigationPath();
          return;
        }

        const pathResult = generatePath(resolvedStart, resolvedEnd, edgesData);
        if (!pathResult) {
          clearNavigationPath();
          return;
        }

        setNavigationPath(pathResult);
        onRouteLevelChange?.(end.level);
      } catch (error) {
        console.warn('Pathfinding error:', error);
        clearNavigationPath();
      }
    },
    [clearNavigationPath, edgesData, onRouteLevelChange, resolveRoomToNodeId]
  );

  const handleSearchChange = useCallback((type: SelectingType, text: string) => {
    setSelectingType(type);
    setSearchQuery(text);
    setIsSearching(text.length > 0);

    if (text === '') {
      if (type === 'start') {
        setStartRoom(null);
      } else {
        setEndRoom(null);
      }
      clearNavigationPath();
    }
  }, [clearNavigationPath]);

  const beginPendingNavigation = useCallback(() => {
    clearNavigationPath();
    setHasPendingRouteConfirmation(true);
  }, [clearNavigationPath]);

  const handleSelectRoom = useCallback(
    (room: RoomSelection) => {
      if (selectingType === 'start') {
        setStartRoom(room);

        if (endRoom) {
          beginPendingNavigation();
        }
      } else {
        setEndRoom(room);
        beginPendingNavigation();
      }

      clearSearch();
    },
    [beginPendingNavigation, clearSearch, endRoom, selectingType]
  );

  const swapRoute = useCallback(() => {
    const previousStart = startRoom;
    const previousEnd = endRoom;

    setStartRoom(previousEnd);
    setEndRoom(previousStart);
    clearNavigationPath();
    setHasPendingRouteConfirmation(Boolean(previousEnd && previousStart));
  }, [clearNavigationPath, endRoom, startRoom]);

  const clearDestinationAndPendingState = useCallback(() => {
    clearNavigationPath();
    setEndRoom(null);
    setHasPendingRouteConfirmation(false);
    clearSearch();
  }, [clearNavigationPath, clearSearch]);

  const cancelNavigation = useCallback(() => {
    clearDestinationAndPendingState();
  }, [autoLocation, clearDestinationAndPendingState]);

  const applyAutoLocationStart = useCallback(() => {
    setSelectingType('end');
  }, []);

  const confirmPendingNavigation = useCallback(() => {
    setHasPendingRouteConfirmation(false);
    calculateRoute(startRoom, endRoom);
  }, [calculateRoute, endRoom, startRoom]);

  const cancelPendingNavigation = useCallback(() => {
    clearDestinationAndPendingState();
  }, [clearDestinationAndPendingState]);

  const setDetectedStartRoom = useCallback(
    (room: RoomSelection, previousRoom?: RoomSelection | null) => {
      setStartRoom(room);
      setSelectingType('end');
      if (navigationPath) {
        calculateRoute(room, endRoom, previousRoom ?? null);
      }
    },
    [calculateRoute, endRoom, navigationPath]
  );

  return {
    searchQuery,
    isSearching,
    selectingType,
    startRoom,
    endRoom,
    navigationPath,
    hasPendingRouteConfirmation,
    roomResults,
    setSelectingType,
    clearSearch,
    cancelNavigation,
    confirmPendingNavigation,
    cancelPendingNavigation,
    swapRoute,
    handleSelectRoom,
    handleSearchChange,
    applyAutoLocationStart,
    setDetectedStartRoom,
    resolveNodeIdForRoom: resolveRoomToNodeId,
  };
};
