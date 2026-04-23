import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const TopBar = ({ title, subtitle, onBack }: TopBarProps) => {
  const theme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { top: insets.top + 10 }]}>
      <ThemedView style={[styles.confirmHeader, { backgroundColor: Colors[theme].background }]}>
        
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={Colors[theme].text} 
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.headerSubtitle, { color: Colors[theme].icon }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
        
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: { flex: 1, marginRight: 20 },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 1 },
});
