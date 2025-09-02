// app/ramps/components/GradientCanvas.jsx
'use client'
import React, { useRef, useEffect } from 'react'

// Gradient Canvas Component with range overlays and sample points
const GradientCanvas = ({ 
	image, 
	onCanvasReady, 
	samplingRange = { start: 0, end: 100 },
	samplePositions = []
}) => {
	const canvasRef = useRef(null)
	const containerRef = useRef(null)

	useEffect(() => {
		if (image && canvasRef.current) {
			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')

			// Fixed canvas dimensions to prevent layout shifts
			const fixedWidth = 800
			const fixedHeight = 100

			canvas.width = fixedWidth
			canvas.height = fixedHeight

			// Always fill the entire canvas with the gradient/image
			// If it's a small palette image (like 11x1), sample colors and create gradient
			if (image.width <= 20 || image.height <= 20) {
				// Create temporary canvas to sample the small image
				const tempCanvas = document.createElement('canvas')
				const tempCtx = tempCanvas.getContext('2d')
				tempCanvas.width = image.width
				tempCanvas.height = image.height
				tempCtx.drawImage(image, 0, 0)

				// Sample colors across the width
				const colors = []
				const sampleCount = Math.min(image.width, 11) // Max 11 colors

				for (let i = 0; i < sampleCount; i++) {
					const x = Math.floor((i / (sampleCount - 1)) * (image.width - 1))
					const y = Math.floor(image.height / 2) // Sample from middle row
					const pixel = tempCtx.getImageData(x, y, 1, 1).data
					const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1]
						.toString(16)
						.padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
					colors.push(hex)
				}

				// Create gradient from sampled colors - fill entire canvas
				const gradient = ctx.createLinearGradient(0, 0, fixedWidth, 0)
				colors.forEach((color, index) => {
					const position = index / (colors.length - 1)
					gradient.addColorStop(position, color)
				})

				ctx.fillStyle = gradient
				ctx.fillRect(0, 0, fixedWidth, fixedHeight)
			} else {
				// For larger images, stretch to fill the entire canvas
				ctx.fillStyle = '#1a1a1a'
				ctx.fillRect(0, 0, fixedWidth, fixedHeight)

				// Draw image stretched to fill entire canvas
				ctx.drawImage(image, 0, 0, fixedWidth, fixedHeight)
			}

			if (onCanvasReady) {
				onCanvasReady(canvas, ctx)
			}
		}
	}, [image, onCanvasReady])

	// Calculate overlay positions for excluded ranges
	const leftOverlayWidth = samplingRange.start
	const rightOverlayLeft = samplingRange.end
	const rightOverlayWidth = 100 - samplingRange.end

	return (
		<div className='gradient-preview' ref={containerRef}>
			<div className='canvas-container' style={{ position: 'relative' }}>
				<canvas ref={canvasRef} className='gradient-canvas' />
				
				{/* Range overlays to show excluded areas */}
				{leftOverlayWidth > 0 && (
					<div 
						className='range-overlay'
						style={{
							left: 0,
							width: `${leftOverlayWidth}%`,
							backgroundColor: 'rgba(74, 158, 255, 0.2)',
							borderRight: '2px solid #4a9eff'
						}}
					/>
				)}
				
				{rightOverlayWidth > 0 && (
					<div 
						className='range-overlay'
						style={{
							left: `${rightOverlayLeft}%`,
							width: `${rightOverlayWidth}%`,
							backgroundColor: 'rgba(74, 158, 255, 0.2)',
							borderLeft: '2px solid #4a9eff'
						}}
					/>
				)}

				{/* Sample points */}
				{samplePositions.map((position, index) => (
					<div
						key={index}
						className='sample-point'
						style={{
							left: `${position * 100}%`,
						}}
						data-index={index}
					/>
				))}
			</div>
		</div>
	)
}

export default GradientCanvas

