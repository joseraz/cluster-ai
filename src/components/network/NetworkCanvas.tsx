import { useRef, useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  ReactFlowProvider,
  NodeTypes,
  NodeChange,
  useEdgesState,
  useViewport,
} from '@xyflow/react';
import { useNodePositions } from '@/hooks/useNodePositions';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/contexts/ContactsContext';
import UserNode from './UserNode';
import ContactNode from './ContactNode';
import { ZoomControls } from './ZoomControls';
import { FiltersPanel } from './FiltersPanel';

const nodeTypes: NodeTypes = {
  userNode: UserNode,
  contactNode: ContactNode,
};

const CANVAS_BG = '#1A1816'; /* obsidian */
const RADIUS = 290;

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Converts screen center → flow coordinates given current viewport
function screenCenterToFlow(
  container: HTMLDivElement,
  vx: number,
  vy: number,
  zoom: number
) {
  const { width, height } = container.getBoundingClientRect();
  return {
    x: (width / 2 - vx) / zoom,
    y: (height / 2 - vy) / zoom,
  };
}

interface NetworkCanvasInnerProps {
  onCreateContact?: () => void;
}

function NetworkCanvasInner({ onCreateContact }: NetworkCanvasInnerProps) {
  const { contacts } = useContacts();
  const { nodePositions, saveNodePosition } = useNodePositions();
  const [filters, setFilters] = useState({ location: 'all', connectionType: 'all' });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track viewport so we can recompute user node position
  const { x: vpX, y: vpY, zoom } = useViewport();

  const userCenter = useMemo(() => {
    if (!containerRef.current) return { x: 460, y: 340 };
    return screenCenterToFlow(containerRef.current, vpX, vpY, zoom);
  }, [vpX, vpY, zoom]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      if (filters.location !== 'all' && c.livesIn !== filters.location) return false;
      if (filters.connectionType !== 'all' && c.connectionType !== filters.connectionType) return false;
      return true;
    });
  }, [contacts, filters]);

  const nodes: Node[] = useMemo(() => {
    const userNode: Node = {
      id: 'user',
      type: 'userNode',
      // offset by half node size (80/2=40) so it's truly centered
      position: { x: userCenter.x - 40, y: userCenter.y - 40 },
      data: { name: 'Raz', profileImage: undefined },
      draggable: false,
      selectable: false,
    };

    const total = filteredContacts.length;
    const contactNodes: Node[] = filteredContacts.map((contact, i) => {
      const angle = (2 * Math.PI * i) / total - Math.PI / 2;
      return {
        id: contact.id,
        type: 'contactNode',
        position: nodePositions[contact.id] ?? {
          x: userCenter.x + RADIUS * Math.cos(angle) - 26,
          y: userCenter.y + RADIUS * Math.sin(angle) - 26,
        },
        data: {
          initials: getInitials(contact.firstName, contact.lastName),
          fullName: `${contact.firstName} ${contact.lastName}`,
        },
      };
    });

    return [userNode, ...contactNodes];
  }, [userCenter, filteredContacts, nodePositions]);

  const edges: Edge[] = useMemo(() =>
    filteredContacts.map(contact => ({
      id: `e-user-${contact.id}`,
      source: 'user',
      target: contact.id,
      type: 'straight',
      style: { stroke: 'rgba(201,169,110,0.22)', strokeWidth: 1 },
    })),
  [filteredContacts]);

  const onNodesChange = useCallback((_changes: NodeChange[]) => {}, []);

  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (node.id === 'user') return;
      saveNodePosition(node.id, node.position);
    },
    [saveNodePosition]
  );
  const [, , onEdgesChange] = useEdgesState([]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        style={{ background: CANVAS_BG }}
        onNodeDragStop={handleNodeDragStop}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll={false}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        <ZoomControls />
      </ReactFlow>

      <Button
        onClick={onCreateContact}
        className="absolute top-6 right-6 z-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-9 text-sm font-medium shadow-lg flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create contact
      </Button>

      <FiltersPanel filters={filters} onFiltersChange={setFilters} />
    </div>
  );
}

interface NetworkCanvasProps {
  onCreateContact?: () => void;
}

export function NetworkCanvas({ onCreateContact }: NetworkCanvasProps) {
  return (
    <ReactFlowProvider>
      <NetworkCanvasInner onCreateContact={onCreateContact} />
    </ReactFlowProvider>
  );
}
