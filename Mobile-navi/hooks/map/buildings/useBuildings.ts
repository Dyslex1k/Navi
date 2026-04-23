import { fetchAllBuildings } from '@/api/buildings';
import { ApiError } from '@/types/api';
import type { SearchBuilding } from '@/types/search';
import { useCallback, useEffect, useState } from 'react';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState<SearchBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBuildings();
      setBuildings(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Unable to load buildings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { 
    buildings, 
    loading, 
    error, 
    refetch: loadData
  };
};