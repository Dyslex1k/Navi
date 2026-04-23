import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { interpolateColor, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

export const BUTTON_HEIGHT = 41;

const FloorButton = ({ level, index, translateY, onPress }: any) => {
  const theme = useColorScheme();

  const animatedTextStyle = useAnimatedStyle(() => {
    const buttonPos = index * BUTTON_HEIGHT;
    const activeColor = '#FFFFFF';
    const inactiveColor = Colors[theme].icon; 

    const color = interpolateColor(
      translateY.value,
      [buttonPos - 10, buttonPos, buttonPos + 10],
      [inactiveColor, activeColor, inactiveColor]
    );
    return { color };
  });

  return (
    <TouchableOpacity onPress={() => onPress(level)} style={styles.floorBtn} activeOpacity={1}>
      <Animated.Text style={[styles.btnText, animatedTextStyle]}>
        {level === 0 ? 'G' : `L${level}`}
      </Animated.Text>
    </TouchableOpacity>
  );
};

interface FloorPickerProps {
  floors: number[];
  translateY: SharedValue<number>;
  onLevelChange: (level: number) => void;
}

export const FloorPicker = ({ floors, translateY, onLevelChange }: FloorPickerProps) => {
  const theme = useColorScheme();

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <ThemedView 
      style={[
        styles.floorPicker, 
        { backgroundColor: Colors[theme].background }
      ]}
    >
      <Animated.View style={[styles.slidingPill, animatedPillStyle]} />
      {[...floors].reverse().map((level, index) => (
        <FloorButton
          key={level}
          level={level}
          index={index}
          translateY={translateY}
          onPress={onLevelChange}
        />
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  floorPicker: {
    borderRadius: 50,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.1)',
  },
  slidingPill: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 37,
    height: 37,
    borderRadius: 50,
    backgroundColor: '#2E90FA',
  },
  floorBtn: {
    width: 37,
    height: 37,
    marginVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  btnText: { 
    fontSize: 12, 
    fontWeight: '700',
  },
});
