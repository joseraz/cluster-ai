
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NetworkHeader } from "@/components/NetworkHeader";
import { NetworkSidebar } from "@/components/NetworkSidebar";
import { NetworkSearchBar } from "@/components/NetworkSearchBar";
import { AddContactDialog } from "@/components/AddContactDialog";
import { initialNodes, initialEdges } from "@/data/networkData";

const NetworkView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [highlightedEdges, setHighlightedEdges] = useState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
      return;
    }

    // Find the searched node
    const searchedNode = nodes.find(node =>
      node.data.name.toLowerCase().includes(term.toLowerCase()) ||
      node.data.company?.toLowerCase().includes(term.toLowerCase())
    );

    if (searchedNode && searchedNode.id !== '1') {
      // Find path from 'You' (node 1) to the searched node
      const pathEdges = edges.filter(edge => 
        (edge.source === '1' && edge.target === searchedNode.id) ||
        (edge.target === '1' && edge.source === searchedNode.id)
      );

      setHighlightedNodes(['1', searchedNode.id]);
      setHighlightedEdges(pathEdges.map(edge => edge.id));
    } else {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
    }
  };

  const handleAddContact = (contactData) => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      position: { x: Math.random() * 600 + 200, y: Math.random() * 400 + 100 },
      data: { 
        label: contactData.name,
        name: contactData.name,
        company: contactData.company,
        role: contactData.role,
        category: contactData.category
      },
      style: { 
        background: contactData.category === 'business' ? '#FFB300' : 
                   contactData.category === 'category' ? '#1976D2' : '#F57C00',
        color: 'white', 
        border: contactData.category === 'business' ? '2px solid #FF8F00' : 
               contactData.category === 'category' ? '2px solid #0D47A1' : '2px solid #E65100',
        borderRadius: '50%', 
        width: 60, 
        height: 60, 
        fontSize: '10px' 
      },
    };

    const newEdge = {
      id: `e1-${newId}`,
      source: '1',
      target: newId,
      type: 'straight'
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);
    setIsAddContactOpen(false);
  };

  // Apply highlighting styles
  const styledNodes = nodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      opacity: highlightedNodes.length > 0 ? (highlightedNodes.includes(node.id) ? 1 : 0.3) : 1,
      borderWidth: highlightedNodes.includes(node.id) ? '3px' : node.style.borderWidth || '2px'
    }
  }));

  const styledEdges = edges.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      stroke: highlightedEdges.includes(edge.id) ? '#0077B5' : '#d1d5db',
      strokeWidth: highlightedEdges.includes(edge.id) ? 3 : 1,
      opacity: highlightedEdges.length > 0 ? (highlightedEdges.includes(edge.id) ? 1 : 0.3) : 1
    }
  }));

  return (
    <div className="h-screen bg-white flex flex-col">
      <NetworkHeader onAddContact={() => setIsAddContactOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Network Visualization */}
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ backgroundColor: "#FFFFFF" }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Controls 
            style={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
        </ReactFlow>

        <NetworkSidebar nodes={nodes} />

        <NetworkSearchBar 
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onClear={() => handleSearch('')}
        />

        {/* Bottom Status Bar */}
        <div className="absolute bottom-2 left-4 bg-white rounded border border-gray-200 px-3 py-1 text-sm text-gray-600">
          All ({nodes.length - 1}) | Selected (0)
        </div>
      </div>

      <AddContactDialog 
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        onAddContact={handleAddContact}
      />
    </div>
  );
};

export default NetworkView;
