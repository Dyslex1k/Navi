import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export interface Coords {
  latitude: number;
  longitude: number;
}

interface PositionState {
  position: Coords | null;
  error: string | null;
  loading: boolean;
}

export const useUserPosition = () => {

  const [state, setState] = useState<PositionState>({
    position: null,
    error: null,
    loading: true,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    const getSingleUpdate = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted.current) {
            setState(prevState => ({ ...prevState, error: 'Permission denied', loading: false }));
          }
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown && isMounted.current) {
          setState(prevState => ({
            ...prevState,
            position: {
              latitude: lastKnown.coords.latitude,
              longitude: lastKnown.coords.longitude,
            },
          }));
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (isMounted.current) {
          setState({
            position: {
              latitude: current.coords.latitude,
              longitude: current.coords.longitude,
            },
            error: null,
            loading: false,
          });
        }
      } catch (err) {
        if (isMounted.current) {
          setState(prevState => ({
            ...prevState,
            error: err instanceof Error ? err.message : 'Unknown error',
            loading: false,
          }));
        }
      }
    };

    getSingleUpdate()

    return () => {
      isMounted.current = false;
    };
  }, []);

  return state;
};