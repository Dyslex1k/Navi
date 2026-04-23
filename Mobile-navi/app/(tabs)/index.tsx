// app/(tabs)/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Makes sure that if the user somehow gets to the index page they will be moved to the map view instead
  return <Redirect href="/(tabs)/map" />;
}
