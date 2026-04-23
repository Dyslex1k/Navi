import createGraph from 'ngraph.graph';
import path from 'ngraph.path';
import * as turf from '@turf/turf';

import type { NavigationPath, PathEdgesData } from '@/types/map';

type GraphNodeData = {
  coords: number[];
};

export const generatePath = (
  startNodeId: string,
  endNodeId: string,
  edgesGeojson: PathEdgesData
): NavigationPath | null => {
  if (!startNodeId || !endNodeId) return null;
  if (startNodeId === endNodeId) return null;

  const graph = createGraph();

  edgesGeojson.features.forEach((feature) => {
    const { from_id, to_id, cost } = feature.properties;
    const coords = feature.geometry.coordinates;

    graph.addNode(from_id, { coords: coords[0] });
    graph.addNode(to_id, { coords: coords[1] });

    graph.addLink(from_id, to_id, {
      weight: Number(cost) || 1,
      geometry: coords
    });
    graph.addLink(to_id, from_id, {
      weight: Number(cost) || 1,
      geometry: coords
    });
  });

  const pathFinder = path.aStar(graph, {
    distance(fromNode, toNode, link) {
      return link.data.weight;
    }
  });

  const foundPath = pathFinder.find(startNodeId, endNodeId) as Array<{ id: string; data: GraphNodeData }>;

  if (!foundPath || foundPath.length < 2) return null;

  const coordinates = foundPath.map(node => node.data.coords).reverse();
  const line = turf.lineString(coordinates);
  const distance = turf.length(line, { units: 'meters' });

  return {
    geometry: line,
    distance: Math.round(distance),
    nodeIds: foundPath.map((node) => node.id).reverse(),
  };
};
