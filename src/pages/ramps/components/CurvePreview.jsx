// app/ramps/components/CurvePreview.jsx
'use client'
import React, { useRef, useEffect } from 'react'
import { samplingFunctions } from '../utils/colorUtils'

const CurvePreview = ({ 
  samplingFunction = 'linear', 
  powerValue = 2.0, 
  sampleCount = 11,
  width = 200,
  height = 60
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Get container width for responsive sizing
    const containerWidth = containerRef.current.clientWidth
    const actualWidth = Math.max(containerWidth - 20, 180) // Account for padding, min width
    
    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = actualWidth * dpr
    canvas.height = height * dpr
    canvas.style.width = `${actualWidth}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, actualWidth, height)

    // Draw background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, actualWidth, height)

    // Draw grid lines
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    
    // Vertical grid lines
    for (let i = 1; i < 4; i++) {
      const x = (i / 4) * actualWidth
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 3; i++) {
      const y = (i / 3) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(actualWidth, y)
      ctx.stroke()
    }

    ctx.setLineDash([]) // Reset dash

    // Draw axes
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 2
    ctx.beginPath()
    // Bottom edge (x-axis)
    ctx.moveTo(0, height)
    ctx.lineTo(actualWidth, height)
    // Left edge (y-axis) - moved slightly right for visibility
    ctx.moveTo(2, 0)
    ctx.lineTo(2, height)
    ctx.stroke()

    // Get sampling function
    const func = samplingFunctions[samplingFunction]

    // Draw curve
    ctx.strokeStyle = '#4a9eff'
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let x = 2; x <= actualWidth; x += 1) { // Start from x=2 to avoid axis
      const t = (x - 2) / (actualWidth - 2)
      let mappedT
      
      if (samplingFunction === 'linear') {
        mappedT = func(t)
      } else {
        mappedT = func(t, powerValue)
      }
      
      const y = (1 - mappedT) * height
      
      if (x === 2) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // Draw sample points
    ctx.fillStyle = '#ff6b6b'
    for (let i = 0; i < sampleCount; i++) {
      const t = sampleCount === 1 ? 0 : i / (sampleCount - 1)
      let mappedT
      
      if (samplingFunction === 'linear') {
        mappedT = func(t)
      } else {
        mappedT = func(t, powerValue)
      }
      
      const x = 2 + t * (actualWidth - 2) // Account for axis offset
      const y = (1 - mappedT) * height

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

  }, [samplingFunction, powerValue, sampleCount, width, height])

  return (
    <div className="curve-preview-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="curve-preview-canvas"
        style={{ 
          background: '#1a1a1a',
          borderRadius: '6px',
          border: '1px solid #333',
          width: '100%',
          display: 'block'
        }}
      />
    </div>
  )
}

export default CurvePreview
