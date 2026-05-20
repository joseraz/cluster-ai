/**
 * OrbitalCanvas — atom-style SVG canvas replacing the ReactFlow-based NetworkCanvas.
 *
 * Behaviour:
 *   - All contact nodes slowly orbit the user node like electrons around a nucleus.
 *   - Drag a contact node → it snaps to the orbital ring at the angle under the cursor;
 *     that angle is persisted so the node remembers its position between sessions.
 *   - Drag on empty canvas → pans all nodes together.
 *   - Reset button → confirmation modal → clears all pinned angles, restores even spacing.
 *   - Edges are pure SVG <line> elements from the visual centre of the user node to
 *     the visual centre of each contact node (no ReactFlow handles).
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useContacts } from '@/contexts/ContactsContext';
import { useNodePositions } from '@/hooks/useNodePositions';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FiltersPanel } from './FiltersPanel';

/* ─── constants ──────────────────────────────────────────────────────────── */

const ORBITAL_RADIUS = 290;      // px from centre to contact node centre
const SPIN_SPEED     = 0.000065; // radians / ms ≈ one full orbit in ~97 s
const USER_R         = 40;       // px — radius of the user node
const CONTACT_R      = 26;       // px — radius of a contact node
const EDGE_STROKE    = 2.5;      // px — edge thickness
const EDGE_COLOR     = 'rgba(201,169,110,0.28)';
const CANVAS_BG      = '#1A1816';

/* ─── types ──────────────────────────────────────────────────────────────── */

interface OrbitalNode {
  id: string;
  label: string;
  fullName: string;
  /** Default even-spread angle when no pin is set (set once on mount). */
  baseAngle: number;
  /** User-overridden angle offset (relative to globalOffset=0). */
  pinnedAngle: number | null;
}

interface DragState {
  active: boolean;
  nodeId: string | null;
  liveAngle: number | null; // angle under cursor, updated on mousemove
}

