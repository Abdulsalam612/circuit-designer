"use client"

import React, { useEffect, useRef, useState } from "react"
import { Stage, Layer, Rect, Circle, Shape, Line, Label, Tag, Text } from "react-konva"
import Konva from "konva"
import styles from "./KonvaTestCanvas.module.css"
import interact from "interactjs"
import CircuitPart, { CIRCUIT_PART_NAME, partSize } from "./circuit/CircuitPart"
import { COMPONENT_DEFS, iconFor } from "@/lib/components"
import { rotateComponent } from "@/lib/editing"
import { formatAmps, formatVolts, formatWatts, type SimulationResult } from "@/lib/simulation"
import { GRID_SIZE, MAJOR_EVERY, snapToGrid, isSpotFree, pointKey, type Point } from "@/lib/grid"
import {
  makeId,
  routeWire,
  canAddWires,
  getConnectionPoints,
  getWireOccupiedPoints,
  normalizeWires,
  planMove,
} from "@/lib/wires"
import { createPortal } from "react-dom"
import type { ComponentType, CircuitComponent, CircuitLayout, Wire } from "@/types/circuit"

// The grid covers -GRID_EXTENT..GRID_EXTENT in both directions (canvas units)
const GRID_EXTENT = 2000

// Konva names for clickable things that aren't components
const WIRE_NAME = "wire"
const PIN_HANDLE_NAME = "pin-handle"

// Axis-aligned box helpers for box selection
interface Box { x0: number; y0: number; x1: number; y1: number }
const toBox = (a: Point, b: Point): Box => ({
  x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y),
})
const boxesOverlap = (a: Box, b: Box) => a.x0 <= b.x1 && b.x0 <= a.x1 && a.y0 <= b.y1 && b.y0 <= a.y1
const partBox = (c: CircuitComponent): Box => {
  const vertical = c.rotation % 180 !== 0
  const { width, height } = partSize(c.type)
  const halfLong = width / 2
  const halfShort = height / 2
  return vertical
    ? { x0: c.x - halfShort, y0: c.y - halfLong, x1: c.x + halfShort, y1: c.y + halfLong }
    : { x0: c.x - halfLong, y0: c.y - halfShort, x1: c.x + halfLong, y1: c.y + halfShort }
}

// Current flow animation: dots every FLOW_DOT_SPACING canvas units, moving at a speed
// that grows with the current (gently, so tiny and huge currents both look sensible)
const FLOW_NAME = "current-flow"
const FLOW_ID_PREFIX = "flow-"
const FLOW_COLOR = "#f59e0b"
const FLOW_DOT_SPACING = 14
const FLOW_MIN_AMPS = 1e-6
const flowSpeed = (amps: number) => Math.min(160, 25 + 30 * Math.log10(1 + amps * 1000))

const WIRE_COLOR = "#1f2937"
const SELECT_COLOR = "#3498db"
const INVALID_COLOR = "#ef4444"

interface KonvaTestCanvasProps {
  // The circuit is owned by the page (which keeps undo history and saves it)
  layout: CircuitLayout;
  onLayoutChange: (layout: CircuitLayout) => void;
  // Ids of the selected components and wires
  onSelectionChange?: (ids: string[]) => void;
  // Results to show while the simulation is running
  simulation?: SimulationResult | null;
  // Size the canvas to its parent element instead of the window (for embedding it in a
  // page, e.g. lesson challenges)
  fitContainer?: boolean;
}

