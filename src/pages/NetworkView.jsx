import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Plus, Filter, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { AddContactDialog } from "@/components/AddContactDialog";

// Expanded network data with 24 contacts
const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 600, y: 300 },
    data: { 
      label: 'You',
      name: 'You',
      company: 'Your Company',
      role: 'Your Role',
      category: 'user'
    },
    style: { 
      background: '#7B1FA2', 
      color: 'white', 
      border: '3px solid #4A148C',
      borderRadius: '50%',
      width: 80,
      height: 80,
      fontSize: '12px',
      fontWeight: 'bold'
    },
  },
  // Business contacts (yellow/gold)
  {
    id: '2',
    position: { x: 450, y: 150 },
    data: { label: 'Sarah Chen', name: 'Sarah Chen', company: 'TechCorp', role: 'Product Manager', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '3',
    position: { x: 750, y: 150 },
    data: { label: 'Michael Rodriguez', name: 'Michael Rodriguez', company: 'StartupXYZ', role: 'Founder', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '4',
    position: { x: 350, y: 300 },
    data: { label: 'Jennifer Kim', name: 'Jennifer Kim', company: 'Enterprise Inc', role: 'Director', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '5',
    position: { x: 850, y: 300 },
    data: { label: 'David Thompson', name: 'David Thompson', company: 'Consulting Co', role: 'Senior Consultant', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '6',
    position: { x: 500, y: 450 },
    data: { label: 'Lisa Wang', name: 'Lisa Wang', company: 'Innovation Labs', role: 'CTO', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '7',
    position: { x: 700, y: 450 },
    data: { label: 'Robert Chen', name: 'Robert Chen', company: 'Data Systems', role: 'VP Engineering', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Category contacts (blue)
  {
    id: '8',
    position: { x: 300, y: 100 },
    data: { label: 'Emma Davis', name: 'Emma Davis', company: 'Design Studio', role: 'Creative Director', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '9',
    position: { x: 900, y: 100 },
    data: { label: 'James Wilson', name: 'James Wilson', company: 'Marketing Plus', role: 'Growth Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '10',
    position: { x: 200, y: 200 },
    data: { label: 'Sophie Martinez', name: 'Sophie Martinez', company: 'Finance Corp', role: 'Analyst', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '11',
    position: { x: 1000, y: 200 },
    data: { label: 'Kevin Brown', name: 'Kevin Brown', company: 'Sales Force', role: 'Account Executive', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '12',
    position: { x: 250, y: 400 },
    data: { label: 'Anna Lee', name: 'Anna Lee', company: 'HR Solutions', role: 'People Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '13',
    position: { x: 950, y: 400 },
    data: { label: 'Tom Garcia', name: 'Tom Garcia', company: 'Operations Inc', role: 'Operations Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '14',
    position: { x: 400, y: 550 },
    data: { label: 'Rachel Green', name: 'Rachel Green', company: 'Media Group', role: 'Content Manager', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '15',
    position: { x: 800, y: 550 },
    data: { label: 'Daniel White', name: 'Daniel White', company: 'Tech Innovations', role: 'Research Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Review contacts (orange)
  {
    id: '16',
    position: { x: 150, y: 300 },
    data: { label: 'Mark Johnson', name: 'Mark Johnson', company: 'Consulting Pro', role: 'Senior Advisor', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '17',
    position: { x: 1050, y: 300 },
    data: { label: 'Maria Lopez', name: 'Maria Lopez', company: 'Strategy Group', role: 'Principal', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '18',
    position: { x: 350, y: 50 },
    data: { label: 'Chris Taylor', name: 'Chris Taylor', company: 'Tech Advisors', role: 'Mentor', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '19',
    position: { x: 850, y: 50 },
    data: { label: 'Laura Miller', name: 'Laura Miller', company: 'Industry Leaders', role: 'Executive', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '20',
    position: { x: 300, y: 600 },
    data: { label: 'Steve Anderson', name: 'Steve Anderson', company: 'Business Dev', role: 'Partner', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '21',
    position: { x: 900, y: 600 },
    data: { label: 'Nicole Davis', name: 'Nicole Davis', company: 'Growth Partners', role: 'VP Business', category: 'review' },
    style: { background: '#F57C00', color: 'white', border: '2px solid #E65100', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  // Additional contacts
  {
    id: '22',
    position: { x: 550, y: 50 },
    data: { label: 'Paul Wilson', name: 'Paul Wilson', company: 'StartupHub', role: 'Investor', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '23',
    position: { x: 650, y: 50 },
    data: { label: 'Helen Zhang', name: 'Helen Zhang', company: 'AI Ventures', role: 'Partner', category: 'business' },
    style: { background: '#FFB300', color: 'white', border: '2px solid #FF8F00', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
  {
    id: '24',
    position: { x: 600, y: 600 },
    data: { label: 'Alex Turner', name: 'Alex Turner', company: 'Digital Agency', role: 'Creative Lead', category: 'category' },
    style: { background: '#1976D2', color: 'white', border: '2px solid #0D47A1', borderRadius: '50%', width: 60, height: 60, fontSize: '10px' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'straight' },
  { id: 'e1-3', source: '1', target: '3', type: 'straight' },
  { id: 'e1-4', source: '1', target: '4', type: 'straight' },
  { id: 'e1-5', source: '1', target: '5', type: 'straight' },
  { id: 'e1-6', source: '1', target: '6', type: 'straight' },
  { id: 'e1-7', source: '1', target: '7', type: 'straight' },
  { id: 'e1-8', source: '1', target: '8', type: 'straight' },
  { id: 'e1-9', source: '1', target: '9', type: 'straight' },
  { id: 'e1-10', source: '1', target: '10', type: 'straight' },
  { id: 'e1-11', source: '1', target: '11', type: 'straight' },
  { id: 'e1-12', source: '1', target: '12', type: 'straight' },
  { id: 'e1-13', source: '1', target: '13', type: 'straight' },
  { id: 'e1-14', source: '1', target: '14', type: 'straight' },
  { id: 'e1-15', source: '1', target: '15', type: 'straight' },
  { id: 'e1-16', source: '1', target: '16', type: 'straight' },
  { id: 'e1-17', source: '1', target: '17', type: 'straight' },
  { id: 'e1-18', source: '1', target: '18', type: 'straight' },
  { id: 'e1-19', source: '1', target: '19', type: 'straight' },
  { id: 'e1-20', source: '1', target: '20', type: 'straight' },
  { id: 'e1-21', source: '1', target: '21', type: 'straight' },
  { id: 'e1-22', source: '1', target: '22', type: 'straight' },
  { id: 'e1-23', source: '1', target: '23', type: 'straight' },
  { id: 'e1-24', source: '1', target: '24', type: 'straight' },
  // Some interconnections
  { id: 'e2-3', source: '2', target: '3', type: 'straight' },
  { id: 'e4-6', source: '4', target: '6', type: 'straight' },
  { id: 'e5-7', source: '5', target: '7', type: 'straight' },
];

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

  const categories = [
    { name: 'All', count: nodes.length, color: '#0077B5', icon: '📊' },
    { name: 'Business', count: nodes.filter(n => n.data.category === 'business').length, color: '#FFB300', icon: '🏢' },
    { name: 'Category', count: nodes.filter(n => n.data.category === 'category').length, color: '#1976D2', icon: '📋' },
    { name: 'Review', count: nodes.filter(n => n.data.category === 'review').length, color: '#F57C00', icon: '📝' },
    { name: 'User', count: 1, color: '#7B1FA2', icon: '👤' },
  ];

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold text-gray-900">Network View</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            size="sm" 
            className="bg-[#0077B5] hover:bg-[#005885] text-white"
            onClick={() => setIsAddContactOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
          <Button size="sm" variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

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

        {/* Right Sidebar - Categories */}
        <div className="absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Nodes</h3>
            <div className="text-sm text-gray-500">Relationships</div>
          </div>
          
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Filter categories</span>
              <div className="flex gap-1">
                <label className="flex items-center gap-1">
                  <input type="radio" name="filter" defaultChecked className="w-3 h-3" />
                  <span className="text-xs">All</span>
                </label>
                <label className="flex items-center gap-1 ml-2">
                  <input type="radio" name="filter" className="w-3 h-3" />
                  <span className="text-xs">In Scene</span>
                </label>
                <label className="flex items-center gap-1 ml-2">
                  <input type="radio" name="filter" className="w-3 h-3" />
                  <span className="text-xs">Off Scene</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Search Bar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 min-w-96">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <Input
              placeholder="Search contacts by name or company..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 bg-transparent flex-1"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="p-1"
              onClick={() => handleSearch('')}
            >
              ✕
            </Button>
          </div>
        </div>

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
