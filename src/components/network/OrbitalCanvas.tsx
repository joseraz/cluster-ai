/**
 * OrbitalCanvas — atom-style SVG canvas with voice-activated search.
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
 *   - Voice search: nodes dissolve/reassemble with animated list transition.
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
import { SearchResultCard } from './SearchResultCard';
import type { SearchResult } from '@/lib/contactSearch';

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
  { level: 0, icon: <Pause         className="w-3 h-3" />, label: 'Stopped' },
  { level: 1, icon: <ChevronRight  className="w-3 h-3" />, label: 'Slow'    },
  { level: 2, icon: <ChevronsRight className="w-3 h-3" />, label: 'Medium'  },
  { level: 3, icon: <FastForward   className="w-3 h-3" />, label: 'Fast'    },
];

/* ─── misc constants ──────────────────────────────────────────────────────── */

const USER_R         = 40;
const CONTACT_R      = 26;
const EDGE_STROKE    = 2.5;
const TOOLTIP_W      = 220;
const EDGE_TOOLTIP_W = 260;
const TOOLTIP_OFFSET = 18;

/* ─── search animation constants ─────────────────────────────────────────── */

const LERP_POS          = 0.10;  // position lerp factor per frame (~60fps)
const LERP_FADE         = 0.09;  // opacity / scale lerp factor per frame
const CARD_ARRIVE_DIST  = 14;    // px from target that triggers card fade-in
const MAX_LIST_RESULTS  = 9;     // maximum cards displayed (3 cols × 3 rows)

// Grid layout constants for search result cards
const CARD_W        = 340;  // matches SearchResultCard fixed width
const CARD_H_APPROX = 180;  // approx card height used for vertical spacing
const GAP_X         = 24;   // horizontal gap between grid columns
const GAP_Y         = 20;   // vertical gap between grid rows

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

type AnimPhase = 'orbital' | 'dissolving' | 'listing' | 'reassembling';

