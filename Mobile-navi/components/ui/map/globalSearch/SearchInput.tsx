import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchInputProps {
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
  theme: 'light' | 'dark';
}

export const SearchInput = ({ value, onChange, onClear, theme }: SearchInputProps) => (
  <View style={[styles.searchBar, { backgroundColor: Colors[theme].background }]}>
    <TextInput
      style={[styles.input, { color: Colors[theme].text }]}
      placeholder="Search buildings..."
      placeholderTextColor={Colors[theme].icon}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
    />
    {value.length == 0 && (
        <View style={styles.searchIconCircle}>
        <Ionicons name="search" size={18} color="white" />
        </View>
    )}
    {value.length > 0 && (
      <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
        <Ionicons name="close-circle" size={20} color={Colors[theme].icon} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  searchIconCircle: {
    backgroundColor: '#2E90FA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: { flex: 1, marginHorizontal: 12, fontSize: 16, fontWeight: '500' },
  clearBtn: { padding: 8 },
});