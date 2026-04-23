import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ThemePreferenceRowProps {
  icon: IoniconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const ThemePreferenceRow = ({
  icon,
  label,
  selected,
  onPress,
}: ThemePreferenceRowProps) => {
  const activeColor = '#2E90FA';
  const inactiveColor = '#888';

  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.menuItemLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={selected ? activeColor : inactiveColor} 
        />
        <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      </ThemedView>

      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={20}
        color={selected ? activeColor : inactiveColor}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  menuLabel: {
    marginLeft: 15,
    fontSize: 16,
  },
});