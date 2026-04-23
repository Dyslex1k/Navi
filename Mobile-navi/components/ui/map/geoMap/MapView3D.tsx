import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraRef, LineLayer, MapView, PointAnnotation, ShapeSource } from '@maplibre/maplibre-react-native';
import type { FeatureCollection, Geometry } from 'geojson';
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useIndoorData } from '@/hooks/map/rendering/useIndoorData';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Coordinates, NavigationPath } from '@/types/map';
import { IndoorLayers } from './IndoorLayers';

interface MapView3DProps {
  activeLevel?: number;
  geojson?: FeatureCollection<Geometry>;
  detectedRoomName?: string | null;
  initialCoords: Coordinates;
  onCameraChanged?: (e: unknown) => void;
  navigationPath?: NavigationPath | null;
  zoomLevel?: number;
  pitch?: number;
  disableZoomLimits?: boolean;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  markerCoords?: Coordinates | null;
}

export const MapView3D = forwardRef<CameraRef, MapView3DProps>((props, ref) => {

  const {
    activeLevel = 0, geojson, initialCoords, onCameraChanged,
    navigationPath, zoomLevel, pitch, disableZoomLimits,
    minZoomLevel, maxZoomLevel, markerCoords, detectedRoomName,
  } = props;


  const theme = useColorScheme();
  const { mapData, labelData, detectedRoomData } = useIndoorData(geojson, activeLevel, detectedRoomName);


  return (
    <MapView
      style={styles.map}
      mapStyle={Colors[theme].mapColor}
      onRegionDidChange={onCameraChanged}
      logoEnabled={false}
      attributionEnabled={false}
      compassViewPosition={3}
      compassViewMargins={{x: 17, y: 165}}
    >
      <Camera
        ref={ref}
        minZoomLevel={disableZoomLimits ? undefined : (minZoomLevel ?? 17)}
        maxZoomLevel={disableZoomLimits ? undefined : (maxZoomLevel ?? 22)}
        defaultSettings={{
          centerCoordinate: [initialCoords.longitude, initialCoords.latitude],
          zoomLevel: zoomLevel || 20,
          pitch: pitch || 45,
        }}
      />

      <IndoorLayers
        mapData={mapData}
        labelData={labelData}
        detectedRoomData={detectedRoomData}
        activeLevel={activeLevel}
        theme={theme}
      />


      {navigationPath && (
        <ShapeSource id="pathSource" shape={navigationPath.geometry}>
          <LineLayer id="pathLine" style={{ lineColor: Colors[theme].map3d.path, lineWidth: 5 }} />
        </ShapeSource>
      )}


      {markerCoords && (
        <PointAnnotation id="marker" coordinate={[markerCoords.longitude, markerCoords.latitude]}>
          <View style={styles.markerWrap}>
            <Ionicons name="location" size={34} color="#D92D20" />
          </View>
        </PointAnnotation>
      )}
    </MapView>

  );

});


const styles = StyleSheet.create({
  map: { flex: 1 },
  markerWrap: { alignItems: 'center', justifyContent: 'center' },
});
