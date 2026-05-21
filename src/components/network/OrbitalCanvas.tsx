/**
 * OrbitalCanvas — atom-style SVG canvas.
 *
 * Behaviour:
 *   - Five concentric orbit rings. Nodes default to the outermost ring.
 *   - Dragging a node snaps it (live) to whichever ring the cursor is
 *     nearest to; the snapped ring + angle are persisted.
 *   - Dragging on empty canvas pans all nodes together.
 *   - Spin speed control: 4 levels (off → slow → medium → fast).
 *   - Reset button → confirmation modal → clears all positions.
 *   - Edges are pure SVG <line> elements, centre-to-centre.
 *   - Hover a node → freeze spin + show contact info card.
 *   - Hover an edge → freeze spin + show connection info card.
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useContacts } from '@/contexts/ContactsContext';
import { useNodePositions } from '@/hooks/useNodePositions';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw, Pause, ChevronRight, ChevronsRight, FastForward } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FiltersPanel } from './FiltersPanel';

/* ─── orbital ring system ─────────────────────────────────────────────────── */

/** Radii (px) for the 5 concentric rings, innermost → outermost. */
const ORBITAL_RINGS = [95, 155, 215, 270, 325] as const;
const NUM_RINGS      = ORBITAL_RINGS.length;
/** New contacts without a saved position start here (outermost = lowest trust). */
const DEFAULT_RING   = NUM_RINGS - 1; // index 4

function nearestRingIndex(distFromCenter: number): number {
  let best = 0;
  let bestDist = Math.abs(ORBITAL_RINGS[0] - distFromCenter);
  for (let i = 1; i < NUM_RINGS; i++) {
    const d = Math.abs(ORBITAL_RINGS[i] - distFromCenter);
    if (d < bestDist) { best = i; bestDist = d; }
  }
  return best;
}

/* ─── spin speed levels ───────────────────────────────────────────────────── */

const BASE_SPEED   = 0.000065; // rad/ms at full speed (~97 s per revolution)
const SPIN_SPEEDS  = [0, BASE_SPEED / 3, (BASE_SPEED * 2) / 3, BASE_SPEED] as const;
type SpinLevel = 0 | 1 | 2 | 3;

const SPEED_OPTIONS: { level: SpinLevel; icon: React.ReactNode; label: string }[] = [
  { level: 0, icon: <Pause    className="w-3 h-3" />, label: 'Stopped'  },
  { level: 1, icon: <ChevronRight  className="w-3 h-3" />, label: 'Slow'     },
  { level: 2, icon: <ChevronsRight className="w-3 h-3" />, label: 'Medium'   },
  { level: 3, icon: <FastForward   className="w-3 h-3" />, label: 'Fast'     },
];

/* ─── misc constants ──────────────────────────────────────────────────────── */

const USER_R        = 40;
const CONTACT_R     = 26;
const EDGE_STROKE   = 2.5;
const TOOLTIP_W     = 220;   // px — node card width
const EDGE_TOOLTIP_W = 260;  // px — edge card width
const TOOLTIP_OFFSET = 18;   // px — gap between node edge and card

/* ─── connection type labels ─────────────────────────────────────────────── */

const CONNECTION_LABELS: Record<string, string> = {
  colleague: 'Colleague', friend: 'Friend', mentor: 'Mentor',
  client: 'Client', partner: 'Partner', family: 'Family',
  investor: 'Investor', acquaintance: 'Acquaintance',
};

/* ─── types ───────────────────────────────────────────────────────────────── */

interface OrbitalNode {
  id: string;
  label: string;
  fullName: string;
  baseAngle: number;
  connectionStrength?: number;
}

interface DragState {
  active: boolean;
  nodeId: string | null;
  liveAngle: number | null;
  liveRing: number | null;
}

