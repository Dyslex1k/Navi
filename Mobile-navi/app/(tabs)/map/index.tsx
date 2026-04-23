import { Ionicons } from '@expo/vector-icons';
import type { CameraRef } from '@maplibre/maplibre-react-native';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MapView3D } from '@/components/ui/map/geoMap/MapView3D';
import { BuildingSearch } from '@/components/ui/map/globalSearch/BuildingSearch';
import { useUserPosition } from '@/hooks/location/use-user-postition';
import { useBuildings } from '@/hooks/map/buildings/useBuildings';

import { ErrorMessage } from '@/components/ui/common/ErrorMessage';
import type { SearchBuilding } from '@/types/search';

export default function Map() {
  const router = useRouter();
  const cameraRef = useRef<CameraRef>(null);
  
  const { position, loading: loadingLocation } = useUserPosition();
  const { buildings, loading: loadingBuildings, error: buildingsError, refetch } = useBuildings();

  const [selectedBuilding, setSelectedBuilding] = useState<SearchBuilding | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // --- Handlers ---

  const handleSelectBuilding = (building: SearchBuilding) => {
    setSelectedBuilding(building);
    cameraRef.current?.setCamera({
      centerCoordinate: [building.coords.longitude, building.coords.latitude],
      zoomLevel: 17,
      pitch: 45,
      animationDuration: 1000,
      animationMode: 'flyTo',
    });
  };

  const handleNavigateToIndoor = () => {
    if (isNavigating || !selectedBuilding) return;
    
    setIsNavigating(true);
    router.push({
      pathname: '/(tabs)/map/[id]',
      params: { id: selectedBuilding.id }
    });
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // --- Render Helpers ---
  if (loadingBuildings || (loadingLocation && !position)) {
    return (
      <View style={styles.centerLayout}>
        <ActivityIndicator size="large" color="#2E90FA" />
      </View>
    );
  }

  // Used Just in case the user did not share the GPS
  const initialCoords = position 
    || selectedBuilding?.coords 
    || { longitude: 3.1117, latitude: 45.7583 };

  return (
    <View style={styles.container}>
      <MapView3D
        ref={cameraRef}
        initialCoords={initialCoords}
        disableZoomLimits
        markerCoords={selectedBuilding?.coords ?? null}
      />

      <BuildingSearch 
        data={buildings}
        selectedBuilding={selectedBuilding}
        onSelect={handleSelectBuilding}
        onClear={() => setSelectedBuilding(null)}
      />

      {buildingsError && (
        <ErrorMessage 
          message={buildingsError} 
          onRetry={refetch}
          style={{ position: 'absolute', top: 100, left: 0, right: 0 }} 
        />
      )}

      {selectedBuilding && (
        <View style={styles.actionOverlay}>
          <TouchableOpacity
            style={styles.primaryBtn}
            disabled={isNavigating}
            onPress={handleNavigateToIndoor}
          >
            <Ionicons name="navigate-circle" size={22} color="white" />
            <Text style={styles.btnText}>View Indoor Map</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerLayout: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#2E90FA',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2E90FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnText: { color: 'white', marginLeft: 10, fontWeight: '800', fontSize: 16 },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEE4E2',
    borderWidth: 1,
    borderColor: '#FDA29B',
  },
  errorText: { color: '#B42318', fontWeight: '700', fontSize: 12 },
});