import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';

interface PendingRouteCardProps {
  destinationLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PendingRouteCard = ({
  destinationLabel,
  onCancel,
  onConfirm,
}: PendingRouteCardProps) => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.confirmCard, { backgroundColor: Colors[theme].background }]}>
      <ThemedText style={styles.confirmTitle} numberOfLines={1}>
        Start route to {destinationLabel}?
      </ThemedText>
      <View style={styles.confirmActions}>
        <TouchableOpacity
          style={[styles.confirmButton, styles.cancelButton, { backgroundColor: isDark ? '#2A2F37' : '#F2F4F7' }]}
          onPress={onCancel}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmButton, styles.startButton]} onPress={onConfirm}>
          <ThemedText style={styles.startButtonText}>Confirm</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  confirmCard: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButton: {
  },
  startButton: {
    backgroundColor: '#2E90FA',
  },
  cancelButtonText: {
    fontWeight: '700',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