interface PanState {
  active: boolean;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/* ─── component ───────────────────────────────────────────────────────────── */

interface OrbitalCanvasProps {
  onCreateContact?: () => void;
}

export function OrbitalCanvas({ onCreateContact }: OrbitalCanvasProps) {
  const { contacts } = useContacts();
  const { nodePositions, saveNodePosition, clearNodePositions } = useNodePositions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  /** Gold in dark mode, warm tan (#B8A676) in light mode — keeps opacity consistent. */
  const ac = (opacity: number) =>
    isDark ? `rgba(201,169,110,${opacity})` : `rgba(184,166,118,${opacity})`;

  /* refs ------------------------------------------------------------------- */
  const svgRef       = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const globalOffset = useRef(0);
  const lastTs       = useRef<number | null>(null);
  const panOffset    = useRef({ x: 0, y: 0 });
  const rafId        = useRef<number | null>(null);
  const dragState    = useRef<DragState>({ active: false, nodeId: null, liveAngle: null, liveRing: null });
  const panState     = useRef<PanState>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const pinnedAngles = useRef<Record<string, number>>({});
  const pinnedRings  = useRef<Record<string, number>>({});
  const spinLevelRef = useRef<SpinLevel>(1);
  /** Freeze animation while any hover tooltip is visible. */
  const isHoveredRef = useRef(false);

  /* state ------------------------------------------------------------------ */
  const [svgSize, setSvgSize]           = useState({ w: 900, h: 600 });
  const [, setFrame]                    = useState(0);
  const [isPanning, setIsPanning]       = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [filters, setFilters]           = useState({ location: 'all', connectionType: 'all' });
  const [spinLevel, setSpinLevel]       = useState<SpinLevel>(1);

  // Hover tooltip state
  const [hoveredNodeId,     setHoveredNodeId]     = useState<string | null>(null);
  const [hoveredEdgeNodeId, setHoveredEdgeNodeId] = useState<string | null>(null);
  const [tooltipPos,        setTooltipPos]        = useState({ x: 0, y: 0 });

  /* keep spin ref in sync -------------------------------------------------- */
  useEffect(() => { spinLevelRef.current = spinLevel; }, [spinLevel]);

  /* sync persisted positions into fast refs -------------------------------- */
  useEffect(() => {
    pinnedAngles.current = {};
    pinnedRings.current  = {};
    for (const [id, val] of Object.entries(nodePositions)) {
      if (typeof val.angle === 'number') pinnedAngles.current[id] = val.angle;
      if (typeof val.ring  === 'number') pinnedRings.current[id]  = val.ring;
    }
  }, [nodePositions]);

  /* track container size --------------------------------------------------- */
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

  /* rAF animation loop ----------------------------------------------------- */
  useEffect(() => {
    function tick(ts: number) {
      if (lastTs.current !== null) {
        const dt = ts - lastTs.current;
        // Freeze rotation while any tooltip is showing
        if (!isHoveredRef.current) {
          globalOffset.current += SPIN_SPEEDS[spinLevelRef.current] * dt;
        }
      }
      lastTs.current = ts;
      setFrame(f => f + 1);
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); };
  }, []);

  /* contact lookup map ----------------------------------------------------- */
  const contactMap = useMemo(
    () => new Map(contacts.map(c => [c.id, c])),
    [contacts],
  );

  /* filters ---------------------------------------------------------------- */
  const visibleContacts = useMemo(() => contacts.filter(c => {
    if (filters.location       !== 'all' && c.livesIn        !== filters.location)      return false;
    if (filters.connectionType !== 'all' && c.connectionType !== filters.connectionType) return false;
    return true;
  }), [contacts, filters]);

  /* orbital nodes ---------------------------------------------------------- */
  const orbitalNodes = useMemo<OrbitalNode[]>(() => {
    const total = visibleContacts.length;
    return visibleContacts.map((c, i) => ({
      id:                 c.id,
      label:              getInitials(c.firstName, c.lastName),
      fullName:           `${c.firstName} ${c.lastName}`,
      baseAngle:          (2 * Math.PI * i) / total - Math.PI / 2,
      connectionStrength: c.connectionStrength,
    }));
  }, [visibleContacts]);

  /* position helpers ------------------------------------------------------- */
  const cx = svgSize.w / 2 + panOffset.current.x;
  const cy = svgSize.h / 2 + panOffset.current.y;

  function getNodeAngle(node: OrbitalNode): number {
    const pinned = pinnedAngles.current[node.id];
    return (pinned !== undefined ? pinned : node.baseAngle) + globalOffset.current;
  }

  function getNodeRingIndex(nodeId: string, connectionStrength?: number): number {
    const saved = pinnedRings.current[nodeId];
    if (saved !== undefined) return saved;
    if (connectionStrength !== undefined && connectionStrength >= 1 && connectionStrength <= 5) {
      return NUM_RINGS - connectionStrength;
    }
    return DEFAULT_RING;
  }

