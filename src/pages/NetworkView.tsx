
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Filter, Users, Building, Calendar, MessageSquare } from "lucide-react";

// Sample network data
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 250 },
    data: { 
      label: 'You',
      name: 'You',
      company: 'Your Company',
      role: 'Your Role',
      category: 'user'
    },
    style: { 
      background: '#0077B5', 
      color: 'white', 
      border: '2px solid #005885',
      borderRadius: '50%',
      width: 80,
      height: 80,
      fontSize: '12px',
      fontWeight: 'bold'
    },
  },
  {
    id: '2',
    position: { x: 450, y: 150 },
    data: { 
      label: 'Sarah Chen',
      name: 'Sarah Chen',
      company: 'TechCorp',
      role: 'Product Manager',
      category: 'colleague',
      lastContact: '2 weeks ago'
    },
    style: { 
      background: '#E3F2FD', 
      border: '1px solid #0077B5',
      borderRadius: '8px',
      padding: '8px'
    },
  },
  {
    id: '3',
    position: { x: 100, y: 400 },
    data: { 
      label: 'Michael Rodriguez',
      name: 'Michael Rodriguez',
      company: 'StartupXYZ',
      role: 'Founder',
      category: 'entrepreneur',
      lastContact: '1 month ago'
    },
    style: { 
      background: '#FFF3E0', 
      border: '1px solid #FF9800',
      borderRadius: '8px',
      padding: '8px'
    },
  },
  {
    id: '4',
    position: { x: 400, y: 400 },
    data: { 
      label: 'Jennifer Kim',
      name: 'Jennifer Kim',
      company: 'Enterprise Inc',
      role: 'Director',
      category: 'executive',
      lastContact: '3 months ago'
    },
    style: { 
      background: '#F3E5F5', 
      border: '1px solid #9C27B0',
      borderRadius: '8px',
      padding: '8px'
    },
  },
  {
    id: '5',
    position: { x: 200, y: 100 },
    data: { 
      label: 'David Thompson',
      name: 'David Thompson',
      company: 'Consulting Co',
      role: 'Senior Consultant',
      category: 'consultant',
      lastContact: '6 months ago'
    },
    style: { 
      background: '#FFEBEE', 
      border: '1px solid #F44336',
      borderRadius: '8px',
      padding: '8px'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', label: 'Colleague' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', label: 'Met at conference' },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', label: 'Former client' },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', label: 'LinkedIn connection' },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', label: 'Industry peers', style: { strokeDasharray: '5,5' } },
];

const NetworkView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const filteredNodes = nodes.filter(node =>
    node.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'All', count: nodes.length - 1, color: '#0077B5' },
    { name: 'Colleagues', count: 1, color: '#0077B5' },
    { name: 'Entrepreneurs', count: 1, color: '#FF9800' },
    { name: 'Executives', count: 1, color: '#9C27B0' },
    { name: 'Consultants', count: 1, color: '#F44336' },
  ];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4 mb-4">
            <SidebarTrigger />
            <h1 className="text-xl font-bold text-gray-900">Network View</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="flex-1 p-4">
          {selectedNode ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{selectedNode.data.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Company</span>
                  </div>
                  <p className="text-sm text-gray-700">{selectedNode.data.company}</p>
                  <p className="text-sm text-gray-500">{selectedNode.data.role}</p>
                </div>
                
                {selectedNode.data.lastContact && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Last Contact</span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedNode.data.lastContact}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button size="sm" className="w-full bg-[#0077B5] hover:bg-[#005885]">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Click on a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Network View */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={searchTerm ? filteredNodes : nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <MiniMap 
            nodeColor={(node) => {
              if (node.data.category === 'user') return '#0077B5';
              if (node.data.category === 'colleague') return '#0077B5';
              if (node.data.category === 'entrepreneur') return '#FF9800';
              if (node.data.category === 'executive') return '#9C27B0';
              if (node.data.category === 'consultant') return '#F44336';
              return '#94A3B8';
            }}
            style={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0'
            }}
          />
          <Controls 
            style={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0'
            }}
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Network Stats Overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-2">Network Stats</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Contacts:</span>
              <span className="font-medium">{nodes.length - 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium">{edges.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clusters:</span>
              <span className="font-medium">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;