interface NodeAnim {
  id:                  string;
  x:                   number;
  y:                   number;
  opacity:             number;
  scale:               number;
  targetX:             number;
  targetY:             number;
  targetOpacity:       number;
  targetScale:         number;
  visible:             boolean;
  isResult:            boolean;
  cardOpacity:         number;
  targetCardOpacity:   number;
  startDelayMs:        number;
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/* ─── component ───────────────────────────────────────────────────────────── */

interface OrbitalCanvasProps {
  onCreateContact?: () => void;
  searchResults?: SearchResult[] | null;
  queryTokens?: string[];
}

export function OrbitalCanvas({
  onCreateContact,
  searchResults = null,
  queryTokens   = [],
}: OrbitalCanvasProps) {
  const { contacts } = useContacts();
  const { nodePositions, saveNodePosition, clearNodePositions } = useNodePositions();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /** Gold in dark mode, warm tan in light mode. */
  const ac = (opacity: number) =>
    isDark ? `rgba(201,169,110,${opacity})` : `rgba(184,166,118,${opacity})`;

  /* ── existing refs ──────────────────────────────────────────────────────── */
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
  const spinLevelRef      = useRef<SpinLevel>(1);
  const isHoveredRef      = useRef(false);
  const isOverlayHovered  = useRef(false);
  const nodeLeaveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── search animation refs ──────────────────────────────────────────────── */
  const animPhaseRef       = useRef<AnimPhase>('orbital');
  const nodeAnimRef        = useRef<Map<string, NodeAnim>>(new Map());
  const phaseStartRef      = useRef<number>(0);
  const savedSpinRef       = useRef<SpinLevel>(1);
  const orbitRingsOpRef    = useRef<number>(1);   // fades to 0 during search
  const dissolveTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reassembleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── state ──────────────────────────────────────────────────────────────── */
  const [svgSize,         setSvgSize]        = useState({ w: 900, h: 600 });
  const [,                setFrame]          = useState(0);
  const [isPanning,       setIsPanning]      = useState(false);
  const [showResetModal,  setShowResetModal] = useState(false);
  const [filters,         setFilters]        = useState({ location: 'all', connectionType: 'all' });
  const [spinLevel,       setSpinLevel]      = useState<SpinLevel>(1);
  const [animPhase,       setAnimPhase]      = useState<AnimPhase>('orbital');

  // Hover tooltip state
  const [hoveredNodeId,     setHoveredNodeId]     = useState<string | null>(null);
  const [hoveredEdgeNodeId, setHoveredEdgeNodeId] = useState<string | null>(null);
  const [tooltipPos,        setTooltipPos]        = useState({ x: 0, y: 0 });

  /* keep spin ref in sync ─────────────────────────────────────────────────── */
  useEffect(() => { spinLevelRef.current = spinLevel; }, [spinLevel]);

  /* sync persisted positions into fast refs ──────────────────────────────── */
  useEffect(() => {
    pinnedAngles.current = {};
    pinnedRings.current  = {};
    for (const [id, val] of Object.entries(nodePositions)) {
      if (typeof val.angle === 'number') pinnedAngles.current[id] = val.angle;
      if (typeof val.ring  === 'number') pinnedRings.current[id]  = val.ring;
    }
  }, [nodePositions]);

  /* track container size ─────────────────────────────────────────────────── */
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

  /* contact lookup map ───────────────────────────────────────────────────── */
  const contactMap = useMemo(
    () => new Map(contacts.map(c => [c.id, c])),
    [contacts],
  );

  /* ── allOrbitalNodes: full set (unfiltered) used for search animation ──── */
  const allOrbitalNodes = useMemo<OrbitalNode[]>(() => {
    const total = contacts.length;
    return contacts.map((c, i) => ({
      id:                c.id,
      label:             getInitials(c.firstName, c.lastName),
      fullName:          `${c.firstName} ${c.lastName}`,
      baseAngle:         (2 * Math.PI * i) / total - Math.PI / 2,
      connectionStrength: c.connectionStrength,
    }));
  }, [contacts]);

  /* filters ──────────────────────────────────────────────────────────────── */
  const visibleContacts = useMemo(() => contacts.filter(c => {
    if (filters.location       !== 'all' && c.livesIn        !== filters.location)      return false;
    if (filters.connectionType !== 'all' && c.connectionType !== filters.connectionType) return false;
    return true;
  }), [contacts, filters]);

  /* orbital nodes (filtered — used for normal orbital rendering) ─────────── */
  const orbitalNodes = useMemo<OrbitalNode[]>(() => {
    const total = visibleContacts.length;
    return visibleContacts.map((c, i) => ({
      id:                c.id,
      label:             getInitials(c.firstName, c.lastName),
      fullName:          `${c.firstName} ${c.lastName}`,
      baseAngle:         (2 * Math.PI * i) / total - Math.PI / 2,
      connectionStrength: c.connectionStrength,
    }));
  }, [visibleContacts]);

  /* ── position helpers ───────────────────────────────────────────────────── */
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

  /** Gets the current rendered orbital position for any node (uses live refs). */
  function getCurrentOrbitalPos(node: OrbitalNode): { x: number; y: number } {
    const angle  = getNodeAngle(node);
    const radius = getNodeRadius(node.id, node.connectionStrength);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  /* ─── tooltip positioning helper ─────────────────────────────────────────── */
  function clampedTooltipPos(rawX: number, rawY: number, cardWidth: number) {
    const margin = 8;
    const cardHeight = 120;
    let left = rawX + TOOLTIP_OFFSET;
    let top  = rawY - 50;
    if (left + cardWidth > svgSize.w - margin) left = rawX - cardWidth - TOOLTIP_OFFSET;
    if (top < margin) top = rawY + TOOLTIP_OFFSET;
    if (top + cardHeight > svgSize.h - margin) top = svgSize.h - cardHeight - margin;
    return { left, top };
  }

  /* ─── search animation phase functions ─────────────────────────────────── */

  function startDissolvePhase(results: SearchResult[]) {
    if (dissolveTimerRef.current)   clearTimeout(dissolveTimerRef.current);
    if (reassembleTimerRef.current) clearTimeout(reassembleTimerRef.current);

    const resultIds           = new Set(results.map(r => r.contact.id));
    const currentlyVisibleIds = new Set(orbitalNodes.map(n => n.id));
    const localCx = svgSize.w / 2 + panOffset.current.x;
    const localCy = svgSize.h / 2 + panOffset.current.y;

    // Pause spin and save current level
    savedSpinRef.current  = spinLevel;
    setSpinLevel(0);
    spinLevelRef.current = 0;

    // Build animation map for every contact
    const newMap = new Map<string, NodeAnim>();
    allOrbitalNodes.forEach((node, i) => {
      const isVisible = currentlyVisibleIds.has(node.id);
      const isResult  = resultIds.has(node.id);
      const pos       = isVisible ? getCurrentOrbitalPos(node) : { x: localCx, y: localCy };

      newMap.set(node.id, {
        id:                node.id,
        x:                 pos.x,
        y:                 pos.y,
        opacity:           isVisible ? 1 : 0,
        scale:             1,
        targetX:           pos.x,         // hold in place during dissolve
        targetY:           pos.y,
        targetOpacity:     isResult ? (isVisible ? 1 : 0) : 0,
        targetScale:       isResult ? 1 : 0.70,
        visible:           isVisible || isResult,
        isResult,
        cardOpacity:       0,
        targetCardOpacity: 0,
        // Stagger non-result fade-outs (max 440ms total)
        startDelayMs:      isResult ? 0 : Math.min(i * 22, 440),
      });
    });

    nodeAnimRef.current  = newMap;
    phaseStartRef.current = performance.now();
    animPhaseRef.current  = 'dissolving';
    setAnimPhase('dissolving');
    orbitRingsOpRef.current = 1;

    // Transition to listing once non-results have dissolved
    dissolveTimerRef.current = setTimeout(() => {
      initListingPhase(results, localCx, localCy);
    }, 700);
  }

  function initListingPhase(results: SearchResult[], localCx: number, localCy: number) {
    // Cap at MAX_LIST_RESULTS most-relevant results
    const displayResults = results.slice(0, MAX_LIST_RESULTS);
    const n    = displayResults.length;
    const cols = n >= 5 ? 3 : n >= 2 ? 2 : 1;
    const rows = Math.ceil(n / cols);

    const gridW  = cols * CARD_W + (cols - 1) * GAP_X;
    const gridH  = rows * CARD_H_APPROX + (rows - 1) * GAP_Y;
    const startX = localCx - gridW  / 2 + CARD_W        / 2;
    const startY = localCy - gridH  / 2 + CARD_H_APPROX / 2;

    displayResults.forEach((r, i) => {
      const anim = nodeAnimRef.current.get(r.contact.id);
      if (!anim) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      anim.targetX       = startX + col * (CARD_W + GAP_X);
      anim.targetY       = startY + row * (CARD_H_APPROX + GAP_Y);
      anim.targetOpacity = 1;
      anim.targetScale   = 1;
      anim.visible       = true;
      if (anim.opacity < 0.05) anim.opacity = 0.05; // ensure visible enough to lerp
      anim.startDelayMs  = row * 80 + col * 30; // cascade: top-left → bottom-right
    });

    // Hide results beyond MAX_LIST_RESULTS (they stay invisible)
    results.slice(MAX_LIST_RESULTS).forEach(r => {
      const anim = nodeAnimRef.current.get(r.contact.id);
      if (anim) { anim.targetOpacity = 0; anim.visible = false; }
    });

    phaseStartRef.current = performance.now();
    animPhaseRef.current  = 'listing';
    setAnimPhase('listing');
  }

  function startReassemblePhase() {
    if (dissolveTimerRef.current)   clearTimeout(dissolveTimerRef.current);
    if (reassembleTimerRef.current) clearTimeout(reassembleTimerRef.current);

    allOrbitalNodes.forEach((node, i) => {
      const anim = nodeAnimRef.current.get(node.id);
      if (!anim) return;

      const pos = getCurrentOrbitalPos(node);

      if (anim.isResult) {
        // Cards fade out; SVG circle appears and flies back to orbital
        anim.targetCardOpacity = 0;
        // Ensure circle has some opacity to animate from
        if (anim.opacity < 0.05) anim.opacity = 0.05;
        anim.visible       = true;
        anim.targetX       = pos.x;
        anim.targetY       = pos.y;
        anim.targetOpacity = 1;
        anim.targetScale   = 1;
        anim.startDelayMs  = i * 40;
      } else {
        // Non-result nodes fade back in at their orbital positions
        anim.visible       = true;
        anim.opacity       = 0;
        anim.x             = pos.x;
        anim.y             = pos.y;
        anim.targetX       = pos.x;
        anim.targetY       = pos.y;
        anim.targetOpacity = 1;
        anim.targetScale   = 1;
        anim.startDelayMs  = 280 + i * 15; // after result nodes start moving
      }
    });

    phaseStartRef.current   = performance.now();
    animPhaseRef.current    = 'reassembling';
    setAnimPhase('reassembling');
    orbitRingsOpRef.current = 0;

    // Return to fully orbital after animation completes
    reassembleTimerRef.current = setTimeout(() => {
      nodeAnimRef.current.clear();
      animPhaseRef.current    = 'orbital';
      setAnimPhase('orbital');
      orbitRingsOpRef.current = 1;
      setSpinLevel(savedSpinRef.current);
      spinLevelRef.current = savedSpinRef.current;
    }, 1350);
  }

  /* ─── respond to searchResults prop changes ─────────────────────────────── */
  useEffect(() => {
    if (searchResults !== null && animPhaseRef.current === 'orbital') {
      startDissolvePhase(searchResults);
    } else if (searchResults === null && animPhaseRef.current !== 'orbital') {
      startReassemblePhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults]);

  /* cleanup phase timers on unmount ────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (dissolveTimerRef.current)   clearTimeout(dissolveTimerRef.current);
      if (reassembleTimerRef.current) clearTimeout(reassembleTimerRef.current);
    };
  }, []);

  /* ─── rAF animation loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    function tick(ts: number) {
      if (lastTs.current !== null) {
        const dt = ts - lastTs.current;

        // ── Orbital spin ──
        if (animPhaseRef.current === 'orbital' && !isHoveredRef.current) {
          globalOffset.current += SPIN_SPEEDS[spinLevelRef.current] * dt;
        }

        // ── Search animation lerp ──
        if (animPhaseRef.current !== 'orbital') {
          const elapsed = ts - phaseStartRef.current;

          for (const [, anim] of nodeAnimRef.current) {
            if (!anim.visible) continue;
            if (elapsed < anim.startDelayMs) continue;

            anim.x    = anim.x + (anim.targetX - anim.x) * LERP_POS;
            anim.y    = anim.y + (anim.targetY - anim.y) * LERP_POS;
            anim.opacity     = anim.opacity     + (anim.targetOpacity     - anim.opacity)     * LERP_FADE;
            anim.scale       = anim.scale       + (anim.targetScale       - anim.scale)       * LERP_FADE;
            anim.cardOpacity = anim.cardOpacity + (anim.targetCardOpacity - anim.cardOpacity) * LERP_FADE;

            // Hide fully faded non-result nodes
            if (!anim.isResult && anim.targetOpacity === 0 && anim.opacity < 0.025) {
              anim.opacity = 0;
              anim.visible = false;
            }

            // Trigger card fade-in when result node arrives at list position
            if (
              animPhaseRef.current === 'listing' &&
              anim.isResult &&
              anim.targetCardOpacity === 0
            ) {
              const dx = anim.x - anim.targetX;
              const dy = anim.y - anim.targetY;
              if (dx * dx + dy * dy < CARD_ARRIVE_DIST * CARD_ARRIVE_DIST) {
                anim.targetCardOpacity = 1;
                anim.targetOpacity     = 0; // SVG circle fades as card appears
              }
            }
          }

          // Fade orbit rings in/out during transitions
          if (animPhaseRef.current === 'dissolving' || animPhaseRef.current === 'reassembling') {
            const target = animPhaseRef.current === 'dissolving' ? 0 : 1;
            orbitRingsOpRef.current += (target - orbitRingsOpRef.current) * 0.055;
          }
        }
      }
      lastTs.current = ts;
      setFrame(f => f + 1);
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); };
  }, []);

  /* ─── node hover ─────────────────────────────────────────────────────────── */
  const handleNodeMouseEnter = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (dragState.current.active || animPhaseRef.current !== 'orbital') return;
    const rect          = (e.currentTarget as SVGGElement).getBoundingClientRect();
    const containerRect = containerRef.current!.getBoundingClientRect();
    const x = rect.left + rect.width  / 2 - containerRect.left;
    const y = rect.top  + rect.height / 2 - containerRect.top;
    isHoveredRef.current = true;
    setHoveredEdgeNodeId(null);
    setHoveredNodeId(nodeId);
    setTooltipPos({ x, y });
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    // Delay so onMouseEnter on the overlay card can fire first and set isOverlayHovered
    if (nodeLeaveTimer.current) clearTimeout(nodeLeaveTimer.current);
    nodeLeaveTimer.current = setTimeout(() => {
      if (!isOverlayHovered.current) {
        setHoveredNodeId(null);
        isHoveredRef.current = false;
      }
    }, 40);
  }, []);

  /* ─── edge hover ─────────────────────────────────────────────────────────── */
  const handleEdgeMouseEnter = useCallback((
    e: React.MouseEvent,
    nodeId: string,
    nodeX: number,
    nodeY: number,
  ) => {
    if (dragState.current.active || animPhaseRef.current !== 'orbital') return;
    if (hoveredNodeId) return;
    const containerRect = containerRef.current!.getBoundingClientRect();
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
    if (animPhaseRef.current !== 'orbital') return;
    e.stopPropagation();
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
    if (animPhaseRef.current !== 'orbital') return;
    const tag = (e.target as Element).tagName.toLowerCase();
    if (tag !== 'svg' && tag !== 'rect') return;

    panState.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      originX: panOffset.current.x, originY: panOffset.current.y,
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

  const showTooltip  = !!(tooltipContact && animPhase === 'orbital');
  const isEdgeTooltip = !!hoveredEdgeNodeId && !hoveredNodeId;

  const nodeCardPos = clampedTooltipPos(tooltipPos.x, tooltipPos.y, TOOLTIP_W);
  const edgeCardPos = clampedTooltipPos(tooltipPos.x, tooltipPos.y, EDGE_TOOLTIP_W);
  const cardPos     = isEdgeTooltip ? edgeCardPos : nodeCardPos;
  const cardWidth   = isEdgeTooltip ? EDGE_TOOLTIP_W : TOOLTIP_W;

  /* ─── derived ───────────────────────────────────────────────────────────── */
  const isSearchMode    = animPhase !== 'orbital';
  const ringsOpacity    = animPhase === 'orbital' ? 1 : orbitRingsOpRef.current;
  // Clamp results to MAX_LIST_RESULTS for the card overlay
  const displayResults  = (searchResults ?? []).slice(0, MAX_LIST_RESULTS);
  const hiddenResultCount = Math.max(0, (searchResults?.length ?? 0) - MAX_LIST_RESULTS);

  /* ─── render ─────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ background: 'hsl(var(--canvas-bg))' }}
    >
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
          const baseOpacity = 0.38 - i * 0.05;
          const strokeW     = i === 0 ? 1.5 : 1;
          const dashGap     = 4 + i * 2;
          return (
            <circle
              key={`ring-${i}`}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={ac(baseOpacity * ringsOpacity)}
              strokeWidth={strokeW}
              strokeDasharray={`3 ${dashGap}`}
              pointerEvents="none"
            />
          );
        })}

        {/* ── ORBITAL PHASE: edges ── */}
        {!isSearchMode && orbitalNodes.map(node => {
          const isDragging    = dragState.current.active && dragState.current.nodeId === node.id;
          const pos           = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle, dragState.current.liveRing ?? undefined)
            : orbitalPos(node);
          const isEdgeHovered = hoveredEdgeNodeId === node.id;
          return (
            <g key={`edge-group-${node.id}`}>
              <line
                x1={cx} y1={cy} x2={pos.x} y2={pos.y}
                stroke={isEdgeHovered ? ac(0.55) : ac(0.28)}
                strokeWidth={isEdgeHovered ? 3 : EDGE_STROKE}
                strokeLinecap="round"
                pointerEvents="none"
              />
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

        {/* ── ORBITAL PHASE: contact nodes ── */}
        {!isSearchMode && orbitalNodes.map(node => {
          const isDragging = dragState.current.active && dragState.current.nodeId === node.id;
          const pos        = isDragging && dragState.current.liveAngle !== null
            ? orbitalPos(node, dragState.current.liveAngle, dragState.current.liveRing ?? undefined)
            : orbitalPos(node);
          const ringIdx    = isDragging && dragState.current.liveRing !== null
            ? dragState.current.liveRing
            : getNodeRingIndex(node.id, node.connectionStrength);
          const isPinned   = pinnedAngles.current[node.id] !== undefined;
          const isHovered  = hoveredNodeId === node.id;
          const ringGlow   = ac(0.06 + (NUM_RINGS - 1 - ringIdx) * 0.05);

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseDown={e => handleNodeMouseDown(e, node.id)}
              onMouseEnter={e => handleNodeMouseEnter(e, node.id)}
              onMouseLeave={handleNodeMouseLeave}
              style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
            >
              <circle r={CONTACT_R + 6} fill={ringGlow} pointerEvents="none" />
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

        {/* ── SEARCH ANIMATION PHASE: lerp-animated node circles ── */}
        {isSearchMode && [...nodeAnimRef.current.entries()].map(([id, anim]) => {
          if (!anim.visible || anim.opacity < 0.015) return null;
          const contact  = contactMap.get(id);
          if (!contact) return null;
          const initials = getInitials(contact.firstName, contact.lastName);
          const ringIdx  = getNodeRingIndex(id, contact.connectionStrength);
          const ringGlow = ac(0.06 + (NUM_RINGS - 1 - ringIdx) * 0.05);

          return (
            <g
              key={`anim-${id}`}
              transform={`translate(${anim.x}, ${anim.y}) scale(${anim.scale})`}
              style={{ opacity: anim.opacity }}
              pointerEvents="none"
            >
              <circle r={CONTACT_R + 6} fill={ringGlow} />
              <circle
                r={CONTACT_R}
                fill={isDark ? 'rgba(244,237,228,0.92)' : 'rgba(255,255,255,0.90)'}
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
                style={{ userSelect: 'none' }}
              >
                {initials}
              </text>
            </g>
          );
        })}

        {/* ── user node (nucleus) — always visible ── */}
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

      {/* ── SEARCH RESULT CARDS overlay ────────────────────────────────────── */}
      {isSearchMode && (
        <div
          className="absolute inset-0"
          style={{ pointerEvents: animPhase === 'listing' ? 'auto' : 'none' }}
        >
          {/* Result cards */}
          {displayResults.map(result => {
            const anim = nodeAnimRef.current.get(result.contact.id);
            if (!anim || anim.cardOpacity < 0.01) return null;
            return (
              <div
                key={`card-${result.contact.id}`}
                className="absolute"
                style={{
                  left:          anim.x,
                  top:           anim.y,
                  transform:     'translate(-50%, -50%)',
                  opacity:       anim.cardOpacity,
                  pointerEvents: anim.cardOpacity > 0.5 ? 'auto' : 'none',
                  zIndex:        40,
                }}
              >
                <SearchResultCard
                  result={result}
                  queryTokens={queryTokens}
                />
              </div>
            );
          })}

          {/* "X more contacts matched" note */}
          {hiddenResultCount > 0 && animPhase === 'listing' && (
            <div
              className="absolute"
              style={{
                left:          '50%',
                transform:     'translateX(-50%)',
                bottom:        20,
                zIndex:        40,
                pointerEvents: 'none',
              }}
            >
              <p
                className="text-xs"
                style={{ color: 'rgba(199,184,163,0.45)', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                + {hiddenResultCount} more contact{hiddenResultCount > 1 ? 's' : ''} matched
              </p>
            </div>
          )}

          {/* Empty state */}
          {searchResults !== null && searchResults.length === 0 && animPhase === 'listing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p
                className="text-sm"
                style={{ color: 'rgba(199,184,163,0.50)', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                No contacts matched your search
              </p>
              <p
                className="text-xs mt-1.5"
                style={{ color: 'rgba(199,184,163,0.30)', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Try a different query or clear the search
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── toolbar (top-right) ── */}
      <div
        className="absolute top-6 right-6 z-10 flex items-center gap-2"
        style={{
          opacity:       isSearchMode ? 0.25 : 1,
          pointerEvents: isSearchMode ? 'none' : 'auto',
          transition:    'opacity 400ms ease',
        }}
      >
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

      {/* ── filters (hidden during search) ── */}
      {!isSearchMode && (
        <FiltersPanel filters={filters} onFiltersChange={setFilters} />
      )}

      {/* ── hover tooltip card ── */}
      {showTooltip && tooltipContact && (
        <div
          className="absolute z-20"
          style={{ left: cardPos.left, top: cardPos.top, width: cardWidth }}
          onMouseEnter={() => {
            isOverlayHovered.current = true;
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isOverlayHovered.current = false;
            isHoveredRef.current = false;
            setHoveredNodeId(null);
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
              <>
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
                {tooltipContact.connectionType && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full mb-2"
                    style={{ border: '1px solid rgba(201,169,110,0.35)', color: '#C9A96E' }}
                  >
                    {CONNECTION_LABELS[tooltipContact.connectionType] ?? tooltipContact.connectionType}
                  </span>
                )}
                {tooltipContact.howWeMet && (
                  <p className="text-xs leading-relaxed" style={{ color: '#C7B8A3', fontStyle: 'italic' }}>
                    "{tooltipContact.howWeMet}"
                  </p>
                )}
              </>
            ) : (
              <>
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