  function getNodeRadius(nodeId: string, connectionStrength?: number): number {
    return ORBITAL_RINGS[getNodeRingIndex(nodeId, connectionStrength)];
  }

  function orbitalPos(
    node: OrbitalNode,
    overrideAngle?: number,
    overrideRing?: number,
  ) {
    const angle  = overrideAngle !== undefined ? overrideAngle : getNodeAngle(node);
    const radius = overrideRing  !== undefined
      ? ORBITAL_RINGS[overrideRing]
      : getNodeRadius(node.id, node.connectionStrength);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  /* ─── tooltip positioning helper ─────────────────────────────────────────── */
  function clampedTooltipPos(
    rawX: number,
    rawY: number,
    cardWidth: number,
  ): { left: number; top: number } {
    const margin = 8;
    const cardHeight = 120; // approximate
    let left = rawX + TOOLTIP_OFFSET;
    let top  = rawY - 50;

    // flip left if near right edge
    if (left + cardWidth > svgSize.w - margin) {
      left = rawX - cardWidth - TOOLTIP_OFFSET;
    }
    // flip down if near top edge
    if (top < margin) top = rawY + TOOLTIP_OFFSET;
    // clamp bottom
    if (top + cardHeight > svgSize.h - margin) {
      top = svgSize.h - cardHeight - margin;
    }

    return { left, top };
  }

  /* ─── node hover ─────────────────────────────────────────────────────────── */
  const handleNodeMouseEnter = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (dragState.current.active) return;
    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    const containerRect = containerRef.current!.getBoundingClientRect();
    const x = rect.left + rect.width  / 2 - containerRect.left;
    const y = rect.top  + rect.height / 2 - containerRect.top;
    isHoveredRef.current = true;
    setHoveredEdgeNodeId(null);
    setHoveredNodeId(nodeId);
    setTooltipPos({ x, y });
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    isHoveredRef.current = false;
  }, []);

  /* ─── edge hover ─────────────────────────────────────────────────────────── */
  const handleEdgeMouseEnter = useCallback((
    e: React.MouseEvent,
    nodeId: string,
    nodeX: number,
    nodeY: number,
  ) => {
    if (dragState.current.active) return;
    if (hoveredNodeId) return; // node hover takes priority
    const containerRect = containerRef.current!.getBoundingClientRect();
    // position tooltip at the mouse cursor location
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    isHoveredRef.current = true;
    setHoveredNodeId(null);
    setHoveredEdgeNodeId(nodeId);
    setTooltipPos({ x, y });
    void nodeX; void nodeY;
  }, [hoveredNodeId]);

  const handleEdgeMouseLeave = useCallback(() => {
    setHoveredEdgeNodeId(null);
    isHoveredRef.current = false;
  }, []);

  /* ─── node drag ─────────────────────────────────────────────────────────── */
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    // Clear hover state immediately when drag begins
    setHoveredNodeId(null);
    setHoveredEdgeNodeId(null);
    isHoveredRef.current = false;

    dragState.current = { active: true, nodeId, liveAngle: null, liveRing: null };

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current.active || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ev.clientX - rect.left - (rect.width  / 2 + panOffset.current.x);
      const dy = ev.clientY - rect.top  - (rect.height / 2 + panOffset.current.y);
      dragState.current.liveAngle = Math.atan2(dy, dx);
      dragState.current.liveRing  = nearestRingIndex(Math.sqrt(dx * dx + dy * dy));
    };

    const onUp = (ev: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const dx = ev.clientX - rect.left - (rect.width  / 2 + panOffset.current.x);
      const dy = ev.clientY - rect.top  - (rect.height / 2 + panOffset.current.y);

      const droppedAngle   = Math.atan2(dy, dx);
      const snappedRing    = nearestRingIndex(Math.sqrt(dx * dx + dy * dy));
      const newPinnedAngle = droppedAngle - globalOffset.current;

      saveNodePosition(dragState.current.nodeId!, { angle: newPinnedAngle, ring: snappedRing });
      pinnedAngles.current[dragState.current.nodeId!] = newPinnedAngle;
      pinnedRings.current[dragState.current.nodeId!]  = snappedRing;

      dragState.current = { active: false, nodeId: null, liveAngle: null, liveRing: null };
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [saveNodePosition]);

  /* ─── canvas pan ────────────────────────────────────────────────────────── */
  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const tag = (e.target as Element).tagName.toLowerCase();
    if (tag !== 'svg' && tag !== 'rect') return;

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

  /* ─── reset ─────────────────────────────────────────────────────────────── */
  const confirmReset = useCallback(() => {
    clearNodePositions();
    pinnedAngles.current = {};
    pinnedRings.current  = {};
    panOffset.current    = { x: 0, y: 0 };
    globalOffset.current = 0;
    setShowResetModal(false);
  }, [clearNodePositions]);

  /* ─── tooltip content ───────────────────────────────────────────────────── */
  const tooltipContact = hoveredNodeId
    ? contactMap.get(hoveredNodeId)
    : hoveredEdgeNodeId
    ? contactMap.get(hoveredEdgeNodeId)
    : null;

  const showTooltip = !!(tooltipContact);
  const isEdgeTooltip = !!hoveredEdgeNodeId && !hoveredNodeId;

  const nodeCardPos  = clampedTooltipPos(tooltipPos.x, tooltipPos.y, TOOLTIP_W);
  const edgeCardPos  = clampedTooltipPos(tooltipPos.x, tooltipPos.y, EDGE_TOOLTIP_W);
  const cardPos      = isEdgeTooltip ? edgeCardPos : nodeCardPos;
  const cardWidth    = isEdgeTooltip ? EDGE_TOOLTIP_W : TOOLTIP_W;

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ background: 'hsl(var(--canvas-bg))' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleSvgMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'default', display: 'block' }}
      >
        {/* background hit area */}
        <rect width="100%" height="100%" fill="transparent" />

        {/* ── concentric orbit guide rings ── */}
        {ORBITAL_RINGS.map((r, i) => {
          const opacity = 0.38 - i * 0.05;
          const strokeW = i === 0 ? 1.5 : 1;
          const dashGap = 4 + i * 2;
          return (
            <circle
              key={`ring-${i}`}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={ac(opacity)}
              strokeWidth={strokeW}
              strokeDasharray={`3 ${dashGap}`}
              pointerEvents="none"
            />
          );
        })}

        {/* ── edges: visual line + wide hit-area ── */}
        {orbitalNodes.map(node => {
          const isDragging = dragState.current.active && dragState.current.nodeId === node.id;
          const pos = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle, dragState.current.liveRing ?? undefined)
            : orbitalPos(node);
          const isEdgeHovered = hoveredEdgeNodeId === node.id;
          return (
            <g key={`edge-group-${node.id}`}>
              {/* visible line */}
              <line
                x1={cx} y1={cy} x2={pos.x} y2={pos.y}
                stroke={isEdgeHovered ? ac(0.55) : ac(0.28)}
                strokeWidth={isEdgeHovered ? 3 : EDGE_STROKE}
                strokeLinecap="round"
                pointerEvents="none"
              />
              {/* wide transparent hit-area (only active when not dragging) */}
              {!isDragging && (
                <line
                  x1={cx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke="transparent"
                  strokeWidth={16}
                  strokeLinecap="round"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => handleEdgeMouseEnter(e, node.id, pos.x, pos.y)}
                  onMouseLeave={handleEdgeMouseLeave}
                />
              )}
            </g>
          );
        })}

        {/* ── contact nodes ── */}
        {orbitalNodes.map(node => {
          const isDragging = dragState.current.active && dragState.current.nodeId === node.id;
          const pos = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle, dragState.current.liveRing ?? undefined)
            : orbitalPos(node);
          const ringIdx = isDragging && dragState.current.liveRing !== null
            ? dragState.current.liveRing
            : getNodeRingIndex(node.id, node.connectionStrength);
          const isPinned    = pinnedAngles.current[node.id] !== undefined;
          const isHovered   = hoveredNodeId === node.id;
          const ringGlow    = ac(0.06 + (NUM_RINGS - 1 - ringIdx) * 0.05);

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseDown={e => handleNodeMouseDown(e, node.id)}
              onMouseEnter={e => handleNodeMouseEnter(e, node.id)}
              onMouseLeave={handleNodeMouseLeave}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              {/* ring-level glow */}
              <circle r={CONTACT_R + 6} fill={ringGlow} pointerEvents="none" />
              {/* gold outline when pinned or hovered */}
              {(isPinned || isHovered) && (
                <circle
                  r={CONTACT_R + 3}
                  fill="none"
                  stroke={isHovered ? ac(0.65) : ac(0.35)}
                  strokeWidth={isHovered ? 1.5 : 1}
                  pointerEvents="none"
                />
              )}
              <circle
                r={CONTACT_R}
                fill={isDark
                  ? (isHovered ? 'rgba(250,246,240,1)' : 'rgba(244,237,228,0.92)')
                  : (isHovered ? 'rgba(255,255,255,1)'  : 'rgba(255,255,255,0.90)')}
                style={{ filter: isDark
                  ? 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))'
                  : 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))' }}
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
          <circle r={USER_R + 16} fill={ac(0.04)} />
          <circle r={USER_R + 8}  fill={ac(0.07)} />
          <circle
            r={USER_R}
            fill="none"
            stroke={ac(0.55)}
            strokeWidth={1.5}
            strokeDasharray="4 7"
            style={{
              animation: 'spin-slow 20s linear infinite',
              transformOrigin: 'center',
              transformBox: 'fill-box',
            }}
          />
          <circle r={USER_R - 3} fill={ac(0.12)} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
            fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            fill={isDark ? '#C9A96E' : '#B8A676'}
            style={{ userSelect: 'none' }}
          >
            R
          </text>
        </g>
      </svg>

      {/* ── toolbar (top-right) ── */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
        <div
          className="flex items-center rounded-full border border-white/10 overflow-hidden"
          style={{ background: 'rgba(46,40,35,0.85)' }}
        >
          {SPEED_OPTIONS.map(({ level, icon, label }) => (
            <button
              key={level}
              onClick={() => setSpinLevel(level)}
              title={label}
              className={[
                'flex items-center justify-center w-8 h-8 transition-colors',
                spinLevel === level
                  ? 'text-primary bg-primary/15'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5',
              ].join(' ')}
            >
              {icon}
            </button>
          ))}
        </div>

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

      {/* ── filters ── */}
      <FiltersPanel filters={filters} onFiltersChange={setFilters} />

      {/* ── hover tooltip card ── */}
      {showTooltip && tooltipContact && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: cardPos.left,
            top:  cardPos.top,
            width: cardWidth,
          }}
        >
          <div
            className="rounded-xl border px-4 py-3 shadow-xl"
            style={{
              background:  '#241F1C',
              borderColor: 'rgba(201,169,110,0.2)',
              animation:   'fadeInUp 0.15s ease-out',
            }}
          >
            {isEdgeTooltip ? (
              /* ── Edge tooltip ── */
              <>
                {/* Header: You ↔ Contact */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}
                  >
                    R
                  </span>
                  <span className="text-muted-foreground text-xs">──</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(244,237,228,0.1)', color: '#F4EDE4' }}
                  >
                    {getInitials(tooltipContact.firstName, tooltipContact.lastName)}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {tooltipContact.firstName} {tooltipContact.lastName}
                  </span>
                </div>

                {/* Connection type badge */}
                {tooltipContact.connectionType && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                    style={{
                      border: '1px solid rgba(201,169,110,0.35)',
                      color:  '#C9A96E',
                    }}
                  >
                    {CONNECTION_LABELS[tooltipContact.connectionType] ?? tooltipContact.connectionType}
                  </span>
                )}

                {/* How we met */}
                {tooltipContact.howWeMet && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: '#C7B8A3', fontStyle: 'italic' }}
                  >
                    "{tooltipContact.howWeMet}"
                  </p>
                )}
              </>
            ) : (
              /* ── Node tooltip ── */
              <>
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(201,169,110,0.15)', color: '#C9A96E' }}
                  >
                    {getInitials(tooltipContact.firstName, tooltipContact.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">
                      {tooltipContact.firstName} {tooltipContact.lastName}
                    </p>
                  </div>
                </div>

                {/* Lives in */}
                {tooltipContact.livesIn && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: '#C7B8A3' }} />
                    <span className="text-xs truncate" style={{ color: '#C7B8A3' }}>
                      {tooltipContact.livesIn}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── reset confirmation modal ── */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset node positions?</DialogTitle>
            <DialogDescription>
              This will return all contacts to their default orbital positions
              on the outermost ring. Any custom placements you've made will be
              permanently lost.
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
