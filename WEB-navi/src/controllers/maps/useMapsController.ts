import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BuildingSummary, IndoorBuildingData, IndoorBuildingInput } from '../../models/map';
import { createBuilding, deleteBuilding, getBuildingById, listBuildings, updateBuilding } from '../../services/mapService';
import { addOwnedMapId, getOwnedMapIds, removeOwnedMapId } from '../../services/ownershipService';

type UseMapsControllerArgs = {
  token: string;
  username: string;
  enabled: boolean;
};

export function useMapsController({ token, username, enabled }: UseMapsControllerArgs) {
  const [maps, setMaps] = useState<IndoorBuildingData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMaps = useCallback(async () => {
    if (!enabled) {
      setMaps([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const summaries: BuildingSummary[] = await listBuildings(token);
      const ownedMapIds = getOwnedMapIds(username);

      const mapsWithSummary: Array<IndoorBuildingData | null> = await Promise.all(
        summaries.map(async (summary) => {
          try {
            const detail = await getBuildingById(token, summary.id);
            return {
              ...detail,
              rooms: summary.rooms,
              author: detail.author ?? summary.author,
              created_by: detail.created_by ?? summary.author,
            };
          } catch {
            return null;
          }
        }),
      );

      const filtered = mapsWithSummary.filter((map): map is IndoorBuildingData => {
        if (!map) {
          return false;
        }
        if (map.author && map.author === username) {
          return true;
        }
        if (map.created_by && map.created_by === username) {
          return true;
        }
        return ownedMapIds.has(map.id);
      });

      setMaps(filtered);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load maps');
    } finally {
      setLoading(false);
    }
  }, [token, username, enabled]);

  useEffect(() => {
    void loadMaps();
  }, [loadMaps]);

  const create = useCallback(
    async (payload: IndoorBuildingInput) => {
      if (!enabled) {
        return;
      }
      const created = await createBuilding(token, payload);
      addOwnedMapId(username, created.id);
      await loadMaps();
    },
    [token, username, loadMaps, enabled],
  );

  const update = useCallback(
    async (mapId: string, payload: IndoorBuildingInput) => {
      if (!enabled) {
        return;
      }
      await updateBuilding(token, mapId, payload);
      await loadMaps();
    },
    [token, loadMaps, enabled],
  );

  const remove = useCallback(
    async (mapId: string) => {
      if (!enabled) {
        return;
      }
      await deleteBuilding(token, mapId);
      removeOwnedMapId(username, mapId);
      await loadMaps();
    },
    [token, username, loadMaps, enabled],
  );

  const sortedMaps = useMemo(
    () => [...maps].sort((left, right) => left.name.localeCompare(right.name)),
    [maps],
  );

  return {
    maps: sortedMaps,
    loading,
    error,
    reload: loadMaps,
    create,
    update,
    remove,
  };
}
