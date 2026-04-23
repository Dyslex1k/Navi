import { Ionicons } from '@expo/vector-icons';
import React, { RefObject } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { RoomSelection, SelectingType } from '@/hooks/pathfinding/useIndoorNavigation';
import { formatRoomNameForUi } from '@/utils/formatRoomName';

interface MapSearchPanelProps {
  autoLocation: boolean;
  theme: 'light' | 'dark';
  searchQuery: string;
  isSearching: boolean;
  selectingType: SelectingType;
  startRoom: RoomSelection | null;
  endRoom: RoomSelection | null;
  roomResults: RoomSelection[];
  startInputRef: RefObject<TextInput | null>;
  endInputRef: RefObject<TextInput | null>;
  onSelectType: (type: SelectingType) => void;
  onSearchChange: (type: SelectingType, text: string) => void;
  onSelectRoom: (room: RoomSelection) => void;
  onSwapRoute: () => void;
  onDismissSearch: () => void;
}

export const MapSearchPanel = ({
  autoLocation,
  theme,
  searchQuery,
  isSearching,
  selectingType,
  startRoom,
  endRoom,
  roomResults,
  startInputRef,
  endInputRef,
  onSelectType,
  onSearchChange,
  onSelectRoom,
  onSwapRoute,
  onDismissSearch,
}: MapSearchPanelProps) => {
  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchCard, { backgroundColor: Colors[theme].background }]}>
        <View style={styles.indicatorContainer}>
          {!autoLocation && <Ionicons name="radio-button-on" size={16} color="#10B981" />}
          {!autoLocation && <View style={styles.verticalLine} />}
          <Ionicons name="location" size={18} color="#F04438" />
        </View>

        <View style={styles.inputsWrapper}>
          {!autoLocation && (
            <>
              <View style={[styles.inputRow, selectingType === 'start' && styles.activeRow]}>
                <TextInput
                  ref={startInputRef}
                  style={[styles.textInput, { color: Colors[theme].text }]}
                  placeholder="Choose start point..."
                  placeholderTextColor="#98A2B3"
                  value={
                    selectingType === 'start' && isSearching
                      ? searchQuery
                      : formatRoomNameForUi(startRoom?.name)
                  }
                  onFocus={() => onSelectType('start')}
                  onChangeText={(text) => onSearchChange('start', text)}
                />
              </View>
              <View style={styles.horizontalDivider} />
            </>
          )}

          <View style={[styles.inputRow, (selectingType === 'end' || autoLocation) && styles.activeRow]}>
            <TextInput
              ref={endInputRef}
              style={[styles.textInput, { color: Colors[theme].text }]}
              placeholder="Search destination..."
              placeholderTextColor="#98A2B3"
              value={
                selectingType === 'end' && isSearching
                  ? searchQuery
                  : formatRoomNameForUi(endRoom?.name)
              }
              onFocus={() => onSelectType('end')}
              onChangeText={(text) => onSearchChange('end', text)}
            />
          </View>
        </View>

        <View style={styles.actionColumn}>
          {!autoLocation && (
            <TouchableOpacity style={styles.sideButton} onPress={onSwapRoute}>
              <Ionicons name="swap-vertical" size={22} color="#2E90FA" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.sideButton} onPress={onDismissSearch}>
            <Ionicons
              name={isSearching ? 'close-circle' : 'search'}
              size={20}
              color={isSearching ? '#F04438' : Colors[theme].icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isSearching && roomResults.length > 0 && (
        <View style={[styles.resultsDropdown, { backgroundColor: Colors[theme].background }]}>
          <FlatList
            data={roomResults}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => `res-${item.name}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onSelectRoom(item)} style={styles.resultItem}>
                <View style={styles.resultIcon}>
                  <Ionicons name="location" size={18} color="#2E90FA" />
                </View>
                <View style={styles.resultTextContainer}>
                  <ThemedText style={styles.resultText}>{formatRoomNameForUi(item.name)}</ThemedText>
                  <ThemedText style={styles.resultSubtext}>Floor {item.level}</ThemedText>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 110,
  },
  searchCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    alignItems: 'center',
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    marginRight: 8,
  },
  verticalLine: {
    width: 2,
    height: 20,
    backgroundColor: '#D0D5DD',
    marginVertical: 4,
    borderRadius: 1,
  },
  inputsWrapper: {
    flex: 1,
  },
  inputRow: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeRow: {
    backgroundColor: 'rgba(46, 144, 250, 0.08)',
  },
  textInput: {
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F2F4F7',
    marginVertical: 2,
  },
  actionColumn: {
    width: 44,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#F2F4F7',
    marginLeft: 8,
  },
  sideButton: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsDropdown: {
    marginTop: 8,
    borderRadius: 24,
    maxHeight: 250,
    padding: 8,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(46, 144, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTextContainer: {
    marginLeft: 12,
  },
  resultText: {
    fontWeight: '700',
    fontSize: 14,
  },
  resultSubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
});
