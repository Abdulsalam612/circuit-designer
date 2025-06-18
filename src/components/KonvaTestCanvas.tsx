"use client"

import React, { useEffect, useRef, useState } from "react"
import { Stage, Layer, Rect, Circle, Line } from "react-konva"
import Konva from "konva"
import styles from "./KonvaTestCanvas.module.css"
import interact from "interactjs"
import Resistor from "./circuit/Resistor"
import Capacitor from "./circuit/Capacitor"
import Battery from "./circuit/Battery"
import Inductor from "./circuit/Inductor"
import Switch from "./circuit/Switch"
import { createPortal } from "react-dom"

// Define component types
type ComponentType = 'resistor' | 'capacitor' | 'inductor' | 'battery' | 'switch';

// Define a circuit component
interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
}

interface KonvaTestCanvasProps {
  onSelectedComponentChange?: (component: CircuitComponent | null) => void;
}

const KonvaTestCanvas: React.FC<KonvaTestCanvasProps> = ({ onSelectedComponentChange }) => {
  // Set initial dimensions to avoid hydration errors
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isMounted, setIsMounted] = useState(false)
  
  // State for stage position and scale (for pan and zoom)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 })
  
  // New state for circuit components
  const [components, setComponents] = useState<CircuitComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Notify parent when selected component changes
  useEffect(() => {
    if (onSelectedComponentChange) {
      const selected = components.find(c => c.id === selectedComponent) || null;
      onSelectedComponentChange(selected);
    }
  }, [selectedComponent, components, onSelectedComponentChange]);
  
  // References
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Setup interact.js for drag and drop functionality
  useEffect(() => {
    const container = containerRef.current;
    setIsMounted(true)
    
    // Function to handle component drop
    const handleComponentDrop = (componentType: ComponentType, clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage || !componentType) return;
      
      // Convert client coordinates to stage coordinates
      const stageBox = stage.container().getBoundingClientRect();
      const pointerX = clientX - stageBox.left;
      const pointerY = clientY - stageBox.top;
      
      // Convert to stage coordinates accounting for stage transform
      const stageX = (pointerX - stage.x()) / stage.scaleX();
      const stageY = (pointerY - stage.y()) / stage.scaleY();
      
      // Create new component
      const newComponent: CircuitComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        x: stageX,
        y: stageY,
        rotation: 0
      };
      
      // Add component to state
      setComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent.id);
      
      // Force stage update
      stage.batchDraw();
    };
    
    // Make sidebar components draggable
    interact('.componentItem').draggable({
      inertia: true,
      autoScroll: true,
      
      // Start dragging
      onstart: (event) => {
        const element = event.target;
        element.style.opacity = '0.8';
        element.style.transform = 'scale(1.05)';
        element.style.zIndex = '1000';
        element.style.position = 'fixed';
        element.style.pointerEvents = 'none';
      },
      
      // While dragging
      onmove: (event) => {
        const element = event.target;
        const x = (parseFloat(element.getAttribute('data-x') || '0')) + event.dx;
        const y = (parseFloat(element.getAttribute('data-y') || '0')) + event.dy;
        
        element.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        element.setAttribute('data-x', x.toString());
        element.setAttribute('data-y', y.toString());
      },
      
      // End dragging
      onend: (event) => {
        const element = event.target;
        const componentType = element.getAttribute('data-component-type') as ComponentType;
        const rect = container?.getBoundingClientRect();
        
        // Reset element style
        element.style.opacity = '1';
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.position = '';
        element.style.pointerEvents = '';
        element.removeAttribute('data-x');
        element.removeAttribute('data-y');
        
        // Check if drop is within canvas area
        if (rect && 
            event.clientX >= rect.left && 
            event.clientX <= rect.right && 
            event.clientY >= rect.top && 
            event.clientY <= rect.bottom) {
          // Handle component drop
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
    
    // Update dimensions based on window size
    const updateDimensions = () => {
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
  }, [scale, stagePos])

  // Handle mouse events for right-click panning
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
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

  // Handle rotation of selected component with 'R' key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (selectedComponent) {
          setComponents(prevComponents =>
            prevComponents.map(component =>
              component.id === selectedComponent
                ? { ...component, rotation: (component.rotation + 90) % 360 }
                : component
            )
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);

  // Render components based on their type
  const renderComponents = () => {
    const handleComponentClick = (id: string) => {
      setSelectedComponent(prev => prev === id ? null : id);
    };

    const handleComponentDragEnd = (id: string, e: Konva.KonvaEventObject<Event>) => {
      setComponents(prevComponents => 
        prevComponents.map(component => 
          component.id === id 
            ? { ...component, x: e.target.x(), y: e.target.y() } 
            : component
        )
      );
    };

    return components.map(component => {
      const isSelected = selectedComponent === component.id;
      
      // Render component based on type
      switch (component.type) {
        case 'resistor':
          return (
            <Resistor
              key={component.id}
              id={component.id}
              x={component.x}
              y={component.y}
              rotation={component.rotation}
              isSelected={isSelected}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
              draggable={true}
            />
          );
        case 'capacitor':
          return (
            <Capacitor
              key={component.id}
              id={component.id}
              x={component.x}
              y={component.y}
              rotation={component.rotation}
              isSelected={isSelected}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
              draggable={true}
            />
          );
        case 'battery':
          return (
            <Battery
              key={component.id}
              id={component.id}
              x={component.x}
              y={component.y}
              rotation={component.rotation}
              isSelected={isSelected}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
              draggable={true}
            />
          );
        case 'inductor':
          return (
            <Inductor
              key={component.id}
              id={component.id}
              x={component.x}
              y={component.y}
              rotation={component.rotation}
              isSelected={isSelected}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
              draggable={true}
            />
          );
        case 'switch':
          return (
            <Switch
              key={component.id}
              id={component.id}
              x={component.x}
              y={component.y}
              rotation={component.rotation}
              isSelected={isSelected}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
              draggable={true}
            />
          );
        case 'inductor':
        case 'battery':
        case 'switch':
        default:
          // Placeholder for other component types
          return (
            <Rect
              key={component.id}
              x={component.x}
              y={component.y}
              width={40}
              height={40}
              fill="#f0f0f0"
              stroke={isSelected ? "#3498db" : "black"}
              strokeWidth={isSelected ? 2 : 1}
              draggable={true}
              onClick={() => handleComponentClick(component.id)}
              onDragEnd={(e) => handleComponentDragEnd(component.id, e)}
            />
          );
      }
    });
  };

// ...
  // Handle stage click to deselect components
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only deselect if clicking on the stage itself, not a component
    if (e.target === e.currentTarget) {
      setSelectedComponent(null);
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
        <Layer>
          {/* Grid or background elements - increased size to prevent empty areas */}
          <Rect width={4000} height={4000} x={-2000} y={-2000} fill="#f9f9f9" />
          
          {/* Grid lines - horizontal */}
          {Array.from({ length: 80 }, (_, i) => (
            <Line
              key={`h-${i}`}
              points={[-2000, (i - 40) * 50, 2000, (i - 40) * 50]}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          
          {/* Grid lines - vertical */}
          {Array.from({ length: 80 }, (_, i) => (
            <Line
              key={`v-${i}`}
              points={[(i - 40) * 50, -2000, (i - 40) * 50, 2000]}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
          
          {/* Center marker */}
          <Circle x={0} y={0} radius={5} fill="#cbd5e1" />
          
          {/* Render circuit components */}
          {renderComponents()}
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
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm font-medium text-black">
        <p>Right-click + drag to pan</p>
        <p>Mouse wheel to zoom</p>
        <p>Drag components from sidebar</p>
      </div>
    </div>
  );
};

export default KonvaTestCanvas;
