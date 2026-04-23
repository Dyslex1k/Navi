import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Building } from './types';

interface SearchResultsProps {
  results: Building[];
  onSelect: (b: Building) => void;
  theme: 'light' | 'dark';
}

export const SearchResults = ({ results, onSelect, theme }: SearchResultsProps) => (
  <View style={[styles.resultsDropdown, { backgroundColor: Colors[theme].background }]}>
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={{ color: Colors[theme].icon }}>No buildings found</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelect(item)} style={styles.resultItem}>
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
);

const styles = StyleSheet.create({
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
  emptyContainer: { padding: 20, alignItems: 'center' }
});