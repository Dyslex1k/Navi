import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemePreference } from '@/hooks/theme/theme-preference';

import { ProfileHeader } from '@/components/ui/settings/ProfileHeader';
import { ThemePreferenceRow } from '@/components/ui/settings/ThemePreferenceRow';
import { Theme_Options } from '@/constants/theme';

export default function AccountScreen() {
  const { preference, setPreference } = useThemePreference();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <ProfileHeader 
          name={'Guest User'} 
          email={'anonymous@university.ac.uk'}>
        </ProfileHeader>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>App Settings</ThemedText>
          
          {Theme_Options.map((opt) => (
            <ThemePreferenceRow
              key={opt.id}
              icon={opt.icon as any}
              label={opt.label}
              selected={preference === opt.id}
              onPress={() => setPreference(opt.id as any)}
            />
          ))}
        </ThemedView>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 5,
  }
});
