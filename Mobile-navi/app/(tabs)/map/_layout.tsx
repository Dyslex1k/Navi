import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}