const KonvaTestCanvas: React.FC<KonvaTestCanvasProps> = ({ layout, onLayoutChange, onSelectionChange, simulation, fitContainer = false }) => {
  // Set initial dimensions to avoid hydration errors
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isMounted, setIsMounted] = useState(false)
  
  // State for stage position and scale (for pan and zoom)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 })
  
  // Circuit contents
  const { components, wires } = layout
  // Latest values for event handlers that are set up once (interact.js, keyboard) and
  // would otherwise only ever see the first render's values
  const componentsRef = useRef(components)
  componentsRef.current = components
  const wiresRef = useRef(wires)
  wiresRef.current = wires
  const onLayoutChangeRef = useRef(onLayoutChange)
  onLayoutChangeRef.current = onLayoutChange

  // Selected component and wire ids
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const selectedIdsRef = useRef(selectedIds)
  selectedIdsRef.current = selectedIds
  // Wire being drawn: from a lead end / wire end to the grid point under the cursor
  const [wireDraft, setWireDraft] = useState<{ start: Point; end: Point } | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  // Part under the mouse, for the readings tooltip while simulating
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null)
  // Box selection, in canvas coordinates
  const [marquee, setMarquee] = useState<{ start: Point; end: Point; additive: boolean } | null>(null)
  // Set after a box selection so the click that ends it doesn't clear the selection
  const suppressNextClick = useRef(false)

  // Moving the selection: where the dragged part started, what's moving, and the
  // layout as it would be at the current (valid) drag offset
  const dragRef = useRef<{
    origin: Point;
    componentIds: Set<string>;
    wireIds: Set<string>;
    delta: Point;
    preview: { components: CircuitComponent[]; wires: Wire[] } | null;
  } | null>(null)
  const [movePreview, setMovePreview] = useState<{ components: CircuitComponent[]; wires: Wire[] } | null>(null)

  // What's on screen: the move preview while dragging, otherwise the saved layout
  const viewComponents = movePreview?.components ?? components
  const viewWires = movePreview?.wires ?? wires

  // Apply a new layout (one undo step). Wires are tidied: cut where ends land along
  // them, rejoined where a split is no longer needed.
  const commitLayout = (nextComponents: CircuitComponent[], nextWires: Wire[]) => {
    onLayoutChangeRef.current({ components: nextComponents, wires: normalizeWires(nextWires, nextComponents) })
  }

  // Tell the page what's selected
  useEffect(() => {
    onSelectionChange?.([...selectedIds]);
  }, [selectedIds, onSelectionChange]);
  
  // References
  const stageRef = useRef<Konva.Stage>(null)
  const circuitLayerRef = useRef<Konva.Layer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Setup interact.js for drag and drop functionality
  useEffect(() => {
    const container = containerRef.current;
    setIsMounted(true)
    
    // Nearest grid point to a screen position, in stage coordinates
    const clientToSnappedStage = (stage: Konva.Stage, clientX: number, clientY: number) => {
      const stageBox = stage.container().getBoundingClientRect();
      const stageX = (clientX - stageBox.left - stage.x()) / stage.scaleX();
      const stageY = (clientY - stageBox.top - stage.y()) / stage.scaleY();
      return { x: snapToGrid(stageX), y: snapToGrid(stageY) };
    };

    // Function to handle component drop
    const handleComponentDrop = (componentType: ComponentType, clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage || !componentType) return;

      // Centre the new component on the grid point nearest the cursor, matching the drag preview
      const { x, y } = clientToSnappedStage(stage, clientX, clientY);
      const def = COMPONENT_DEFS[componentType];
      const placement = { type: componentType, x, y, rotation: def.defaultRotation };
      if (!isSpotFree(placement, componentsRef.current, getWireOccupiedPoints(wiresRef.current))) return;
      const newComponent: CircuitComponent = {
        id: makeId(componentType),
        ...placement,
        ...(def.value ? { value: def.value.default } : {}),
        ...(def.toggles ? { closed: false } : {}),
      };

      commitLayout([...componentsRef.current, newComponent], wiresRef.current);
      setSelectedIds(new Set([newComponent.id]));
    };
    
    const isOverCanvas = (clientX: number, clientY: number) => {
      const rect = container?.getBoundingClientRect();
      return !!rect &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
    };

    // Drag preview: a floating copy of the component symbol, drawn at the canvas zoom.
    // Over the canvas it jumps to the nearest grid point, so it shows exactly where the
    // component will land; elsewhere it follows the cursor. The sidebar card stays in place.
    let ghost: HTMLDivElement | null = null;
    let ghostType: ComponentType | null = null;
    let ghostWidth = 0;
    let ghostHeight = 0;

    const moveGhost = (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!ghost || !stage) return;
      let centreX = clientX;
      let centreY = clientY;
      const overCanvas = isOverCanvas(clientX, clientY);
      let blocked = false;
      if (overCanvas) {
        const snapped = clientToSnappedStage(stage, clientX, clientY);
        const stageBox = stage.container().getBoundingClientRect();
        centreX = stageBox.left + stage.x() + snapped.x * stage.scaleX();
        centreY = stageBox.top + stage.y() + snapped.y * stage.scaleY();
        const rotation = ghostType ? COMPONENT_DEFS[ghostType].defaultRotation : 0;
        blocked = !ghostType || !isSpotFree({ type: ghostType, ...snapped, rotation }, componentsRef.current, getWireOccupiedPoints(wiresRef.current));
      }
      const rotation = ghostType ? COMPONENT_DEFS[ghostType].defaultRotation : 0;
      ghost.style.transform = `translate3d(${centreX - ghostWidth / 2}px, ${centreY - ghostHeight / 2}px, 0) rotate(${rotation}deg)`;
      ghost.style.opacity = overCanvas ? '1' : '0.5';
      // Red outline: this spot is taken and dropping here does nothing
      ghost.style.outlineColor = blocked ? '#ef4444' : '#3498db';
      document.body.style.cursor = blocked ? 'not-allowed' : 'grabbing';
    };

    // Make sidebar components draggable
    interact('.componentItem').draggable({
      autoScroll: true,

      // Start dragging
      onstart: (event) => {
        const element = event.target as HTMLElement;
        const componentType = element.getAttribute('data-component-type') as ComponentType;
        const scale = stageRef.current?.scaleX() ?? 1;
        const size = partSize(componentType);
        ghostType = componentType;
        ghostWidth = size.width * scale;
        ghostHeight = size.height * scale;

        ghost = document.createElement('div');
        Object.assign(ghost.style, {
          position: 'fixed',
          left: '0',
          top: '0',
          width: `${ghostWidth}px`,
          height: `${ghostHeight}px`,
          pointerEvents: 'none',
          zIndex: '9999',
          willChange: 'transform',
          outline: '2px dashed #3498db',
          outlineOffset: '4px',
          borderRadius: '2px',
          background: `url(${iconFor({ type: componentType })}) center / 100% 100% no-repeat`,
        });
        document.body.appendChild(ghost);
        moveGhost(event.clientX, event.clientY);

        element.style.opacity = '0.5';
        document.body.style.cursor = 'grabbing';
      },

      // While dragging
      onmove: (event) => {
        moveGhost(event.clientX, event.clientY);
      },

      // End dragging
      onend: (event) => {
        const element = event.target as HTMLElement;
        const componentType = element.getAttribute('data-component-type') as ComponentType;

        ghost?.remove();
        ghost = null;
        element.style.opacity = '';
        document.body.style.cursor = '';

        if (isOverCanvas(event.clientX, event.clientY)) {
          handleComponentDrop(componentType, event.clientX, event.clientY);
        }
      }
    });
    
    if (container) {
      interact(container).dropzone({
        accept: '.componentItem',
        overlap: 0.5,
        ondropactivate: (event) => {
          event.target.classList.add('drop-active');
        },
        ondragenter: (event) => {
          const draggableElement = event.relatedTarget;
          const dropzoneElement = event.target;
          dropzoneElement.classList.add('drop-target');
          draggableElement.classList.add('can-drop');
        },
        ondragleave: (event) => {
          event.target.classList.remove('drop-target');
          event.relatedTarget.classList.remove('can-drop');
        },
        ondrop: (event) => {
          event.target.classList.remove('drop-target');
          event.relatedTarget.classList.remove('can-drop');
        },
        ondropdeactivate: (event) => {
          event.target.classList.remove('drop-active');
        },
      });
    }
    
    // Clean up interact.js instances on unmount
    return () => {
      ghost?.remove();
      interact('.componentItem').unset();
      if (container) {
      interact(container).unset();
    }
    };
  }, [isMounted]);
  
  // Use useEffect to safely access window and update state
  useEffect(() => {
    const wheelContainer = containerRef.current;
    setIsMounted(true)
    
    // Update dimensions based on window size (an embedded canvas is sized by the
    // ResizeObserver below instead)
    const updateDimensions = () => {
      if (fitContainer) return
      // Adjust these values based on your layout
      setDimensions({
        width: window.innerWidth - 360, // Adjusted to account for sidebar width
        height: window.innerHeight - 140,
      })
    }

    // Set initial dimensions
    updateDimensions()

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions)
    
    // Add wheel event listener for zooming
    const handleWheel = (e: Event) => {
      // Cast to WheelEvent to access deltaY
      const wheelEvent = e as WheelEvent
      wheelEvent.preventDefault()
      
      if (stageRef.current) {
        const stage = stageRef.current
        const oldScale = scale
        
        // Get pointer position relative to stage
        const pointer = stage.getPointerPosition()
        
        if (!pointer) return
        
        // Calculate new scale (zoom in/out)
        const newScale = wheelEvent.deltaY < 0 
          ? Math.min(oldScale * 1.1, 5) // Zoom in (max scale: 5)
          : Math.max(oldScale / 1.1, 0.1) // Zoom out (min scale: 0.1)
        
        // Calculate new position to zoom to pointer
        const mousePointTo = {
          x: (pointer.x - stagePos.x) / oldScale,
          y: (pointer.y - stagePos.y) / oldScale,
        }
        
        // Update state
        setScale(newScale)
        setStagePos({
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        })
      }
    }
    
    // Add wheel event listener to container
    if (wheelContainer) {
      wheelContainer.addEventListener('wheel', handleWheel as EventListener)
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (wheelContainer) {
        wheelContainer.removeEventListener('wheel', handleWheel as EventListener)
      }
    }
  }, [scale, stagePos, fitContainer])

  // Embedded canvas: follow the size of the element it sits in (the container only
  // exists once mounted, before that a placeholder is shown)
  useEffect(() => {
    const container = containerRef.current
    if (!fitContainer || !isMounted || !container) return
    const fit = (width: number, height: number) => {
      if (width > 0 && height > 0) setDimensions({ width: Math.floor(width), height: Math.floor(height) })
    }
    // Measure now too: ResizeObserver only reports on the next rendered frame
    fit(container.clientWidth, container.clientHeight)
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height))
    observer.observe(container)
    return () => observer.disconnect()
  }, [fitContainer, isMounted])

  // Handle mouse events for right-click panning
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    suppressNextClick.current = false
    // Left-drag on empty space starts a box selection (the grid layer doesn't listen,
    // so empty space means the stage itself)
    if (e.evt.button === 0 && e.target === e.target.getStage()) {
      const pos = stageRef.current?.getRelativePointerPosition();
      if (pos) setMarquee({ start: pos, end: pos, additive: e.evt.shiftKey });
      return;
    }

    // Check if it's a right-click (button 2)
    if (e.evt.button === 2) {
      e.evt.preventDefault() // Prevent context menu
      
      const stage = stageRef.current
      if (stage) {
        setIsPanning(true)
        const pos = stage.getPointerPosition()
        if (pos) {
          setLastPointerPosition(pos)
        }
        
        // Change cursor style
        document.body.style.cursor = 'grabbing'
      }
    }
  }
  
  const handleMouseUp = () => {
    // End panning on any mouse button release
    setIsPanning(false)
    document.body.style.cursor = 'default'
  }
  
  const handleMouseMove = () => {
    // Drawing a wire: follow the nearest grid point
    if (wireDraft) {
      const pos = stageRef.current?.getRelativePointerPosition();
      if (!pos) return;
      const end = { x: snapToGrid(pos.x), y: snapToGrid(pos.y) };
      if (end.x !== wireDraft.end.x || end.y !== wireDraft.end.y) {
        setWireDraft({ ...wireDraft, end });
      }
      return;
    }

    if (marquee) {
      const pos = stageRef.current?.getRelativePointerPosition();
      if (pos) setMarquee({ ...marquee, end: pos });
      return;
    }

    if (!isPanning) return;
    
    const stage = stageRef.current;
    if (stage) {
      const pointer = stage.getPointerPosition();
      
      // Check if pointer is null before using it
      if (!pointer) return;
      
      const dx = pointer.x - lastPointerPosition.x;
      const dy = pointer.y - lastPointerPosition.y;
      
      // Calculate new position
      const newX = stagePos.x + dx;
      const newY = stagePos.y + dy;
      
      // Apply panning limits to keep grid visible
      // These values can be adjusted based on your grid size
      const maxPanX = dimensions.width * 0.5;
      const maxPanY = dimensions.height * 0.5;
      
      const limitedX = Math.max(-maxPanX, Math.min(newX, maxPanX));
      const limitedY = Math.max(-maxPanY, Math.min(newY, maxPanY));
      
      setStagePos({
        x: limitedX,
        y: limitedY
      });
      
      setLastPointerPosition(pointer);
    }
  };
  
  // Prevent context menu from appearing on right-click
  const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault()
  }
  
  // Handle zoom reset
  const handleResetZoom = () => {
    setScale(1)
    setStagePos({ x: 0, y: 0 }) // Reset position to center
  }
  
  // Handle fit to screen
  const handleFitToScreen = () => {
    // Simple implementation - you might want to calculate based on content bounds
    setScale(0.8)
    setStagePos({ x: dimensions.width / 10, y: dimensions.height / 10 })
  }

  // R rotates the selected component (wires follow), Delete/Backspace removes everything
  // selected, Escape clears the selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const selected = selectedIdsRef.current;
      if (selected.size === 0) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const allComponents = componentsRef.current;
      const allWires = wiresRef.current;
      if (e.key === 'r' || e.key === 'R') {
        if (selected.size !== 1) return;
        const [id] = selected;
        // Attached wires follow; no rotation if that would hit something
        const rotated = rotateComponent({ components: allComponents, wires: allWires }, id);
        if (rotated) onLayoutChangeRef.current(rotated);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        commitLayout(
          allComponents.filter(c => !selected.has(c.id)),
          allWires.filter(w => !selected.has(w.id)),
        );
        setSelectedIds(new Set());
      } else if (e.key === 'Escape') {
        setSelectedIds(new Set());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Finish the wire being drawn when the mouse is released (even outside the canvas)
  useEffect(() => {
    if (!wireDraft) return;
    const handleMouseUp = (e: MouseEvent) => {
      // Read the release point directly: on a fast drag the last mousemove may not
      // have re-rendered yet, so wireDraft.end can be stale
      let end = wireDraft.end;
      const stage = stageRef.current;
      if (stage) {
        stage.setPointersPositions(e);
        const pos = stage.getRelativePointerPosition();
        if (pos) end = { x: snapToGrid(pos.x), y: snapToGrid(pos.y) };
      }
      const segments = routeWire(wireDraft.start, end);
      if (canAddWires(segments, components, wires)) {
        const added = segments.map(s => ({ id: makeId('wire'), ...s }));
        commitLayout(components, [...wires, ...added]);
      }
      setWireDraft(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [wireDraft, components, wires]);

  // Finish a box selection: select every component and wire the box touches
  useEffect(() => {
    if (!marquee) return;
    const handleMouseUp = (e: MouseEvent) => {
      let end = marquee.end;
      const stage = stageRef.current;
      if (stage) {
        stage.setPointersPositions(e);
        end = stage.getRelativePointerPosition() ?? end;
      }
      const box = toBox(marquee.start, end);
      // A plain click (tiny box) is left to the click handler
      const isDrag = (box.x1 - box.x0) * scale > 4 || (box.y1 - box.y0) * scale > 4;
      if (isDrag) {
        const hits = [
          ...components.filter(c => boxesOverlap(partBox(c), box)).map(c => c.id),
          ...wires.filter(w => boxesOverlap(toBox({ x: w.x1, y: w.y1 }, { x: w.x2, y: w.y2 }), box)).map(w => w.id),
        ];
        setSelectedIds(prev => new Set([...(marquee.additive ? prev : []), ...hits]));
        suppressNextClick.current = true;
      }
      setMarquee(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [marquee, components, wires, scale]);

  // Click selects just this item; Shift+click adds it to / removes it from the selection
  const handleSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    setSelectedIds(prev => {
      if (e.evt.shiftKey) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      }
      return prev.size === 1 && prev.has(id) ? new Set() : new Set([id]);
    });
  };

  // Dragging a selected part moves the whole selection; dragging any other part
  // selects and moves just that part. Wires attached to moving parts follow them.
  const handlePartDragStart = (id: string) => {
    let selection = selectedIdsRef.current;
    if (!selection.has(id)) {
      selection = new Set([id]);
      setSelectedIds(selection);
    }
    const part = components.find(c => c.id === id);
    if (!part) return;
    dragRef.current = {
      origin: { x: part.x, y: part.y },
      componentIds: new Set(components.filter(c => selection.has(c.id)).map(c => c.id)),
      wireIds: new Set(wires.filter(w => selection.has(w.id)).map(w => w.id)),
      delta: { x: 0, y: 0 },
      preview: null,
    };
  };

  const handlePartDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const node = e.target;
    const delta = { x: snapToGrid(node.x()) - drag.origin.x, y: snapToGrid(node.y()) - drag.origin.y };
    if (delta.x !== drag.delta.x || delta.y !== drag.delta.y) {
      const nextComponents = components.map(c =>
        drag.componentIds.has(c.id) ? { ...c, x: c.x + delta.x, y: c.y + delta.y } : c
      );
      const isHome = delta.x === 0 && delta.y === 0;
      const nextWires = isHome ? wires : planMove(components, wires, nextComponents, drag.wireIds, delta);
      // Only accept positions where everything (parts and rerouted wires) fits
      if (nextWires) {
        drag.delta = delta;
        drag.preview = isHome ? null : { components: nextComponents, wires: nextWires };
        setMovePreview(drag.preview);
      }
    }
    node.position({ x: drag.origin.x + drag.delta.x, y: drag.origin.y + drag.delta.y });
  };

  const handlePartDragEnd = () => {
    const preview = dragRef.current?.preview;
    if (preview) commitLayout(preview.components, preview.wires);
    dragRef.current = null;
    setMovePreview(null);
  };

  // Parts named in a simulation warning get an amber outline
  const warnedIds = new Set(simulation?.warnings.flatMap(w => w.componentIds) ?? [])

  const renderComponents = () => viewComponents.map(component => (
    <CircuitPart
      key={component.id}
      component={component}
      isSelected={selectedIds.has(component.id)}
      onClick={(e) => handleSelect(component.id, e)}
      onDragStart={() => handlePartDragStart(component.id)}
      onDragMove={handlePartDragMove}
      onDragEnd={handlePartDragEnd}
      onMouseEnter={() => setHoveredPartId(component.id)}
      onMouseLeave={() => setHoveredPartId(prev => (prev === component.id ? null : prev))}
      brightness={simulation?.readings[component.id]?.brightness ?? 0}
      hasWarning={warnedIds.has(component.id)}
      draggable={true}
    />
  ));

  // Live readings above the hovered part while simulating. Drawn at a fixed screen
  // size whatever the zoom.
  const renderReadingTooltip = () => {
    if (!simulation || !hoveredPartId || movePreview) return null;
    const component = viewComponents.find(c => c.id === hoveredPartId);
    const reading = simulation.readings[hoveredPartId];
    if (!component || !reading || component.type === 'ground') return null;
    const vertical = component.rotation % 180 !== 0;
    const halfHeight = vertical ? partSize(component.type).width / 2 : partSize(component.type).height / 2;
    const lines = [
      COMPONENT_DEFS[component.type].label,
      `Voltage: ${formatVolts(reading.voltage)}`,
      `Current: ${formatAmps(reading.current)}`,
      `Power: ${formatWatts(reading.power)}`,
    ];
    if (reading.overloaded) lines.push('Overloaded!');
    return (
      <Label x={component.x} y={component.y - halfHeight - 6} scaleX={1 / scale} scaleY={1 / scale} listening={false}>
        <Tag
          fill="#1f2937"
          opacity={0.92}
          cornerRadius={6}
          pointerDirection="down"
          pointerWidth={10}
          pointerHeight={6}
        />
        <Text text={lines.join("\n")} fontSize={12} lineHeight={1.4} padding={8} fill="white" fontFamily="ui-monospace, monospace" />
      </Label>
    );
  };

  // ---- Current flow animation ----
  // While simulating, dots travel along every wire that carries current, in the direction
  // of conventional current (+ to -), faster when more current flows.
  const showFlow = !!simulation && !movePreview
  const flowSpeeds = useRef(new Map<string, number>())
  flowSpeeds.current = new Map(
    showFlow
      ? Object.entries(simulation!.wireCurrents)
          .filter(([, amps]) => Math.abs(amps) > FLOW_MIN_AMPS)
          .map(([id, amps]) => [id, Math.sign(amps) * flowSpeed(Math.abs(amps))])
      : []
  )

  useEffect(() => {
    const layer = circuitLayerRef.current
    if (!showFlow || !layer) return
    const animation = new Konva.Animation((frame) => {
      if (!frame) return
      const seconds = frame.timeDiff / 1000
      for (const line of layer.find(`.${FLOW_NAME}`) as Konva.Line[]) {
        const speed = flowSpeeds.current.get(line.id().slice(FLOW_ID_PREFIX.length)) ?? 0
        // A falling dash offset moves the dots from the line's first point to its last
        line.dashOffset(line.dashOffset() - speed * seconds)
      }
    }, layer)
    animation.start()
    return () => { animation.stop() }
  }, [showFlow])

  const renderFlow = () => {
    if (!showFlow) return null
    return viewWires
      .filter(w => flowSpeeds.current.has(w.id))
      .map(w => (
        <Line
          key={`${FLOW_ID_PREFIX}${w.id}`}
          id={`${FLOW_ID_PREFIX}${w.id}`}
          name={FLOW_NAME}
          points={[w.x1, w.y1, w.x2, w.y2]}
          stroke={FLOW_COLOR}
          strokeWidth={4}
          lineCap="round"
          dash={[0.001, FLOW_DOT_SPACING]}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))
  }

  const renderWires = () => viewWires.map(w => (
    <Line
      key={w.id}
      id={w.id}
      name={WIRE_NAME}
      points={[w.x1, w.y1, w.x2, w.y2]}
      stroke={selectedIds.has(w.id) ? SELECT_COLOR : WIRE_COLOR}
      strokeWidth={2}
      lineCap="round"
      hitStrokeWidth={10}
      onClick={(e) => handleSelect(w.id, e)}
    />
  ));

  const renderMarquee = () => {
    if (!marquee) return null;
    const box = toBox(marquee.start, marquee.end);
    return (
      <Rect
        x={box.x0}
        y={box.y0}
        width={box.x1 - box.x0}
        height={box.y1 - box.y0}
        fill="rgba(52, 152, 219, 0.08)"
        stroke={SELECT_COLOR}
        strokeWidth={1 / scale}
        dash={[4 / scale, 3 / scale]}
        listening={false}
      />
    );
  };

  // Lead ends and wire ends: drag from one to draw a wire.
  // Hollow circle = not connected yet, filled dot = junction of 3 or more.
  const renderConnectionPoints = () => getConnectionPoints(viewComponents, viewWires)
    .map(({ point, count }) => {
      const key = pointKey(point);
      const hovered = hoveredPoint === key && !wireDraft;
      return (
        <React.Fragment key={key}>
          {count === 1 && (
            <Circle x={point.x} y={point.y} radius={3.5} fill="white" stroke="#6b7280" strokeWidth={1.5} listening={false} />
          )}
          {count >= 3 && (
            <Circle x={point.x} y={point.y} radius={4} fill={WIRE_COLOR} listening={false} />
          )}
          {hovered && (
            <Circle x={point.x} y={point.y} radius={7} stroke={SELECT_COLOR} strokeWidth={2} listening={false} />
          )}
          {/* Invisible, larger hit area */}
          <Circle
            x={point.x}
            y={point.y}
            radius={8}
            fill="rgba(0,0,0,0)"
            name={PIN_HANDLE_NAME}
            onMouseEnter={() => {
              setHoveredPoint(key);
              document.body.style.cursor = 'crosshair';
            }}
            onMouseLeave={() => {
              setHoveredPoint(null);
              if (!wireDraft) document.body.style.cursor = 'default';
            }}
            onMouseDown={(e) => {
              if (e.evt.button !== 0) return;
              e.cancelBubble = true;
              setWireDraft({ start: point, end: point });
            }}
          />
        </React.Fragment>
      );
    });

  const renderWireDraft = () => {
    if (!wireDraft) return null;
    const segments = routeWire(wireDraft.start, wireDraft.end);
    if (segments.length === 0) return null;
    const color = canAddWires(segments, components, wires) ? SELECT_COLOR : INVALID_COLOR;
    return segments.map((s, i) => (
      <Line
        key={i}
        points={[s.x1, s.y1, s.x2, s.y2]}
        stroke={color}
        strokeWidth={2}
        dash={[6, 4]}
        lineCap="round"
        listening={false}
      />
    ));
  };

  // Minor lines every grid cell, darker major lines every MAJOR_EVERY cells.
  // Drawn as one shape so the grid is cheap even with hundreds of lines.
  const drawGrid = (ctx: Konva.Context) => {
    const drawLines = (major: boolean) => {
      ctx.beginPath();
      for (let p = -GRID_EXTENT; p <= GRID_EXTENT; p += GRID_SIZE) {
        const isMajor = Math.round(p / GRID_SIZE) % MAJOR_EVERY === 0;
        if (isMajor !== major) continue;
        ctx.moveTo(-GRID_EXTENT, p);
        ctx.lineTo(GRID_EXTENT, p);
        ctx.moveTo(p, -GRID_EXTENT);
        ctx.lineTo(p, GRID_EXTENT);
      }
      ctx.strokeStyle = major ? "#d1d5db" : "#eef0f3";
      // Keep lines 1 screen pixel wide at any zoom
      ctx.lineWidth = 1 / scale;
      ctx.stroke();
    };
    drawLines(false);
    drawLines(true);
  };

  // Deselect when left-clicking empty space
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    const clickedSomething =
      e.target.hasName(WIRE_NAME) ||
      e.target.hasName(PIN_HANDLE_NAME) ||
      !!e.target.findAncestor(`.${CIRCUIT_PART_NAME}`, true);
    if (!clickedSomething) {
      setSelectedIds(new Set());
    }
  };

  // Don't render anything until component is mounted on client
  if (!isMounted) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-black font-medium">Loading canvas...</div>
  }

  return (
    <div ref={containerRef} className={styles.konvaContainer}>
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        onClick={handleStageClick}
      >
        {/* Grid on its own non-interactive layer: it isn't redrawn while components move,
            and clicks on empty space go straight to the stage (which deselects) */}
        <Layer listening={false}>
          <Rect width={GRID_EXTENT * 2} height={GRID_EXTENT * 2} x={-GRID_EXTENT} y={-GRID_EXTENT} fill="#f9f9f9" />
          <Shape sceneFunc={drawGrid} perfectDrawEnabled={false} />
          {/* Center marker */}
          <Circle x={0} y={0} radius={4} fill="#cbd5e1" />
        </Layer>

        <Layer ref={circuitLayerRef}>
          {renderWires()}
          {renderFlow()}
          {renderComponents()}
          {renderConnectionPoints()}
          {renderWireDraft()}
          {renderMarquee()}
          {renderReadingTooltip()}
        </Layer>
      </Stage>
      
      {/* Zoom controls portal */}
      {isMounted && createPortal(
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium text-black">Zoom: {Math.round(scale * 100)}%</div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleFitToScreen} 
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-black font-medium rounded transition-colors"
            >
              Fit
            </button>
            <button 
              onClick={handleResetZoom} 
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-black font-medium rounded transition-colors"
            >
              Reset
            </button>
            <button 
              onClick={() => setScale(s => Math.min(s * 1.2, 5))} 
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-black font-medium rounded transition-colors"
            >
              +
            </button>
            <button 
              onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} 
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-black font-medium rounded transition-colors"
            >
              -
            </button>
          </div>
        </div>,
        document.getElementById('zoom-controls-container') || document.body
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1.5 rounded shadow text-xs text-gray-700 pointer-events-none">
        <p>Drag components from sidebar</p>
        <p>Drag from a component&apos;s end to draw a wire</p>
        <p>Drag on empty space to box-select · Shift+click to add</p>
        <p>R rotate · Delete remove · Esc deselect</p>
        <p>Right-click + drag to pan · wheel to zoom</p>
      </div>
    </div>
  );
};

export default KonvaTestCanvas;