interface PanState {
  active: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

/* ─── helpers ────────────────────────────────────────────────────────────── */

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/* ─── component ──────────────────────────────────────────────────────────── */

interface OrbitalCanvasProps {
  onCreateContact?: () => void;
}

export function OrbitalCanvas({ onCreateContact }: OrbitalCanvasProps) {
  const { contacts } = useContacts();
  const { nodePositions, saveNodePosition, clearNodePositions } = useNodePositions();

  /* refs ------------------------------------------------------------------ */
  const svgRef        = useRef<SVGSVGElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const globalOffset  = useRef(0);
  const lastTs        = useRef<number | null>(null);
  const panOffset     = useRef({ x: 0, y: 0 });
  const rafId         = useRef<number | null>(null);
  const dragState     = useRef<DragState>({ active: false, nodeId: null, liveAngle: null });
  const panState      = useRef<PanState>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  // Store pinned angles separately so the RAF loop always sees fresh values
  const pinnedAngles  = useRef<Record<string, number>>({});

  /* state ----------------------------------------------------------------- */
  const [svgSize, setSvgSize] = useState({ w: 900, h: 600 });
  const [, setFrame] = useState(0); // incremented each rAF tick to force re-render
  const [isPanning, setIsPanning] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [filters, setFilters] = useState({ location: 'all', connectionType: 'all' });

  /* sync persisted angles into the fast ref -------------------------------- */
  useEffect(() => {
    pinnedAngles.current = {};
    for (const [id, val] of Object.entries(nodePositions)) {
      if (typeof val.angle === 'number') {
        pinnedAngles.current[id] = val.angle;
      }
    }
  }, [nodePositions]);

  /* track container size -------------------------------------------------- */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSvgSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    const rect = containerRef.current.getBoundingClientRect();
    setSvgSize({ w: rect.width || 900, h: rect.height || 600 });
    return () => ro.disconnect();
  }, []);

  /* rAF animation loop ---------------------------------------------------- */
  useEffect(() => {
    function tick(ts: number) {
      if (lastTs.current !== null) {
        globalOffset.current += SPIN_SPEED * (ts - lastTs.current);
      }
      lastTs.current = ts;
      setFrame(f => f + 1);
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  /* apply filters --------------------------------------------------------- */
  const visibleContacts = useMemo(() => contacts.filter(c => {
    if (filters.location !== 'all' && c.livesIn !== filters.location) return false;
    if (filters.connectionType !== 'all' && c.connectionType !== filters.connectionType) return false;
    return true;
  }), [contacts, filters]);

  /* derived orbital nodes (only recalculated when visible contacts change) */
  const orbitalNodes = useMemo<OrbitalNode[]>(() => {
    const total = visibleContacts.length;
    return visibleContacts.map((c, i) => ({
      id:          c.id,
      label:       getInitials(c.firstName, c.lastName),
      fullName:    `${c.firstName} ${c.lastName}`,
      baseAngle:   (2 * Math.PI * i) / total - Math.PI / 2,
      pinnedAngle: null, // filled at render time from pinnedAngles ref
    }));
  }, [visibleContacts]);

  /* position helpers (called at render time — always fresh) --------------- */
  const cx = svgSize.w / 2 + panOffset.current.x;
  const cy = svgSize.h / 2 + panOffset.current.y;

  function getNodeAngle(node: OrbitalNode): number {
    const pinned = pinnedAngles.current[node.id];
    return (pinned !== undefined ? pinned : node.baseAngle) + globalOffset.current;
  }

  function orbitalPos(node: OrbitalNode, overrideAngle?: number) {
    const angle = overrideAngle !== undefined ? overrideAngle : getNodeAngle(node);
    return {
      x: cx + ORBITAL_RADIUS * Math.cos(angle),
      y: cy + ORBITAL_RADIUS * Math.sin(angle),
    };
  }

  /* ─── node drag ───────────────────────────────────────────────────────── */
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // don't also start canvas pan

    dragState.current = { active: true, nodeId, liveAngle: null };

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current.active || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const dx   = ev.clientX - rect.left - (rect.width  / 2 + panOffset.current.x);
      const dy   = ev.clientY - rect.top  - (rect.height / 2 + panOffset.current.y);
      dragState.current.liveAngle = Math.atan2(dy, dx);
    };

    const onUp = (ev: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const dx   = ev.clientX - rect.left - (rect.width  / 2 + panOffset.current.x);
      const dy   = ev.clientY - rect.top  - (rect.height / 2 + panOffset.current.y);
      const droppedAngle   = Math.atan2(dy, dx);
      const newPinnedAngle = droppedAngle - globalOffset.current;

      // Persist to hook (triggers nodePositions state update → pinnedAngles ref sync)
      saveNodePosition(dragState.current.nodeId!, { angle: newPinnedAngle });
      // Also update the fast ref immediately so the render sees it right away
      if (dragState.current.nodeId) {
        pinnedAngles.current[dragState.current.nodeId] = newPinnedAngle;
      }

      dragState.current = { active: false, nodeId: null, liveAngle: null };
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [saveNodePosition]);

  /* ─── canvas pan ─────────────────────────────────────────────────────── */
  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan when clicking directly on the SVG background (not a node group)
    const tag = (e.target as Element).tagName.toLowerCase();
    if (tag !== 'svg' && tag !== 'rect') return; // rect = optional bg rect

    panState.current = {
      active:  true,
      startX:  e.clientX,
      startY:  e.clientY,
      originX: panOffset.current.x,
      originY: panOffset.current.y,
    };
    setIsPanning(true);

    const onMove = (ev: MouseEvent) => {
      if (!panState.current.active) return;
      panOffset.current.x = panState.current.originX + (ev.clientX - panState.current.startX);
      panOffset.current.y = panState.current.originY + (ev.clientY - panState.current.startY);
      // rAF loop will re-render; no setState needed here
    };

    const onUp = () => {
      panState.current.active = false;
      setIsPanning(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, []);

  /* ─── reset ──────────────────────────────────────────────────────────── */
  const confirmReset = useCallback(() => {
    clearNodePositions();
    pinnedAngles.current = {};
    panOffset.current    = { x: 0, y: 0 };
    globalOffset.current = 0;
    setShowResetModal(false);
  }, [clearNodePositions]);

  /* ─── render ─────────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ background: CANVAS_BG }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleSvgMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'default', display: 'block' }}
      >
        {/* ── transparent background rect so SVG receives mousedown on empty areas ── */}
        <rect width="100%" height="100%" fill="transparent" />

        {/* ── orbit guide ring (faint circle at ORBITAL_RADIUS) ── */}
        <circle
          cx={cx}
          cy={cy}
          r={ORBITAL_RADIUS}
          fill="none"
          stroke="rgba(201,169,110,0.07)"
          strokeWidth={1}
          pointerEvents="none"
        />

        {/* ── edges (rendered first, behind nodes) ── */}
        {orbitalNodes.map(node => {
          const isDragging = dragState.current.active && dragState.current.nodeId === node.id;
          const pos = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle)
            : orbitalPos(node);
          return (
            <line
              key={`edge-${node.id}`}
              x1={cx}
              y1={cy}
              x2={pos.x}
              y2={pos.y}
              stroke={EDGE_COLOR}
              strokeWidth={EDGE_STROKE}
              strokeLinecap="round"
              pointerEvents="none"
            />
          );
        })}

        {/* ── contact nodes ── */}
        {orbitalNodes.map(node => {
          const isDragging = dragState.current.active && dragState.current.nodeId === node.id;
          const pos = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle)
            : orbitalPos(node);
          const hasPinnedAngle = pinnedAngles.current[node.id] !== undefined;
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseDown={e => handleNodeMouseDown(e, node.id)}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* subtle outer glow when pinned */}
              {hasPinnedAngle && (
                <circle
                  r={CONTACT_R + 5}
                  fill="none"
                  stroke="rgba(201,169,110,0.18)"
                  strokeWidth={1.5}
                  pointerEvents="none"
                />
              )}
              <circle
                r={CONTACT_R}
                fill="rgba(244,237,228,0.92)"
                style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))' }}
              />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                fontFamily="Inter, system-ui, sans-serif"
                fill="#1A1816"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.label}
              </text>
            </g>
          );
        })}

        {/* ── user node (nucleus) ── */}
        <g transform={`translate(${cx}, ${cy})`} style={{ pointerEvents: 'none' }}>
          {/* outer soft halo */}
          <circle r={USER_R + 16} fill="rgba(201,169,110,0.045)" />
          <circle r={USER_R + 8}  fill="rgba(201,169,110,0.07)"  />
          {/* spinning dashed ring */}
          <circle
            r={USER_R}
            fill="none"
            stroke="rgba(201,169,110,0.55)"
            strokeWidth={1.5}
            strokeDasharray="4 7"
            style={{
              animation: 'spin-slow 20s linear infinite',
              transformOrigin: 'center',
              transformBox: 'fill-box',
            }}
          />
          {/* avatar fill */}
          <circle r={USER_R - 3} fill="rgba(201,169,110,0.12)" />
          {/* initials */}
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#C9A96E"
            style={{ userSelect: 'none' }}
          >
            R
          </text>
        </g>
      </svg>

      {/* ── toolbar buttons (top-right) ── */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowResetModal(true)}
          className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 border border-white/10"
          title="Reset node positions"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={onCreateContact}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-9 text-sm font-medium shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create contact
        </Button>
      </div>

      {/* ── filters panel ── */}
      <FiltersPanel filters={filters} onFiltersChange={setFilters} />

      {/* ── reset confirmation modal ── */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset node positions?</DialogTitle>
            <DialogDescription>
              This will return all contacts to their default orbital positions.
              Any custom placements you've made will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReset}>
              Reset positions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
