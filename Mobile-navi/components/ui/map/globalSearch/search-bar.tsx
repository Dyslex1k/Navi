import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Building } from './types';

interface BuildingSearchProps {
  data: Building[];
  onSelect: (building: Building) => void;
  onClear: () => void;
  selectedBuilding: Building | null;
}

export const BuildingSearch = ({ data, onSelect, onClear, selectedBuilding }: BuildingSearchProps) => {
  const theme = useColorScheme() ?? 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return data.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data]);

  const handleItemPress = useCallback((item: Building) => {
    onSelect(item);
    setIsSearching(false);
    setSearchQuery('');
    Keyboard.dismiss();
  }, [onSelect]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <View style={styles.headerContainer}>
      {!selectedBuilding ? (
        <View style={[styles.searchBar, { backgroundColor: Colors[theme].background }]}>
          {/* Standardized: Icon on the left */}
          <View style={styles.searchIconCircle}>
            <Ionicons name="search" size={18} color="white" />
          </View>

          <TextInput
            style={[styles.input, { color: Colors[theme].text }]}
            placeholder="Search buildings..."
            placeholderTextColor={Colors[theme].icon}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setIsSearching(t.length > 0);
            }}
            returnKeyType="search"
            accessibilityLabel="Building search input"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <Ionicons name="close-circle" size={20} color={Colors[theme].icon} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[styles.confirmHeader, { backgroundColor: Colors[theme].background }]}>
          <TouchableOpacity 
            onPress={onClear} 
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back to search"
          >
            <Ionicons name="chevron-back" size={24} color={Colors[theme].text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: Colors[theme].text }]} numberOfLines={1}>
              {selectedBuilding.name}
            </Text>
            <Text style={[styles.headerSubtitle, { color: Colors[theme].icon }]}>
              {selectedBuilding.floors || 0} Floors • {selectedBuilding.rooms || 0} Rooms
            </Text>
          </View>
        </View>
      )}

      {isSearching && (
        <View style={[styles.resultsDropdown, { backgroundColor: Colors[theme].background }]}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={{ color: Colors[theme].icon }}>No buildings found</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => handleItemPress(item)} 
                style={styles.resultItem}
                accessibilityRole="button"
              >
                <View style={styles.resultIcon}>
                  <Ionicons name="business" size={20} color="#2E90FA" />
                </View>
                <Text style={[styles.resultText, { color: Colors[theme].text }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchIconCircle: {
    backgroundColor: '#2E90FA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: { 
    flex: 1, 
    marginHorizontal: 12, 
    fontSize: 16, 
    fontWeight: '500',
    height: '100%'
  },
  clearButton: {
    padding: 8,
  },
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
    shadowRadius: 8,
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
  resultsDropdown: {
    marginTop: 8,
    borderRadius: 20,
    maxHeight: 250,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  resultItem: { 
    flexDirection: 'row', 
    padding: 14, 
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 144, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: { marginLeft: 12, fontWeight: '600', fontSize: 14 },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  }
});