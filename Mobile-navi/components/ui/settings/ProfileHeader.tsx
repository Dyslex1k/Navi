import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarIcon?: string;
}

export const ProfileHeader = ({ 
  name, 
  email, 
  avatarIcon = "person.circle.fill" 
}: ProfileHeaderProps) => {
  return (
    <ThemedView style={styles.header}>
      <IconSymbol name={avatarIcon as any} size={80} color="#888" />
      <ThemedText type="title" style={styles.userName}>
        {name}
      </ThemedText>
      <ThemedText style={styles.userEmail}>
        {email}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  userName: {
    marginTop: 15,
  },
  userEmail: {
    color: '#888',
    marginTop: 4,
  },
});