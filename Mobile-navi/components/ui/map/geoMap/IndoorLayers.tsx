import { Colors } from '@/constants/theme';
import { FillExtrusionLayer, ShapeSource, SymbolLayer } from '@maplibre/maplibre-react-native';
import React, { useMemo } from 'react';

interface IndoorLayersProps {
  mapData?: any;
  labelData?: any;
  detectedRoomData?: any;
  activeLevel: number;
  theme: 'light' | 'dark';
}

export const IndoorLayers = ({ mapData, labelData, detectedRoomData, activeLevel, theme }: IndoorLayersProps) => {
  const styles = useMemo(() => {
    const LEVEL_BASE = activeLevel * 3.5;
    const palette = Colors[theme].map3d;

    return {
      floor: {
        fillExtrusionBase: LEVEL_BASE,
        fillExtrusionHeight: LEVEL_BASE + 0.02,
        fillExtrusionColor: palette.floor,
        fillExtrusionOpacity: 0.98,
      },
      wall: {
        fillExtrusionBase: LEVEL_BASE,
        fillExtrusionHeight: LEVEL_BASE + 2.4,
        fillExtrusionColor: palette.wall,
        fillExtrusionVerticalGradient: true,
      },
      detectedRoom: {
        fillExtrusionBase: LEVEL_BASE,
        fillExtrusionHeight: LEVEL_BASE + 0.16,
        fillExtrusionColor: palette.detectedRoom,
        fillExtrusionOpacity: 0.9,
      },
      labels: {
        textField: ['get', 'name'] as any,
        textSize: 11,
        textFont: ['Noto Sans Regular'] as any,
        textColor: palette.label,
        textHaloColor: palette.labelHalo,
        textHaloWidth: 1.5,
        textAnchor: 'center' as const,
        textPitchAlignment: 'viewport' as const,
        textRotationAlignment: 'viewport' as const,
        textAllowOverlap: true,
        textIgnorePlacement: true,
      },
    };
  }, [theme, activeLevel]);

  const detectedRoomShape = useMemo(
    () => detectedRoomData ?? { type: 'FeatureCollection' as const, features: [] },
    [detectedRoomData]
  );

  return (
    <>
      {mapData && (
        <ShapeSource id="indoorSource" shape={mapData}>
          <FillExtrusionLayer id="floorLayer" filter={['==', ['get', 'render_type'], 'floor']} style={styles.floor} />
          <FillExtrusionLayer id="unitWalls" filter={['==', ['get', 'render_type'], 'wall']} style={styles.wall} />
        </ShapeSource>
      )}
      <ShapeSource id="detectedRoomSource" shape={detectedRoomShape}>
        <FillExtrusionLayer id="detectedRoomLayer" style={styles.detectedRoom} />
      </ShapeSource>
      {labelData && (
        <ShapeSource id="labelSource" shape={labelData}>
          <SymbolLayer id="roomLabels" aboveLayerID="detectedRoomLayer" style={styles.labels} />
        </ShapeSource>
      )}
    </>
  );
};
