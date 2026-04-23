import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';

interface TurnByTurnPopupProps {
  instruction: string;
  stepIndex: number;
  totalSteps: number;
  onCancel?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const TurnByTurnPopup = ({
  instruction,
  stepIndex,
  totalSteps,
  onCancel,
  onPrev,
  onNext,
}: TurnByTurnPopupProps) => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.card, { backgroundColor: Colors[theme].background }]}>
      <View style={styles.topRow}>
        <ThemedText style={styles.counter}>
          Step {Math.min(stepIndex + 1, totalSteps)} / {totalSteps}
        </ThemedText>
        {onCancel ? (
          <TouchableOpacity
            style={[styles.cancelInline, { backgroundColor: isDark ? '#4A1D1D' : '#FEE4E2' }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.stopText}>Stop</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.messageRow}>
        <ThemedText style={styles.instruction}>{instruction}</ThemedText>
        {onPrev && onNext ? (
          <View style={styles.inlineActions}>
            <TouchableOpacity
              style={[styles.smallBtn, styles.secondary, { backgroundColor: isDark ? '#2A2F37' : '#F2F4F7' }]}
              onPress={onPrev}
            >
              <Ionicons name="chevron-back" size={18} color={Colors[theme].text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.smallBtn, styles.primary]} onPress={onNext}>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
  },
  instruction: {
    marginTop: 0,
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    lineHeight: 22,
  },
  messageRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 4,
    flexShrink: 0,
  },
  smallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2E90FA',
  },
  secondary: {
  },
  cancelInline: {
    width: 90,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  stopText: {
    color: '#B42318',
    fontWeight: '800',
    fontSize: 14,
  },
});
