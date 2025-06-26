
// Simple pathfinding utilities for network visualization
export const findShortestPath = (edges, startNode, endNode) => {
  if (startNode === endNode) return [startNode];
  
  // Build adjacency list
  const graph = {};
  edges.forEach(edge => {
    if (!graph[edge.source]) graph[edge.source] = [];
    if (!graph[edge.target]) graph[edge.target] = [];
    graph[edge.source].push(edge.target);
    graph[edge.target].push(edge.source);
  });
  
  // BFS to find shortest path
  const queue = [[startNode]];
  const visited = new Set([startNode]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];
    
    if (currentNode === endNode) {
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
  
  return []; // No path found
};

export const getPathEdges = (edges, path) => {
  if (!path || path.length < 2) return [];
  
  const pathEdges = [];
  for (let i = 0; i < path.length - 1; i++) {
    const source = path[i];
    const target = path[i + 1];
    
    const edge = edges.find(e => 
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
    );
    
    if (edge) {
      pathEdges.push(edge.id);
    }
  }
  
  return pathEdges;
};
