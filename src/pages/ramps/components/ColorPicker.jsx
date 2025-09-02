// app/ramps/components/ColorPicker.jsx
'use client'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
	hsvToRgb,
	rgbToHsv,
	rgbToHex,
	hexToRgb,
	rgbToLab,
	labToRgb,
	calculateLuminance,
	isValidHex,
} from '../utils/colorUtils'
import { showNotification, copyToClipboard } from '../utils/performanceUtils'
import { useEnvironment } from '../hooks/useEnvironment'

const ColorPicker = ({
	selectedColors = [],
	onColorsChange,
	luminanceMode = 'ciel',
	onLuminanceModeChange,
}) => {
	// Environment utilities
	const { testingMode } = useEnvironment()
	
	// Current color state
	const [currentHue, setCurrentHue] = useState(0)
	const [currentSaturation, setCurrentSaturation] = useState(100)
	const [currentValue, setCurrentValue] = useState(100)
	const [currentLuminance, setCurrentLuminance] = useState(50)
	const [hexInput, setHexInput] = useState('#ff0000')

	// Responsive state for layout
	const [isHorizontalLayout, setIsHorizontalLayout] = useState(false)

	// Interaction state
	const [isDraggingHue, setIsDraggingHue] = useState(false)
	const [isDraggingSV, setIsDraggingSV] = useState(false)
	const [isDraggingLuminance, setIsDraggingLuminance] = useState(false)

	// Refs for sliders and layout detection
	const hueSliderRef = useRef(null)
	const svPickerRef = useRef(null)
	const luminanceSliderRef = useRef(null)
	const colorWorkspaceRef = useRef(null)
	const pickerInterfaceRef = useRef(null)

	// Update color when HSV values change - now updates in real-time during dragging
	useEffect(() => {
		const rgb = hsvToRgb(currentHue, currentSaturation, currentValue)
		const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
		const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b, luminanceMode)

		// Only update luminance if we're not currently dragging the luminance slider
		// This prevents infinite loops when the luminance slider changes trigger HSV updates
		if (!isDraggingLuminance) {
			setCurrentLuminance(luminance)
		}
		setHexInput(hex)
	}, [
		currentHue,
		currentSaturation,
		currentValue,
		luminanceMode,
		isDraggingLuminance,
	])

	// Listen for screen size changes to update layout
	useEffect(() => {
		const updateLayout = () => {
			// Check if color-workspace content has wrapped
			if (colorWorkspaceRef.current) {
				const workspace = colorWorkspaceRef.current
				const svPicker = workspace.querySelector('.sv-picker-modern')
				const sideControls = workspace.querySelector('.side-controls')

				if (svPicker && sideControls) {
					// Get the positions of the SV picker and side controls
					const svRect = svPicker.getBoundingClientRect()
					const sideRect = sideControls.getBoundingClientRect()
					const workspaceRect = workspace.getBoundingClientRect()

					// More robust wrapping detection:
					// 1. Check if side controls are below the SV picker (wrapped)
					// 2. OR if workspace is too narrow (< 380px for comfortable layout)
					// 3. OR if picker interface itself is too narrow
					const hasWrappedVertically = sideRect.top > svRect.bottom + 10
					const isWorkspaceNarrow = workspaceRect.width < 380
					const isPanelSquished =
						pickerInterfaceRef.current &&
						pickerInterfaceRef.current.getBoundingClientRect().width < 550

					const hasWrapped =
						hasWrappedVertically || isWorkspaceNarrow || isPanelSquished

					// Only update if the state has actually changed to avoid unnecessary re-renders
					setIsHorizontalLayout((prev) => {
						if (prev !== hasWrapped) {
							console.log(
								`🎨 Layout switched to: ${
									hasWrapped ? 'HORIZONTAL' : 'VERTICAL'
								}`,
								{
									workspaceWidth: workspaceRect.width,
									pickerInterfaceWidth:
										pickerInterfaceRef.current?.getBoundingClientRect().width,
									wrappedVertically: hasWrappedVertically,
									workspaceNarrow: isWorkspaceNarrow,
									panelSquished: isPanelSquished,
								}
							)
							return hasWrapped
						}
						return prev
					})
				}
			}
		}

		// Set initial state
		setTimeout(updateLayout, 100) // Small delay to ensure DOM is rendered

		// Use ResizeObserver for more accurate layout detection
		const resizeObserver = new ResizeObserver(() => {
			// Debounce the update to avoid excessive calls
			clearTimeout(updateLayout.timeoutId)
			updateLayout.timeoutId = setTimeout(updateLayout, 50)
		})

		if (colorWorkspaceRef.current) {
			resizeObserver.observe(colorWorkspaceRef.current)
		}

		if (pickerInterfaceRef.current) {
			resizeObserver.observe(pickerInterfaceRef.current)
		}

		// Fallback: also listen for window resize
		window.addEventListener('resize', updateLayout)

		// Cleanup
		return () => {
			resizeObserver.disconnect()
			window.removeEventListener('resize', updateLayout)
			clearTimeout(updateLayout.timeoutId)
		}
	}, [])

	// Update color when luminance changes (for CIE L* mode) - optimized
	const updateColorWithLuminance = useCallback(
		(newLuminance) => {
			if (luminanceMode === 'hsv') {
				// In HSV mode, luminance directly controls the V (value) component
				setCurrentValue(newLuminance)
			} else {
				// CIE L* mode - use LAB color space conversion
				// Only do expensive calculations if we're actually in CIE L* mode
				const currentRgb = hsvToRgb(currentHue, currentSaturation, currentValue)
				const lab = rgbToLab(currentRgb.r, currentRgb.g, currentRgb.b)

				// Update LAB with new luminance
				lab.L = newLuminance

				// Convert back to RGB
				const newRgb = labToRgb(lab.L, lab.A, lab.B)

				// Convert RGB back to HSV to keep sliders in sync
				const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)

				// Batch state updates to avoid multiple re-renders
				setCurrentHue(newHsv.h)
				setCurrentSaturation(newHsv.s)
				setCurrentValue(newHsv.v)
			}
		},
		[currentHue, currentSaturation, currentValue, luminanceMode]
	)

	// Mouse event handlers
	const handleMouseDown = useCallback((type, e) => {
		e.preventDefault()
		switch (type) {
			case 'hue':
				setIsDraggingHue(true)
				updateHueFromEvent(e)
				break
			case 'sv':
				setIsDraggingSV(true)
				updateSVFromEvent(e)
				break
			case 'luminance':
				setIsDraggingLuminance(true)
				updateLuminanceFromEvent(e)
				break
		}
	}, [])

	const handleMouseMove = useCallback(
		(e) => {
			// Use requestAnimationFrame for smooth performance
			requestAnimationFrame(() => {
				if (isDraggingHue) updateHueFromEvent(e)
				if (isDraggingSV) updateSVFromEvent(e)
				if (isDraggingLuminance) updateLuminanceFromEvent(e)
			})
		},
		[isDraggingHue, isDraggingSV, isDraggingLuminance]
	)

	const handleMouseUp = useCallback(() => {
		setIsDraggingHue(false)
		setIsDraggingSV(false)
		setIsDraggingLuminance(false)
	}, [])

	// Attach global mouse events
	useEffect(() => {
		if (isDraggingHue || isDraggingSV || isDraggingLuminance) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)

			return () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleMouseUp)
			}
		}
	}, [
		isDraggingHue,
		isDraggingSV,
		isDraggingLuminance,
		handleMouseMove,
		handleMouseUp,
	])

	// Update functions for each slider - simplified for better performance
	const updateHueFromEvent = useCallback(
		(e) => {
			if (!hueSliderRef.current) return

			const rect = hueSliderRef.current.getBoundingClientRect()

			let percentage
			if (isHorizontalLayout) {
				// Horizontal layout: use X position
				const x = e.clientX - rect.left
				percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
			} else {
				// Vertical layout: use Y position
				const y = e.clientY - rect.top
				percentage = Math.max(0, Math.min(100, (y / rect.height) * 100))
			}

			const newHue = (percentage / 100) * 360
			setCurrentHue(newHue)
		},
		[isHorizontalLayout]
	)

	const updateSVFromEvent = useCallback((e) => {
		if (!svPickerRef.current) return

		const rect = svPickerRef.current.getBoundingClientRect()
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100))
		const value = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100))

		setCurrentSaturation(saturation)
		setCurrentValue(value)
	}, [])

	const updateLuminanceFromEvent = useCallback(
		(e) => {
			if (!luminanceSliderRef.current) return

			const rect = luminanceSliderRef.current.getBoundingClientRect()

			let percentage
			if (isHorizontalLayout) {
				// Horizontal layout: use X position
				const x = e.clientX - rect.left
				percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
			} else {
				// Vertical layout: use Y position
				const y = e.clientY - rect.top
				percentage = Math.max(0, Math.min(100, (y / rect.height) * 100))
			}

			const newLuminance = 100 - percentage
			setCurrentLuminance(newLuminance)
			updateColorWithLuminance(newLuminance)
		},
		[updateColorWithLuminance, isHorizontalLayout]
	)

	// Handle hex input changes
	const handleHexInputChange = useCallback(
		(value) => {
			setHexInput(value)

			if (isValidHex(value)) {
				const rgb = hexToRgb(value)
				const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
				const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b, luminanceMode)

				setCurrentHue(hsv.h)
				setCurrentSaturation(hsv.s)
				setCurrentValue(hsv.v)
				setCurrentLuminance(luminance)
			}
		},
		[luminanceMode]
	)

	// Add current color to selection
	const addCurrentColor = useCallback(() => {
		if (selectedColors.length >= 8) {
			showNotification('Maximum 8 colors allowed!', 'error')
			return
		}

		if (selectedColors.includes(hexInput)) {
			showNotification('Color already added!', 'error')
			return
		}

		const newColors = [...selectedColors, hexInput]
		onColorsChange(newColors)
		showNotification(`Added ${hexInput}!`)
	}, [selectedColors, hexInput, onColorsChange])

	// Remove color from selection
	const removeColor = useCallback(
		(index) => {
			const removedColor = selectedColors[index]
			const newColors = selectedColors.filter((_, i) => i !== index)
			onColorsChange(newColors)
			showNotification(`Removed ${removedColor}`)
		},
		[selectedColors, onColorsChange]
	)

	// Clear all colors
	const clearAllColors = useCallback(() => {
		if (selectedColors.length === 0) return
		onColorsChange([])
		showNotification('All colors cleared')
	}, [selectedColors, onColorsChange])

	// Generate luminance slider background - memoized for performance
	const luminanceSliderBackground = useMemo(() => {
		// Use state to determine gradient direction
		const gradientDirection = isHorizontalLayout ? 'to right' : 'to bottom'

		if (luminanceMode === 'hsv') {
			// HSV mode: gradient from bright color (top/left, V=100) to black (bottom/right, V=0)
			// Use current hue and saturation, vary only the Value component
			const brightRgb = hsvToRgb(currentHue, currentSaturation, 100)
			const brightHex = rgbToHex(brightRgb.r, brightRgb.g, brightRgb.b)
			return `linear-gradient(${gradientDirection}, ${brightHex} 0%, #000000 100%)`
		} else {
			// CIE L* mode: show luminance range for current hue at current saturation
			const baseRgb = hsvToRgb(currentHue, currentSaturation, currentValue)

			// Calculate high and low luminance colors
			const highLab = rgbToLab(baseRgb.r, baseRgb.g, baseRgb.b)
			const lowLab = { ...highLab }

			highLab.L = 95
			lowLab.L = 5

			const highRgb = labToRgb(highLab.L, highLab.A, highLab.B)
			const lowRgb = labToRgb(lowLab.L, lowLab.A, lowLab.B)

			const highHex = rgbToHex(highRgb.r, highRgb.g, highRgb.b)
			const lowHex = rgbToHex(lowRgb.r, lowRgb.g, lowRgb.b)

			return `linear-gradient(${gradientDirection}, ${highHex} 0%, ${lowHex} 100%)`
		}
	}, [
		currentHue,
		currentSaturation,
		currentValue,
		luminanceMode,
		isHorizontalLayout,
	])

	// Generate SV picker background color - memoized for performance
	const svPickerBackground = useMemo(() => {
		const hueRgb = hsvToRgb(currentHue, 100, 100)
		return rgbToHex(hueRgb.r, hueRgb.g, hueRgb.b)
	}, [currentHue])

	return (
		<div className='modern-color-picker'>
			{/* Header */}
			<div className='picker-header'>
				<div className='picker-title'>
					<span className='icon'>🎨</span>
					<span>Color Picker</span>
					{/* Layout indicator - can be removed later */}
					{testingMode && (
						<span
							style={{
								fontSize: '10px',
								color: isHorizontalLayout ? '#ff6b6b' : '#4a9eff',
								marginLeft: '8px',
								fontWeight: 'bold',
							}}
						>
							{isHorizontalLayout ? 'H' : 'V'}
						</span>
					)}
				</div>
				<div className='luminance-toggle'>
					<span className='toggle-label'>Luminance:</span>
					<div className='toggle-buttons'>
						<button
							className={`toggle-btn ${
								luminanceMode === 'hsv' ? 'active' : ''
							}`}
							onClick={() => onLuminanceModeChange('hsv')}
						>
							HSV
						</button>
						<button
							className={`toggle-btn ${
								luminanceMode === 'ciel' ? 'active' : ''
							}`}
							onClick={() => onLuminanceModeChange('ciel')}
						>
							CIE&nbsp;L*
						</button>
					</div>
				</div>
			</div>

			{/* Main Picker Interface */}
			<div className='picker-interface' ref={pickerInterfaceRef}>
				{/* Color Workspace */}
				<div
					className={`color-workspace ${isHorizontalLayout ? 'wrapped' : ''}`}
					ref={colorWorkspaceRef}
				>
					{/* SV Picker - Main Color Square */}
					<div
						className='sv-picker-modern'
						ref={svPickerRef}
						style={{ backgroundColor: svPickerBackground }}
						onMouseDown={(e) => handleMouseDown('sv', e)}
						onClick={updateSVFromEvent}
					>
						<div
							className='sv-handle'
							style={{
								left: `${currentSaturation}%`,
								top: `${100 - currentValue}%`,
							}}
						/>
					</div>

					{/* Side Controls */}
					<div
						className={`side-controls ${
							isHorizontalLayout ? 'horizontal' : 'vertical'
						}`}
					>
						{/* Hue Slider */}
						<div
							className='hue-slider-modern'
							ref={hueSliderRef}
							onMouseDown={(e) => handleMouseDown('hue', e)}
							onClick={updateHueFromEvent}
						>
							<div
								className='hue-handle'
								style={
									isHorizontalLayout
										? { 
												left: `${(currentHue / 360) * 100}%`,
												top: '50%',
												transform: 'translateY(-50%)'
											}
										: { 
												top: `${(currentHue / 360) * 100}%`,
												left: '50%',
												transform: 'translateX(-50%)'
											}
								}
							/>
						</div>

						{/* Luminance Slider */}
						<div
							className='luminance-slider-modern'
							ref={luminanceSliderRef}
							style={{ background: luminanceSliderBackground }}
							onMouseDown={(e) => handleMouseDown('luminance', e)}
							onClick={updateLuminanceFromEvent}
						>
							<div
								className='luminance-handle'
								style={
									isHorizontalLayout
										? { 
												left: `${100 - currentLuminance}%`,
												top: '50%',
												transform: 'translateY(-50%)'
											}
										: { 
												top: `${100 - currentLuminance}%`,
												left: '50%',
												transform: 'translateX(-50%)'
											}
								}
							/>
						</div>
					</div>
				</div>

				{/* Color Info Panel */}
				<div className='color-info-panel'>
					{/* Current Color Preview */}
					<div className='current-color-section'>
						<div
							className='color-preview-modern'
							style={{ backgroundColor: hexInput }}
							title='Current color'
						/>
						<div className='color-details'>
							<input
								type='text'
								className='hex-input-modern'
								value={hexInput}
								onChange={(e) => handleHexInputChange(e.target.value)}
								placeholder='#ffffff'
							/>
							<div className='color-values'>
								<div className='value-row'>
									<span className='label'>HSV:</span>
									<span className='value'>
										{Math.round(currentHue)}°, {Math.round(currentSaturation)}%,{' '}
										{Math.round(currentValue)}%
									</span>
								</div>
								{luminanceMode === 'ciel' && (
									<div className='value-row'>
										<span className='label'>L*:</span>
										<span className='value'>
											{Math.round(currentLuminance)}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Add Color Button */}
					<button
						className='add-color-btn'
						onClick={addCurrentColor}
						disabled={selectedColors.length >= 8}
					>
						<span className='btn-icon'>+</span>
						<span>Add Color</span>
						<span className='btn-count'>({selectedColors.length}/8)</span>
					</button>
				</div>
			</div>

			{/* Selected Colors Palette */}
			<div className='selected-palette'>
				<div className='palette-header'>
					<span className='palette-title'>Color Palette</span>
					{selectedColors.length > 0 && (
						<button className='clear-palette-btn' onClick={clearAllColors}>
							Clear All
						</button>
					)}
				</div>

				<div className='palette-grid'>
					{selectedColors.length === 0 ? (
						<div className='empty-palette'>
							<div className='empty-icon'>🎨</div>
							<div className='empty-text'>No colors selected yet</div>
							<div className='empty-hint'>
								Pick colors above to build your palette
							</div>
						</div>
					) : (
						<>
							{/* Color Chips */}
							{selectedColors.map((color, index) => (
								<div
									key={index}
									className='color-chip-modern'
									style={{ backgroundColor: color }}
									onClick={() => copyToClipboard(color, `${color} copied!`)}
									title={`${color} - Click to copy`}
								>
									<button
										className='remove-chip-btn'
										onClick={(e) => {
											e.stopPropagation()
											removeColor(index)
										}}
										title='Remove color'
									>
										×
									</button>
									<div className='chip-label'>{color}</div>
								</div>
							))}

							{/* Gradient Preview - Temporarily disabled */}
							{/* selectedColors.length > 1 && (
                <div
                  className="gradient-chip-modern"
                  style={{
                    background: `linear-gradient(90deg, ${selectedColors
                      .map((color, index) => {
                        const position = (index / (selectedColors.length - 1)) * 100
                        return `${color} ${position}%`
                      })
                      .join(', ')})`
                  }}
                  onClick={() => {
                    copyToClipboard(
                      selectedColors.join(', '), 
                      'Gradient colors copied!'
                    )
                  }}
                  title="Click to copy gradient colors"
                >
                  <div className="gradient-label">
                    <span className="gradient-icon">🌈</span>
                    <span>Gradient ({selectedColors.length} colors)</span>
                  </div>
                </div>
              ) */}
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default ColorPicker

