"use client"

import { useEffect, useState, useRef } from "react"
import { Stage, Layer, Rect, Circle, Line, Transformer } from "react-konva"

const KonvaTestCanvas = () => {
  // Set initial dimensions to avoid hydration errors
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isMounted, setIsMounted] = useState(false)
  
  // State for stage position and scale (for pan and zoom)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 })
  
  // Reference to the stage
  const stageRef = useRef(null)
  
  // Use useEffect to safely access window and update state
  useEffect(() => {
    setIsMounted(true)
    
    // Update dimensions based on window size
    const updateDimensions = () => {
      // Adjust these values based on your layout
      setDimensions({
        width: window.innerWidth - 160,
        height: window.innerHeight - 140,
      })
    }

    // Set initial dimensions
    updateDimensions()

    // Add event listener for window resize
    window.addEventListener("resize", updateDimensions)
    
    // Add wheel event listener for zooming
    const handleWheel = (e) => {
      e.preventDefault()
      
      if (stageRef.current) {
        const stage = stageRef.current
        const oldScale = scale
        
        // Get pointer position relative to stage
        const pointer = stage.getPointerPosition()
        
        // Calculate new scale with zoom speed factor
        const zoomSpeed = 1.1
        const newScale = e.deltaY < 0 ? oldScale * zoomSpeed : oldScale / zoomSpeed
        
        // Limit zoom range
        const limitedScale = Math.max(0.1, Math.min(newScale, 5))
        
        // Calculate new position to zoom towards pointer
        const mousePointTo = {
          x: (pointer.x - stagePos.x) / oldScale,
          y: (pointer.y - stagePos.y) / oldScale,
        }
        
        const newPos = {
          x: pointer.x - mousePointTo.x * limitedScale,
          y: pointer.y - mousePointTo.y * limitedScale,
        }
        
        // Update state
        setScale(limitedScale)
        setStagePos(newPos)
      }
    }
    
    // Add wheel event listener to the container
    const container = document.querySelector('.konva-container')
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
    }
  }, [scale, stagePos])

  // Handle mouse events for right-click panning
  const handleMouseDown = (e) => {
    // Check if it's a right-click (button 2)
    if (e.evt.button === 2) {
      e.evt.preventDefault() // Prevent context menu
      
      const stage = stageRef.current
      if (stage) {
        setIsPanning(true)
        setLastPointerPosition(stage.getPointerPosition())
        
        // Change cursor style
        document.body.style.cursor = 'grabbing'
      }
    }
  }
  
  const handleMouseUp = (e) => {
    // End panning on any mouse button release
    setIsPanning(false)
    document.body.style.cursor = 'default'
  }
  
  const handleMouseMove = (e) => {
    if (!isPanning) return
    
    const stage = stageRef.current
    if (stage) {
      const pointer = stage.getPointerPosition()
      const dx = pointer.x - lastPointerPosition.x
      const dy = pointer.y - lastPointerPosition.y
      
      setStagePos({
        x: stagePos.x + dx,
        y: stagePos.y + dy
      })
      
      setLastPointerPosition(pointer)
    }
  }
  
  // Prevent context menu from appearing on right-click
  const handleContextMenu = (e) => {
    e.evt.preventDefault()
  }
  
  // Handle zoom reset
  const handleResetZoom = () => {
    setScale(1)
    setStagePos({ x: 0, y: 0 })
  }
  
  // Handle fit to screen
  const handleFitToScreen = () => {
    // Simple implementation - you might want to calculate based on content bounds
    setScale(0.8)
    setStagePos({ x: dimensions.width / 10, y: dimensions.height / 10 })
  }

  // Don't render anything until component is mounted on client
  if (!isMounted) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading canvas...</div>
  }

  return (
    <div className="konva-container relative w-full h-full">
      {/* Zoom info overlay */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm z-10">
        <div className="text-sm text-gray-700">Zoom: {Math.round(scale * 100)}%</div>
        <div className="flex items-center space-x-2 mt-1">
          <button 
            onClick={handleFitToScreen}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Fit
          </button>
          <button 
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-sm z-10 text-xs text-gray-600">
        <p>Mouse wheel to zoom</p>
        <p>Right-click + drag to pan</p>
      </div>
      
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
      >
        <Layer>
          {/* Example shapes */}
          <Rect
            x={50}
            y={50}
            width={100}
            height={100}
            fill="#0ea5e9"
            shadowBlur={5}
            cornerRadius={5}
          />
          <Circle 
            x={250} 
            y={100} 
            radius={50} 
            fill="#10b981" 
          />
          <Line
            points={[400, 50, 450, 100, 500, 50, 550, 150]}
            stroke="#f59e0b"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
          
          {/* Add more shapes in different areas to demonstrate panning */}
          <Rect
            x={-200}
            y={-150}
            width={120}
            height={80}
            fill="#8b5cf6"
            shadowBlur={5}
            cornerRadius={5}
          />
          
          <Circle 
            x={600} 
            y={400} 
            radius={70} 
            fill="#ef4444" 
          />
          
          <Line
            points={[-100, 300, 0, 350, 100, 300, 200, 400]}
            stroke="#ec4899"
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default KonvaTestCanvas
