import * as turf from '@turf/turf';

type Coord = [number, number];
const TURN_THRESHOLD_DEGREES = 15;
const UTURN_THRESHOLD_DEGREES = 150;

export type NavigationStep = {
  atNodeIndex: number;
  atNodeId: string;
  nextNodeId: string;
  fromRoomKey: string;
  toRoomKey: string;
  instruction: string;
};

const toBearing = (from: Coord, to: Coord) => {
  const a = turf.point(from);
  const b = turf.point(to);
  return turf.bearing(a, b);
};

const normalizeTurn = (degrees: number) => {
  const value = ((degrees + 540) % 360) - 180;
  return value;
};

const roomKeyFromNode = (nodeId: string) => nodeId.replace(/_[a-z]$/i, '');

const prettifyNode = (nodeId: string) => {
  const base = roomKeyFromNode(nodeId);
  return base.replace(/_/g, ' ');
};

export const buildTurnByTurnSteps = (nodeIds: string[], coordinates: Coord[]): NavigationStep[] => {
  if (!nodeIds?.length || !coordinates || coordinates.length < 2 || nodeIds.length !== coordinates.length) {
    return [];
  }

  const transitions = [] as Array<{
    index: number;
    fromRoomKey: string;
    toRoomKey: string;
    bearing: number;
  }>;

  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    const fromRoomKey = roomKeyFromNode(nodeIds[i]);
    const toRoomKey = roomKeyFromNode(nodeIds[i + 1]);
    if (fromRoomKey === toRoomKey) {
      continue;
    }
    transitions.push({
      index: i,
      fromRoomKey,
      toRoomKey,
      bearing: toBearing(coordinates[i], coordinates[i + 1]),
    });
  }

  if (!transitions.length) {
    return [];
  }

  const steps: NavigationStep[] = [];
  for (let t = 0; t < transitions.length; t += 1) {
    const transition = transitions[t];
    const current = nodeIds[transition.index];
    const next = nodeIds[transition.index + 1];
    const nextLabel = prettifyNode(next);
    let instruction = `Enter the ${nextLabel}`;

    if (t > 0) {
      const inBearing = transitions[t - 1].bearing;
      const outBearing = transition.bearing;
      const turn = normalizeTurn(outBearing - inBearing);
      const absTurn = Math.abs(turn);

      if (absTurn >= UTURN_THRESHOLD_DEGREES) {
        instruction = `Make a U-turn toward ${nextLabel}`;
      } else if (absTurn >= TURN_THRESHOLD_DEGREES) {
        instruction = `${turn > 0 ? 'Turn right' : 'Turn left'} and enter the ${nextLabel}`;
      } else {
        instruction = `Continue forward to ${nextLabel}`;
      }
    }

    steps.push({
      atNodeIndex: transition.index,
      atNodeId: current,
      nextNodeId: next,
      fromRoomKey: transition.fromRoomKey,
      toRoomKey: transition.toRoomKey,
      instruction,
    });
  }

  const lastNodeId = nodeIds[nodeIds.length - 1];
  const lastRoomKey = roomKeyFromNode(lastNodeId);
  const hasArrivalStep = steps.some((step) => step.toRoomKey === lastRoomKey);
  if (!hasArrivalStep) {
    steps.push({
      atNodeIndex: nodeIds.length - 1,
      atNodeId: lastNodeId,
      nextNodeId: lastNodeId,
      fromRoomKey: lastRoomKey,
      toRoomKey: lastRoomKey,
      instruction: 'You have arrived',
    });
  }

  return steps;
};
