
// Simple pathfinding algorithm to find shortest path between nodes
export function findShortestPath(edges, startNodeId, endNodeId) {
  if (startNodeId === endNodeId) {
    return [startNodeId];
  }

  // Build adjacency list
  const graph = {};
  edges.forEach(edge => {
    if (!graph[edge.source]) graph[edge.source] = [];
    if (!graph[edge.target]) graph[edge.target] = [];
    
    graph[edge.source].push(edge.target);
    graph[edge.target].push(edge.source);
  });

  // BFS to find shortest path
  const queue = [[startNodeId]];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift();
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

  return null; // No path found
}

export function getPathEdges(edges, path) {
  if (!path || path.length < 2) return [];

  const pathEdges = [];
  for (let i = 0; i < path.length - 1; i++) {
    const sourceNode = path[i];
    const targetNode = path[i + 1];
    
    const edge = edges.find(e => 
      (e.source === sourceNode && e.target === targetNode) ||
      (e.source === targetNode && e.target === sourceNode)
    );
    
    if (edge) {
      pathEdges.push(edge.id);
    }
  }
  
  return pathEdges;
}
