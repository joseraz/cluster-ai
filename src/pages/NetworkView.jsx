import { useState, useCallback } from 'react';
import { ReactFlow, addEdge, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Plus, Filter } from "lucide-react";
import { AddContactDialog } from "@/components/AddContactDialog";
import { FilterModal } from "@/components/FilterModal";
import { findShortestPath, getPathEdges } from "@/utils/pathfinding";
import ContactProgressBar from "@/components/ContactProgressBar";

// Updated network data with 'places' category and red central node
const initialNodes = [{
  id: '1',
  type: 'default',
  position: {
    x: 600,
    y: 300
  },
  data: {
    label: 'You',
    name: 'You',
    category: 'user',
    tags: []
  },
  style: {
    background: '#DC2626', // Changed from purple to red
    color: 'white',
    border: '3px solid #B91C1C', // Changed border to red
    borderRadius: '50%',
    width: 80,
    height: 80,
    fontSize: '12px',
    fontWeight: 'bold'
  }
},
// Business/Place contacts (yellow/gold)
{
  id: '2',
  position: {
    x: 450,
    y: 150
  },
  data: {
    label: 'Sarah Chen',
    name: 'Sarah Chen',
    place: 'TechCorp Office',
    category: 'places',
    tags: ['work', 'professional']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '3',
  position: {
    x: 750,
    y: 150
  },
  data: {
    label: 'Michael Rodriguez',
    name: 'Michael Rodriguez',
    place: 'StartupXYZ',
    category: 'places',
    tags: ['startup', 'founder']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '4',
  position: {
    x: 350,
    y: 300
  },
  data: {
    label: 'Jennifer Kim',
    name: 'Jennifer Kim',
    place: 'Coffee Shop Downtown',
    category: 'places',
    tags: ['personal', 'coffee']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '5',
  position: {
    x: 850,
    y: 300
  },
  data: {
    label: 'David Thompson',
    name: 'David Thompson',
    place: 'Central Park',
    category: 'places',
    tags: ['exercise', 'personal']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '6',
  position: {
    x: 500,
    y: 450
  },
  data: {
    label: 'Lisa Wang',
    name: 'Lisa Wang',
    place: 'Innovation Labs',
    category: 'places',
    tags: ['tech', 'innovation']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '7',
  position: {
    x: 700,
    y: 450
  },
  data: {
    label: 'Robert Chen',
    name: 'Robert Chen',
    place: 'Data Systems HQ',
    category: 'places',
    tags: ['data', 'engineering']
  },
  style: {
    background: '#FFB300',
    color: 'white',
    border: '2px solid #FF8F00',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
},
// Additional place contacts (blue)
{
  id: '8',
  position: {
    x: 300,
    y: 100
  },
  data: {
    label: 'Emma Davis',
    name: 'Emma Davis',
    place: 'Design Studio',
    category: 'places',
    tags: ['design', 'creative']
  },
  style: {
    background: '#1976D2',
    color: 'white',
    border: '2px solid #0D47A1',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '9',
  position: {
    x: 900,
    y: 100
  },
  data: {
    label: 'James Wilson',
    name: 'James Wilson',
    place: 'Marketing Plus Office',
    category: 'places',
    tags: ['marketing', 'growth']
  },
  style: {
    background: '#1976D2',
    color: 'white',
    border: '2px solid #0D47A1',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}, {
  id: '10',
  position: {
    x: 200,
    y: 200
  },
  data: {
    label: 'Sophie Martinez',
    name: 'Sophie Martinez',
    place: 'Finance Corp',
    category: 'places',
    tags: ['finance', 'analysis']
  },
  style: {
    background: '#1976D2',
    color: 'white',
    border: '2px solid #0D47A1',
    borderRadius: '50%',
    width: 60,
    height: 60,
    fontSize: '10px'
  }
}];
const initialEdges = [{
  id: 'e1-2',
  source: '1',
  target: '2',
  type: 'straight'
}, {
  id: 'e1-3',
  source: '1',
  target: '3',
  type: 'straight'
}, {
  id: 'e1-4',
  source: '1',
  target: '4',
  type: 'straight'
}, {
  id: 'e1-5',
  source: '1',
  target: '5',
  type: 'straight'
}, {
  id: 'e1-6',
  source: '1',
  target: '6',
  type: 'straight'
}, {
  id: 'e1-7',
  source: '1',
  target: '7',
  type: 'straight'
}, {
  id: 'e1-8',
  source: '1',
  target: '8',
  type: 'straight'
}, {
  id: 'e1-9',
  source: '1',
  target: '9',
  type: 'straight'
}, {
  id: 'e1-10',
  source: '1',
  target: '10',
  type: 'straight'
},
// Some interconnections
{
  id: 'e2-3',
  source: '2',
  target: '3',
  type: 'straight'
}, {
  id: 'e4-6',
  source: '4',
  target: '6',
  type: 'straight'
}, {
  id: 'e5-7',
  source: '5',
  target: '7',
  type: 'straight'
}];
const NetworkView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [filters, setFilters] = useState({
    user: [],
    places: [],
    tags: []
  });

  // Calculate contact count (excluding the central "You" node)
  const contactCount = nodes.filter(node => node.id !== '1').length;

  const onConnect = useCallback(params => setEdges(eds => addEdge(params, eds)), [setEdges]);

  const handleAddContact = contactData => {
    const newNodeId = contactData.id;
    const newNode = {
      id: newNodeId,
      position: {
        x: Math.random() * 400 + 400,
        y: Math.random() * 400 + 200
      },
      data: {
        label: `${contactData.name} ${contactData.lastName}`.trim(),
        name: contactData.name,
        lastName: contactData.lastName,
        notes: contactData.notes,
        tags: contactData.tags,
        category: 'places'
      },
      style: {
        background: '#FFB300',
        color: 'white',
        border: '2px solid #FF8F00',
        borderRadius: '50%',
        width: 60,
        height: 60,
        fontSize: '10px'
      }
    };
    const newEdge = {
      id: `e1-${newNodeId}`,
      source: '1',
      target: newNodeId,
      type: 'straight'
    };
    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);
  };

  const handleSearch = searchValue => {
    setSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setHighlightedPath([]);
      setHighlightedEdges([]);
      return;
    }
    const targetNode = nodes.find(node => node.data.name?.toLowerCase().includes(searchValue.toLowerCase()) || node.data.label?.toLowerCase().includes(searchValue.toLowerCase()));
    if (targetNode && targetNode.id !== '1') {
      const path = findShortestPath(edges, '1', targetNode.id);
      const pathEdges = getPathEdges(edges, path);
      setHighlightedPath(path || []);
      setHighlightedEdges(pathEdges);
    } else {
      setHighlightedPath([]);
      setHighlightedEdges([]);
    }
  };

  const getNodeStyle = node => {
    // Special handling for the central "You" node to ensure red color
    if (node.id === '1') {
      const baseStyle = {
        background: '#DC2626', // Force red background
        color: 'white',
        border: '3px solid #B91C1C', // Force red border
        borderRadius: '50%',
        width: 80,
        height: 80,
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000
      };
      
      if (highlightedPath.length > 0) {
        if (highlightedPath.includes(node.id)) {
          return {
            ...baseStyle,
            border: '3px solid #10B981',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
          };
        } else {
          return {
            ...baseStyle,
            opacity: 0.3
          };
        }
      }
      return baseStyle;
    }
    
    if (highlightedPath.length > 0) {
      if (highlightedPath.includes(node.id)) {
        return {
          ...node.style,
          border: '3px solid #10B981',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
        };
      } else {
        return {
          ...node.style,
          opacity: 0.3
        };
      }
    }
    return node.style;
  };

  const getEdgeStyle = edge => {
    if (highlightedEdges.length > 0) {
      if (highlightedEdges.includes(edge.id)) {
        return {
          stroke: '#10B981',
          strokeWidth: 3,
          strokeDasharray: 'none'
        };
      } else {
        return {
          opacity: 0.2
        };
      }
    }
    return {};
  };

  const applyFilters = nodeList => {
    if (!filters.user.length && !filters.places.length && !filters.tags.length) {
      return nodeList;
    }
    return nodeList.filter(node => {
      // Always show the central "You" node
      if (node.id === '1') return true;

      // Check user filter
      if (filters.user.length > 0 && !filters.user.includes(node.data.category)) {
        return false;
      }

      // Check places filter
      if (filters.places.length > 0 && node.data.category === 'places') {
        const hasMatchingPlace = filters.places.some(place => node.data.place?.toLowerCase().includes(place.toLowerCase()));
        if (!hasMatchingPlace) return false;
      }

      // Check tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = node.data.tags?.some(tag => filters.tags.some(filterTag => tag.toLowerCase().includes(filterTag.toLowerCase())));
        if (!hasMatchingTag) return false;
      }
      return true;
    });
  };

  const filteredNodes = applyFilters(nodes);
  const displayNodes = searchTerm ? filteredNodes : filteredNodes;

  // Update node styles for display
  const styledNodes = displayNodes.map(node => ({
    ...node,
    style: getNodeStyle(node)
  }));
  const styledEdges = edges.map(edge => ({
    ...edge,
    style: getEdgeStyle(edge)
  }));
  const categories = [{
    name: 'All',
    count: nodes.length,
    color: '#0077B5',
    icon: '📊'
  }, {
    name: 'User',
    count: 1,
    color: '#7B1FA2',
    icon: '👤'
  }, {
    name: 'Places',
    count: nodes.filter(n => n.data.category === 'places').length,
    color: '#FFB300',
    icon: '📍'
  }];

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-gray-900">Network View</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <AddContactDialog onAddContact={handleAddContact} trigger={<Button size="sm" className="bg-[#0077B5] hover:bg-[#005885] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>} />
          <FilterModal filters={filters} onFiltersChange={setFilters} trigger={<Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>} />
        </div>
      </div>

      {/* Contact Progress Bar */}
      <ContactProgressBar contactCount={contactCount} />

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Network Visualization */}
        <ReactFlow nodes={styledNodes} edges={styledEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView style={{
        backgroundColor: "#FFFFFF"
      }} nodesDraggable={true} nodesConnectable={false} elementsSelectable={true}>
          <Controls style={{
          backgroundColor: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '8px'
        }} />
        </ReactFlow>

        {/* Right Sidebar - Categories */}
        

        {/* Bottom Search Bar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 min-w-96">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <Input placeholder="Search contacts by name..." value={searchTerm} onChange={e => handleSearch(e.target.value)} className="border-0 focus-visible:ring-0 bg-transparent flex-1" />
            {searchTerm && <Button size="sm" variant="ghost" className="p-1" onClick={() => handleSearch('')}>
                ✕
              </Button>}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-2 left-4 bg-white rounded border border-gray-200 px-3 py-1 text-sm text-gray-600">
          All ({filteredNodes.length}) | Selected (0)
          {highlightedPath.length > 0 && <span className="ml-2 text-green-600">
              | Path: {highlightedPath.length} nodes
            </span>}
        </div>
      </div>
    </div>
  );
};
export default NetworkView;
