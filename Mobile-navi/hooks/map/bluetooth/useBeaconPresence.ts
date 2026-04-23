import { useLiveBleRssi } from '@/hooks/map/bluetooth/useLiveBleRssi';
import { useMemo } from 'react';

const normalizeId = (id: string) => id.trim().toLowerCase().replace(/:/g, '');

export const useBeaconPresence = ({ enabled, beacons }: { enabled: boolean; beacons: any[] }) => {
  const targetIds = useMemo(() => beacons.map(b => normalizeId(b.id)), [beacons]);
  const { readings, isScanning, error } = useLiveBleRssi({ enabled, targetIds });

  return useMemo(() => {
    if (!enabled) {
      return { room: 'UNKNOWN', position: null, statuses: [], isScanning, error };
    }

    const statuses = beacons.map(beacon => {
      const reading = readings[normalizeId(beacon.id)];
      const isActive = reading?.isRunning && reading.rssi !== undefined;
      
      return {
        id: beacon.id,
        name: beacon.name,
        rssi: isActive ? reading.rssi : null,
        running: !!reading?.isRunning,
        coords: beacon.coords
      };
    });

    // Sort by RSSI descending
    const activeBeacons = statuses
      .filter(s => s.running && s.rssi !== null)
      .sort((a, b) => (b.rssi ?? -100) - (a.rssi ?? -100));

    let currentRoom = 'UNKNOWN';

    if (activeBeacons.length > 0) {
      const primary = activeBeacons[0];
      currentRoom = primary.name.toUpperCase();
    }

    return {
      room: currentRoom,
      statuses,
      isScanning,
      error
    };
  }, [enabled, readings, beacons, isScanning, error]);
};