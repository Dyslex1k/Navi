import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface MapStateScreenProps {
  mode: 'loading' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const MapStateScreen = ({ mode, errorMessage, onRetry, onBack }: MapStateScreenProps) => {
  if (mode === 'loading') {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#2E90FA" />
        <ThemedText style={styles.title}>Loading indoor map...</ThemedText>
        <ThemedText style={styles.subtitle}>Preparing building data and 3D layers.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Map Load Failed
      </ThemedText>
      <ThemedText style={styles.subtitle}>{errorMessage ?? 'Unknown error.'}</ThemedText>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
          <ThemedText style={styles.primaryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <ThemedText style={styles.secondaryButtonText}>Back to Map</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 14,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.75,
  },
  actions: {
    marginTop: 20,
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#2E90FA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});
