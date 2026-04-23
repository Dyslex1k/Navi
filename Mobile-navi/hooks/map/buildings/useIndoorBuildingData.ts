import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchIndoorBuildingData } from '@/api/buildings';
import type { IndoorBuildingData } from '@/api/types';
import { ApiError } from '@/types/api';

type LoadState = 'loading' | 'ready' | 'error';

const LOAD_DELAY_MS = 150;

export const useIndoorBuildingData = (buildingId?: string) => {
  const [data, setData] = useState<IndoorBuildingData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadState('loading');
    setLoadError(null);

    const load = async () => {
      try {
        if (!buildingId) {
          throw new Error('No building id was provided.');
        }

        const indoorData = await fetchIndoorBuildingData(buildingId);
        if (!indoorData.geojson?.features?.length) {
          throw new Error('Indoor map data is unavailable for this building.');
        }

        if (!isMounted) {
          return;
        }

        setData(indoorData);
        setLoadState('ready');
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        const apiErr = error as ApiError;
        setLoadError(apiErr.message || 'Unable to load indoor map data.');
        setLoadState('error');
      }
    };

    const timer = setTimeout(() => {
      void load();
    }, LOAD_DELAY_MS);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [buildingId, reloadToken]);

  return useMemo(
    () => ({
      data,
      loadState,
      loadError,
      reload,
    }),
    [data, loadError, loadState, reload]
  );
};
