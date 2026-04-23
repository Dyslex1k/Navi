import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type AppColorScheme = 'light' | 'dark';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  colorScheme: AppColorScheme;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const systemColorScheme = useSystemColorScheme();

  const colorScheme: AppColorScheme =
    preference === 'system' ? (systemColorScheme ?? 'light') : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      colorScheme,
    }),
    [preference, colorScheme]
  );

  return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}

function useThemePreferenceContext() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('ThemePreference hooks must be used within ThemePreferenceProvider.');
  }
  return context;
}

export function useThemePreference() {
  const { preference, setPreference } = useThemePreferenceContext();
  return { preference, setPreference };
}

export function useAppColorScheme(): AppColorScheme {
  const { colorScheme } = useThemePreferenceContext();
  return colorScheme;
}
