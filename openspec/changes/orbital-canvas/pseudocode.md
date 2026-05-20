# Orbital Canvas — Pseudocode

> Replaces the XY Flow (ReactFlow) canvas with a pure SVG renderer that
> supports smooth orbital animation, center-to-center edges, canvas pan,
> node dragging with angle-persistence, and a reset-positions flow.

---

## Why drop ReactFlow for this feature

ReactFlow owns the node position state internally. Driving a continuous
animation (rAF loop → update every node's position every frame) means
calling `setNodes` 60 times per second and fighting the library's own
diffing logic. For a bespoke orbital animation, a plain `<svg>` gives
full control at zero overhead. We keep all other code the same
(ContactsContext, useNodePositions hook shape, CreateContactSheet, etc.).

---

## Data model

```
// One record per contact, held in a ref (not state) so rAF writes don't
// trigger re-renders on their own. A separate "tick" counter (useState)
// triggers the actual React repaint once per frame.

OrbitalNode {
  id:          string          // contact.id
  baseAngle:   number          // radians — where node sits at globalOffset = 0
                               // set on mount from evenly-spaced distribution
  pinnedAngle: number | null   // if user dragged this node, this replaces baseAngle
                               // persisted to localStorage via useNodePositions
  label:       string          // initials
  fullName:    string
}

// Global animation state (all in a single ref)
AnimState {
  globalOffset:  number        // accumulates at SPIN_SPEED rad/ms — the "spin"
  lastTimestamp: number        // for delta-time calculation in rAF
  panOffset:    { x, y }       // canvas-level translation from drag-on-empty
}
```

---

## Constants

```
ORBITAL_RADIUS   = 290        // px from centre to contact node centre
SPIN_SPEED       = 0.00008    // radians per millisecond  (~27 s per full rotation)
USER_NODE_R      = 40         // radius of centre node (px) — for hit-testing & edge anchor
CONTACT_NODE_R   = 26         // radius of contact node (px)
EDGE_STROKE      = 2.5        // px — thicker than current (was 1)
EDGE_COLOUR      = 'rgba(201,169,110,0.30)'   // gold, subtle
CANVAS_BG        = '#1A1816'  // obsidian
```

---

## Layout

```
<ContactsView>
  ├── left panel (unchanged — contacts list)
  └── <OrbitalCanvas>               ← new component, replaces <NetworkCanvas>
        ├── <svg …>                 ← fills the right panel
        │     ├── <g transform="translate(panOffset)">    ← canvas pan group
        │     │     ├── edges (one <line> per contact)
        │     │     ├── contact nodes (one <g> per contact)
        │     │     └── user node (one <g> at screen centre)
        │     └── <ResetButton />   ← SVG <foreignObject> or absolutely-positioned div
        └── <ResetConfirmModal />   ← rendered outside the SVG, portal'd
```

---

## SVG coordinate system

- The SVG fills the container with `width="100%" height="100%"`.
- `centreX = svgWidth / 2`, `centreY = svgHeight / 2`.
  Computed once on mount and on `ResizeObserver` → stored in a ref.
- `canvasPanOffset` shifts the entire inner `<g>` so panning moves
  all elements together without changing their coordinates.
- Individual node positions are computed purely from angle + radius;
  there is no stored x/y per node, only an angle.

---

## Computing node position from angle

```
function orbitalPosition(node: OrbitalNode, globalOffset: number):
  angle = (node.pinnedAngle ?? node.baseAngle) + globalOffset
  x = centreX + ORBITAL_RADIUS * cos(angle)
  y = centreY + ORBITAL_RADIUS * sin(angle)
  return { x, y }
```

---

## Animation loop

```
function startOrbitalLoop():
  animRef = requestAnimationFrame(tick)

function tick(timestamp):
  Δt = timestamp - animState.lastTimestamp
  animState.lastTimestamp = timestamp
  animState.globalOffset += SPIN_SPEED * Δt
  setFrameTick(n => n + 1)         // triggers React to repaint SVG
  animRef = requestAnimationFrame(tick)

useEffect:
  startOrbitalLoop()
  return () => cancelAnimationFrame(animRef)
```

> The SVG elements read directly from `orbitalNodes` ref and
> `animState` ref on each render — no heavy state copy.

---

## Edges (center-to-center)

```
for each contact node:
  { x: cx, y: cy } = orbitalPosition(node, globalOffset) + panOffset
  userCentre = { x: centreX + panOffset.x, y: centreY + panOffset.y }

  <line
    x1={userCentre.x}
    y1={userCentre.y}
    x2={cx}
    y2={cy}
    stroke={EDGE_COLOUR}
    strokeWidth={EDGE_STROKE}
    pointerEvents="none"      // never intercept drags
  />
```

No Handles, no source/target offset — pure geometry. Edges always pass
through the visual centre of both nodes.

---

## User node rendering

```
<g transform={`translate(${centreX + panOffset.x}, ${centreY + panOffset.y})`}>
  // dashed gold ring (CSS animation: slow spin) — the "orbital ring" visual
  <circle r={USER_NODE_R} stroke="rgba(201,169,110,0.5)" strokeWidth={1.5}
          strokeDasharray="4 6" fill="none" className="animate-spin-slow" />

  // glow halo
  <circle r={USER_NODE_R + 12} fill="rgba(201,169,110,0.04)" />

  // avatar via <foreignObject>
  <foreignObject x={-USER_NODE_R} y={-USER_NODE_R}
                 width={USER_NODE_R*2} height={USER_NODE_R*2}>
    <Avatar … />
  </foreignObject>
</g>
```

---

## Contact node rendering

```
for each contact:
  { x, y } = orbitalPosition(node, globalOffset)
  cx = x + panOffset.x
  cy = y + panOffset.y

  <g
    transform={`translate(${cx}, ${cy})`}
    onMouseDown={(e) => handleNodeDragStart(e, node.id)}
    style={{ cursor: 'grab' }}
  >
    <circle r={CONTACT_NODE_R} fill="rgba(244,237,228,0.92)"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }} />
    <text textAnchor="middle" dominantBaseline="central"
          fontSize={13} fontWeight={600} fill="#1A1816">
      {node.label}
    </text>
  </g>
```

---

## Individual node dragging

### Intent
When the user drags a contact node:
- It breaks free of the orbit and follows the cursor.
- On release, the node "snaps back" to the orbit ring at the closest angle
  to where the cursor was dropped.
- That angle becomes the node's `pinnedAngle` (minus the current
  `globalOffset`) so it stays at that orbital position as the canvas
  continues to spin.

