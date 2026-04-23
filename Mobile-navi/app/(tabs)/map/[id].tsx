import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import { MapStateScreen } from '@/components/ui/common/MapStateScreen';
import { IndoorMapScreenContent } from '@/components/ui/map/indoorMap/IndoorMapScreenContent';
import { useIndoorBuildingData } from '@/hooks/map/buildings/useIndoorBuildingData';

export default function IndoorMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  
  const buildingId = Array.isArray(id) ? id[0] : id;

  const { data, loadState, loadError, reload } = useIndoorBuildingData(buildingId!);

  const handleBackToMap = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/map');
    }
  }, [router]);

  if (loadState === 'loading') return <MapStateScreen mode="loading" />;

  if (loadState === 'error' || !buildingId || !data) {
    return (
      <MapStateScreen
        mode="error"
        errorMessage={!buildingId ? "Invalid Building ID" : (loadError ?? 'Unknown error.')}
        onRetry={reload}
        onBack={handleBackToMap}
      />
    );
  }

  return <IndoorMapScreenContent indoorBuildingData={data} onBack={handleBackToMap} />;
}