import { useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const STALE_MS = 4000;
const normalizeId = (v: string) => v.trim().toLowerCase().replace(/:/g, '');

const requestPermissions = async () => {
  if (Platform.OS !== 'android') return true;
  const perms = Platform.Version >= 31 
    ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  
  const result = await PermissionsAndroid.requestMultiple(perms);
  return Object.values(result).every(res => res === PermissionsAndroid.RESULTS.GRANTED);
};

export const useLiveBleRssi = ({ enabled, targetIds }: { enabled: boolean; targetIds: string[] }) => {
  const [readings, setReadings] = useState<Record<string, any>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const managerRef = useRef<BleManager | null>(null);
  const targetIdsKey = useMemo(
    () => targetIds.map(normalizeId).sort().join(','),
    [targetIds]
  );
  const targetSet = useMemo(
    () => new Set(targetIdsKey ? targetIdsKey.split(',') : []),
    [targetIdsKey]
  );

  useEffect(() => {
    if (!enabled || targetSet.size === 0) {
      setIsScanning(false);
      return;
    }

    let cancelled = false;
    const manager = new BleManager();
    managerRef.current = manager;

    const startScan = async () => {
      try {
        const hasPermission = await requestPermissions();
        if (cancelled) {
          return;
        }

        if (!hasPermission) {
          setError('Permissions denied');
          setIsScanning(false);
          return;
        }

        manager.startDeviceScan(null, { allowDuplicates: true }, (err, device) => {
          if (cancelled) {
            return;
          }

          if (err) {
            setError(err.message);
            setIsScanning(false);
            return;
          }

          const foundId = [device?.id, device?.name, device?.localName]
            .map(v => v ? normalizeId(v) : '')
            .find(id => targetSet.has(id));

          if (foundId && typeof device?.rssi === 'number') {
            setReadings(prev => ({
              ...prev,
              [foundId]: { id: foundId, rssi: device.rssi, lastSeenMs: Date.now(), isRunning: true }
            }));
          }
        });
        setIsScanning(true);
      } catch (scanError) {
        if (cancelled) {
          return;
        }

        const message = scanError instanceof Error ? scanError.message : 'Failed to start BLE scan';
        setError(message);
        setIsScanning(false);
      }
    };

    const subscription = manager.onStateChange((state) => {
      if (cancelled) {
        return;
      }

      if (state === 'PoweredOn') {
        void startScan();
      } else {
        manager.stopDeviceScan();
        setIsScanning(false);
      }
    }, true);

    const timer = setInterval(() => {
      if (cancelled) {
        return;
      }

      setReadings(prev => {
        const now = Date.now();
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          next[key].isRunning = now - next[key].lastSeenMs < STALE_MS;
        });
        return next;
      });
    }, 2000);

    return () => {
      cancelled = true;
      subscription.remove();
      clearInterval(timer);
      manager.stopDeviceScan();
      manager.destroy();
      managerRef.current = null;
    };
  }, [enabled, targetIdsKey, targetSet]);

  return { readings, isScanning, error };
};