```
STATE: dragState = { active: false, nodeId: null, startX, startY }

handleNodeDragStart(e, nodeId):
  e.stopPropagation()           // prevent canvas pan from also firing
  dragState = { active: true, nodeId, startX: e.clientX, startY: e.clientY }
  window.addEventListener('mousemove', handleNodeDragMove)
  window.addEventListener('mouseup', handleNodeDragEnd)

handleNodeDragMove(e):
  if !dragState.active: return
  // We don't translate the node in real-time during drag —
  // instead we compute a "live angle" and use that for rendering
  // so the node snaps to the ring as you drag outward
  dx = e.clientX - svgRect.left - centreX - panOffset.x
  dy = e.clientY - svgRect.top  - centreY - panOffset.y
  liveAngle = atan2(dy, dx)
  // Update the node's display angle live (stored in dragState, not committed yet)
  dragState.liveAngle = liveAngle
  setFrameTick(n => n + 1)      // repaint

handleNodeDragEnd(e):
  dx = e.clientX - svgRect.left - centreX - panOffset.x
  dy = e.clientY - svgRect.top  - centreY - panOffset.y
  droppedAngle = atan2(dy, dx)
  // Convert to a base angle (remove current globalOffset so it's stable)
  newPinnedAngle = droppedAngle - animState.globalOffset
  orbitalNodes[dragState.nodeId].pinnedAngle = newPinnedAngle
  saveNodePosition(dragState.nodeId, { angle: newPinnedAngle })  // persist
  dragState = { active: false, nodeId: null }
  window.removeEventListener('mousemove', handleNodeDragMove)
  window.removeEventListener('mouseup', handleNodeDragEnd)
```

