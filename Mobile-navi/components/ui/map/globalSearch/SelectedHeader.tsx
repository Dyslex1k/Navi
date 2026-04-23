import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Building } from './types';

interface SelectedHeaderProps {
  building: Building;
  onBack: () => void;
  theme: 'light' | 'dark';
}

export const SelectedHeader = ({ building, onBack, theme }: SelectedHeaderProps) => (
  <View style={[styles.confirmHeader, { backgroundColor: Colors[theme].background }]}>
    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
      <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
    </TouchableOpacity>
    <View style={styles.headerTextContainer}>
      <Text style={[styles.headerTitle, { color: Colors[theme].text }]} numberOfLines={1}>
        {building.name}
      </Text>
      <Text style={[styles.headerSubtitle, { color: Colors[theme].icon }]}>
        {building.floors || 0} Floors • {building.rooms || 0} Rooms
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  confirmHeader: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1, marginRight: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 1 },
});