import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { FloorPicker } from './FloorPicker';

export const RIGHT_CONTROLS_CONFIG = {
  right: 17,
  bottom: 220,
  gap: 12,
  buttonSize: 44,
};

interface RightControlsProps {
  floors: number[];
  translateY: SharedValue<number>;
  onLevelChange: (level: number) => void;
  canSnapToRoom?: boolean;
  onSnapToRoom?: () => void;
}

export const RightControls = ({
  floors,
  translateY,
  onLevelChange,
  canSnapToRoom,
  onSnapToRoom,
}: RightControlsProps) => {
  const showFloorPicker = floors.length > 1;

  return (
    <View style={styles.rightControls}>
      {canSnapToRoom && onSnapToRoom ? (
        <TouchableOpacity style={styles.snapButton} onPress={onSnapToRoom}>
          <Ionicons name="locate" size={20} color="#2E90FA" />
        </TouchableOpacity>
      ) : null}
      {showFloorPicker ? (
        <FloorPicker floors={floors} translateY={translateY} onLevelChange={onLevelChange} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  rightControls: {
    position: 'absolute',
    right: RIGHT_CONTROLS_CONFIG.right,
    bottom: RIGHT_CONTROLS_CONFIG.bottom,
    alignItems: 'center',
    gap: RIGHT_CONTROLS_CONFIG.gap,
    zIndex: 10,
  },
  snapButton: {
    width: RIGHT_CONTROLS_CONFIG.buttonSize,
    height: RIGHT_CONTROLS_CONFIG.buttonSize,
    borderRadius: RIGHT_CONTROLS_CONFIG.buttonSize / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
});
