import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';

import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { SelectedHeader } from './SelectedHeader';
import { Building, BuildingSearchProps } from './types';

export const BuildingSearch = ({ data, onSelect, onClear, selectedBuilding }: BuildingSearchProps) => {
  const theme = useColorScheme() ?? 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return data.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, data]);

  const handleSelect = useCallback((item: Building) => {
    onSelect(item);
    setIsSearching(false);
    setSearchQuery('');
    Keyboard.dismiss();
  }, [onSelect]);

  return (
    <View style={styles.headerContainer}>
      {!selectedBuilding ? (
        <SearchInput 
          value={searchQuery} 
          onChange={(t) => { setSearchQuery(t); setIsSearching(t.length > 0); }}
          onClear={() => { setSearchQuery(''); setIsSearching(false); }}
          theme={theme}
        />
      ) : (
        <SelectedHeader 
          building={selectedBuilding} 
          onBack={onClear} 
          theme={theme} 
        />
      )}

      {isSearching && (
        <SearchResults 
          results={filteredData} 
          onSelect={handleSelect} 
          theme={theme} 
        />
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
});