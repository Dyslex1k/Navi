import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'banner' | 'fullscreen';
  style?: ViewStyle;
}

export const ErrorMessage = ({ 
  message, 
  onRetry, 
  variant = 'banner', 
  style 
}: ErrorMessageProps) => {
  const isFullscreen = variant === 'fullscreen';

  return (
    <View style={[
      styles.container, 
      isFullscreen ? styles.fullscreen : styles.banner, 
      style
    ]}>
      <View style={styles.content}>
        <Ionicons 
          name={isFullscreen ? "alert-circle" : "warning"} 
          size={isFullscreen ? 48 : 20} 
          color="#B42318" 
        />
        <View style={isFullscreen ? styles.textCenter : styles.textLeft}>
          <Text style={[styles.errorText, isFullscreen && styles.textLarge]}>
            {message}
          </Text>
        </View>
      </View>

      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryBtn, isFullscreen && styles.retryBtnFull]} 
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  banner: {
    backgroundColor: '#FEE4E2',
    borderWidth: 1,
    borderColor: '#FDA29B',
    marginHorizontal: 16,
  },
  fullscreen: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  textCenter: { alignItems: 'center', marginTop: 12 },
  textLeft: { flex: 1 },
  errorText: {
    color: '#B42318',
    fontWeight: '700',
    fontSize: 13,
  },
  textLarge: { fontSize: 16, textAlign: 'center' },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDA29B',
  },
  retryBtnFull: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12 },
  retryText: { color: '#B42318', fontWeight: 'bold', fontSize: 12 },
});