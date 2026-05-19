import type { Edge } from '@xyflow/react';

export function findShortestPath(
  edges: Edge[],
  startNodeId: string,
  endNodeId: string
): string[] | null {
  if (startNodeId === endNodeId) {
    return [startNodeId];
  }

  const graph: Record<string, string[]> = {};
  edges.forEach(edge => {
    if (!graph[edge.source]) graph[edge.source] = [];
    if (!graph[edge.target]) graph[edge.target] = [];

    graph[edge.source].push(edge.target);
    graph[edge.target].push(edge.source);
  });

  const queue: string[][] = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentNode = path[path.length - 1];

    if (currentNode === endNodeId) {
      return path;
    }

    const neighbors = graph[currentNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}

export function getPathEdges(edges: Edge[], path: string[] | null): string[] {
  if (!path || path.length < 2) return [];

  const pathEdges: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const sourceNode = path[i];
    const targetNode = path[i + 1];

    const edge = edges.find(
      e =>
        (e.source === sourceNode && e.target === targetNode) ||
        (e.source === targetNode && e.target === sourceNode)
    );

    if (edge) {
      pathEdges.push(edge.id);
    }
  }

  return pathEdges;
}
