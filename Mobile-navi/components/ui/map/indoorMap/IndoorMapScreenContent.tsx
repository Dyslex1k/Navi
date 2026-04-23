import type { CameraRef } from '@maplibre/maplibre-react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

import type { IndoorBuildingData } from '@/api/types';
import { MapView3D } from '@/components/ui/map/geoMap/MapView3D';
import { MapSearchPanel } from '@/components/ui/map/indoorMap/MapSearchPanel';
import { PendingRouteCard } from '@/components/ui/map/indoorMap/PendingRouteCard';
import { RightControls } from '@/components/ui/map/indoorMap/RightControls';
import { TopBar } from '@/components/ui/map/indoorMap/TopBar';
import { TurnByTurnPopup } from '@/components/ui/map/indoorMap/TurnByTurnPopup';

import { useFloorManagement } from '@/hooks/map/indoorMap/useFloorManagement';
import { useIndoorMapController } from '@/hooks/map/indoorMap/useIndoorMapController';
import { useMapPresence } from '@/hooks/map/indoorMap/useMapPresence';
import { RoomSelection } from '@/hooks/pathfinding/useIndoorNavigation';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { formatRoomNameForUi } from '@/utils/formatRoomName';

interface IndoorMapScreenContentProps {
  indoorBuildingData: IndoorBuildingData;
  onBack: () => void;
}

export const IndoorMapScreenContent = ({ indoorBuildingData, onBack }: IndoorMapScreenContentProps) => {
  const theme = useColorScheme();
  const cameraRef = useRef<CameraRef>(null);
  const startInputRef = useRef<TextInput>(null);
  const endInputRef = useRef<TextInput>(null);

  const { activeLevel, mapFloors, translateY, handleLevelChange } = useFloorManagement(
    indoorBuildingData.floors
  );

  const { detectedRoom, autoLocation, presenceError } = useMapPresence(indoorBuildingData);

  const ctrl = useIndoorMapController({
    indoorBuildingData,
    autoLocation,
    detectedRoom,
    cameraRef,
    onLevelChange: handleLevelChange,
  });

  useEffect(() => {
    if (autoLocation) {
      ctrl.applyAutoLocationStart();
      const timer = setTimeout(() => endInputRef.current?.focus(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoLocation, ctrl.applyAutoLocationStart]);

  const handleRoomSelect = useCallback((room: RoomSelection) => {
    ctrl.handleSelectRoom(room);
    Keyboard.dismiss();
  }, [ctrl.handleSelectRoom]);

  const handleDismissSearch = useCallback(() => {
    ctrl.clearSearch();
    Keyboard.dismiss();
  }, [ctrl.clearSearch]);

  const handleCancelNavigation = useCallback(() => {
    ctrl.cancelNavigation();
    Keyboard.dismiss();
  }, [ctrl.cancelNavigation]);

  const topBarSubtitle = useMemo(() => {
    if (ctrl.navigationPath) return 'Route Active';
    if (presenceError) return `Presence Error: ${presenceError}`;
    if (!detectedRoom) return '';
    return `Currently in: ${formatRoomNameForUi(detectedRoom.name)}`;
  }, [detectedRoom, ctrl.navigationPath, presenceError]);

  const destinationLabel = useMemo(
    () => ctrl.endRoom?.name?.replace(/_/g, ' ') ?? 'destination',
    [ctrl.endRoom?.name]
  );

  const popupStepIndex = ctrl.hasArrived
    ? Math.max(ctrl.routeSteps.length - 1, 0)
    : Math.min(ctrl.activeStepIndex, Math.max(ctrl.routeSteps.length - 1, 0));

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <TopBar title={indoorBuildingData.name} subtitle={topBarSubtitle} onBack={onBack} />
        
        <MapSearchPanel
          autoLocation={autoLocation}
          theme={theme}
          searchQuery={ctrl.searchQuery}
          isSearching={ctrl.isSearching}
          selectingType={ctrl.selectingType}
          startRoom={ctrl.startRoom}
          endRoom={ctrl.endRoom}
          roomResults={ctrl.roomResults}
          startInputRef={startInputRef}
          endInputRef={endInputRef}
          onSelectType={ctrl.setSelectingType}
          onSearchChange={ctrl.handleSearchChange}
          onSelectRoom={handleRoomSelect}
          onSwapRoute={ctrl.swapRoute}
          onDismissSearch={handleDismissSearch}
        />

        {ctrl.hasPendingRouteConfirmation && (
          <PendingRouteCard
            destinationLabel={destinationLabel}
            onCancel={ctrl.cancelPendingNavigation}
            onConfirm={ctrl.confirmPendingNavigation}
          />
        )}
      </View>

      <MapView3D
        ref={cameraRef}
        activeLevel={activeLevel}
        geojson={indoorBuildingData.geojson}
        detectedRoomName={detectedRoom?.name ?? null}
        initialCoords={indoorBuildingData.coords}
        navigationPath={ctrl.renderedNavigationPath}
        zoomLevel={19}
        pitch={25}
      />

      {ctrl.navigationPath && ctrl.activeStep && (
        <View style={styles.instructionsOverlay}>
          <TurnByTurnPopup
            instruction={ctrl.hasArrived ? 'You have arrived' : ctrl.activeStep.instruction}
            stepIndex={popupStepIndex}
            totalSteps={Math.max(ctrl.routeSteps.length, 1)}
            onCancel={handleCancelNavigation}
            onPrev={!autoLocation ? () => ctrl.setActiveStepIndex(i => Math.max(0, i - 1)) : undefined}
            onNext={!autoLocation ? () => ctrl.setActiveStepIndex(i => Math.min(ctrl.routeSteps.length - 1, i + 1)) : undefined}
          />
        </View>
      )}

      <RightControls
        floors={mapFloors}
        translateY={translateY}
        onLevelChange={handleLevelChange}
        canSnapToRoom={ctrl.canSnapToDetectedRoom}
        onSnapToRoom={ctrl.snapToDetectedRoom}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  instructionsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    zIndex: 120,
  },
});