During a live drag, render that node AT `(centreX + ORBITAL_RADIUS * cos(liveAngle), ...)` —
it tracks the cursor's angle around the centre, always staying on the ring.

---

## Canvas pan (drag on empty space)

```
handleSvgMouseDown(e):
  if e.target is a contact node or user node: return
  panState = { active: true, startX: e.clientX, startY: e.clientY,
               originPanX: panOffset.x, originPanY: panOffset.y }

handleSvgMouseMove(e):
  if !panState.active: return
  panOffset.x = panState.originPanX + (e.clientX - panState.startX)
  panOffset.y = panState.originPanY + (e.clientY - panState.startY)
  // no setState — panOffset is a ref, repaint happens via rAF tick

handleSvgMouseUp():
  panState.active = false
```

> The SVG root element gets `cursor: grab` while panning, `cursor: default`
> otherwise. Node `<g>` elements call `e.stopPropagation()` on mousedown
> so they don't accidentally trigger the canvas pan.

---

## Reset button

```
// Positioned absolutely top-right (same location as current "Create contact")
// or below it as a secondary icon button

<Button variant="ghost" size="icon" onClick={() => setShowResetModal(true)}
        title="Reset node positions">
  <RotateCcw className="w-4 h-4" />
</Button>
```

---

## Reset confirmation modal

```
<Dialog open={showResetModal} onOpenChange={setShowResetModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reset node positions?</DialogTitle>
      <DialogDescription>
        This will return all contacts to their default orbital positions.
        Any custom placement you've made will be lost.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowResetModal(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={confirmReset}>
        Reset positions
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

confirmReset():
  // 1. Clear persisted positions
  clearNodePositions()          // localStorage.removeItem(POSITIONS_KEY)
  // 2. Reset in-memory angles to evenly-spaced defaults
  for each node at index i of total:
    node.pinnedAngle = null
    node.baseAngle   = (2π * i / total) - π/2
  // 3. Reset pan
  panOffset = { x: 0, y: 0 }
  setShowResetModal(false)
```

---

## Persistence shape change

`useNodePositions` currently stores `{ x, y }`. Extend to store angle:

```
// localStorage key: 'cluster-node-positions'
// Value shape: Record<contactId, { angle: number }>
//   (x/y removed — position is always computed from angle + radius)

saveNodePosition(id, { angle: number })
clearNodePositions()   ← new method
```

---

## Tailwind animation utility (for the dashed ring on the user node)

```css
/* Add to tailwind.config.ts → theme.extend.animation */
'spin-slow': 'spin 18s linear infinite'
```

---

## File plan

| File | Change |
|------|--------|
| `src/components/network/OrbitalCanvas.tsx` | **New** — replaces NetworkCanvas |
| `src/components/network/NetworkCanvas.tsx` | **Delete or keep as shell** |
| `src/hooks/useNodePositions.ts` | Add `clearNodePositions`, change value shape to `{ angle }` |
| `src/pages/ContactsView.tsx` | Import `OrbitalCanvas` instead of `NetworkCanvas` |
| `tailwind.config.ts` | Add `spin-slow` animation |

XY Flow (`@xyflow/react`) import is **removed** from the new component.
`UserNode.tsx` and `ContactNode.tsx` are no longer needed as ReactFlow
node types — their visual styles are inlined into `OrbitalCanvas`.

---

## Open questions before coding

1. **Touch support** — should drag/pan work on touch screens too?
   (`touchstart`/`touchmove`/`touchend` parallel to mouse events)

2. **Zoom** — the current canvas supports scroll-to-zoom. Keep it?
   (Can be added as a `scale` transform on the inner `<g>`, driven by wheel events)

3. **Node tooltip / click** — clicking a contact node currently does
   nothing. Should it open a detail panel in this version?

4. **Orbital radius grouping** — should contacts be on a single ring
   or multiple concentric rings based on connection strength?
   (Single ring for now; multi-ring is a later iteration)
