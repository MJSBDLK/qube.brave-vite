// src/pages/ramps/GradientColorSampler.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import GradientCanvas from './components/GradientCanvas'
import CurvePreview from './components/CurvePreview'
import SavedRamps from './components/SavedRamps'
import ColorPicker from './components/ColorPicker'
import { useColorSampling } from './hooks/useColorSampling'
import { useSavedRamps } from './hooks/useSavedRamps'
import { useEnvironment } from './hooks/useEnvironment'
import { parseHexColors, calculateLuminance } from './utils/colorUtils'
import {
	debounce,
	showNotification,
	copyToClipboard,
	resizeImageIfNeeded,
	PerformanceIndicator,
} from './utils/performanceUtils.jsx'

// Main Component
const GradientColorSampler = () => {
	// Environment and testing utilities
	const { testingMode } = useEnvironment()
	
	// #region State Management
	const [showColorPicker, setShowColorPicker] = useState(
		testingMode ? true : false
	)
	const [hexInput, setHexInput] = useState('')
	const [colorsArray, setSelectedColors] = useState([])
	const [samplingRange, setSamplingRange] = useState({ start: 0, end: 100 })
	const [samplingFunction, setSamplingFunction] = useState('linear')
	const [powerValue, setPowerValue] = useState(2.0)
	const [showPowerSlider, setShowPowerSlider] = useState(false)
	const [showChangelogCollapsed, setShowChangelogCollapsed] = useState(true)
	const [processing, setProcessing] = useState(false)
	const [sampleCount, setSampleCount] = useState(11)
	const [gradientImage, setGradientImage] = useState(null)
	const [rampName, setRampName] = useState('')
	const [stepValue, setStepValue] = useState(0.1)
	const [showLuminance, setShowLuminance] = useState('none')
	const [comparisonRamp, setComparisonRamp] = useState(null)
	const [showComparisonSection, setShowComparisonSection] = useState(false)
	const [showSavedRamps, setShowSavedRamps] = useState(true)

	// Use the color sampling hook
	const {
		generatedColors,
		samplePositions,
		isProcessing: samplingProcessing,
		luminanceMode,
		setCanvasRef,
		debouncedGenerateSwatch,
		throttledGenerateSwatch,
		reverseColors,
		clearSwatch,
		updateLuminanceMode,
		exportAsPNG,
		exportAsGPL,
		hasColors,
		colorCount,
	} = useColorSampling()

	// Use the saved ramps hook
	const {
		savedRamps,
		isLoading: rampsLoading,
		saveCurrentRamp,
		updateSavedRamp,
		deleteSavedRamp,
		duplicateRamp,
		exportRamps,
		exportRampsAsGPL,
		exportRampsAsPNG,
		importRamps,
		clearRamps,
		reorderRamps,
		reverseSavedRamp,
		reverseAllRamps,
	} = useSavedRamps()
	// #endregion /State Management

	// Handle PNG upload with performance optimization
	const handleImageUpload = useCallback((file) => {
		setProcessing(true)
		showNotification('Loading image...')

		const img = new Image()
		img.onload = () => {
			// Resize large images for better performance
			const optimizedImg = resizeImageIfNeeded(img)
			setGradientImage(optimizedImg)
			setProcessing(false)
			showNotification('Image loaded successfully!')
		}
		img.onerror = () => {
			setProcessing(false)
			showNotification('Failed to load image', 'error')
		}
		img.src = URL.createObjectURL(file)
	}, [])

	// Handle GPL import
	const handleGPLImport = useCallback((file) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const gplContent = e.target.result
				// TODO: Parse GPL file and import ramps
				console.log('GPL content:', gplContent)
				showNotification('GPL import not yet implemented', 'error')
			} catch (error) {
				console.error('Failed to parse GPL file:', error)
				showNotification('Failed to parse GPL file', 'error')
			}
		}
		reader.readAsText(file)
	}, [])

	// Handle hex input colors with debouncing
	const handleHexInputChange = useCallback((value) => {
		setHexInput(value)
		const colors = parseHexColors(value)
		setSelectedColors(colors)

		// Debounce gradient creation for better performance
		debounce(
			'hex-gradient',
			() => {
				if (validateColors(colors)) {
					createCanvasGradient(colors)
				}
			},
			300
		)
	}, [])

	// Handle color picker changes
	const handleColorPickerChange = useCallback((colors) => {
		setSelectedColors(colors)
		setHexInput(colors.join(', '))

		// Debounce gradient creation for better performance
		debounce(
			'picker-gradient',
			() => {
				if (validateColors(colors)) {
					createCanvasGradient(colors)
				}
			},
			300
		)
	}, [])

	const validateColors = (colorsArray) => {
		if (!colorsArray || colorsArray.length < 2 || colorsArray.length > 8) {
			return false
		}

		return colorsArray.every(
			(color) =>
				typeof color === 'string' &&
				color.startsWith('#') &&
				(/^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color))
		)
	}

	const createCanvasGradient = useCallback((colors) => {
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		const width = 800
		const height = 100

		canvas.width = width
		canvas.height = height

		const gradient = ctx.createLinearGradient(0, 0, width, 0)
		colors.forEach((color, index) => {
			const position = index / (colors.length - 1)
			gradient.addColorStop(position, color)
		})

		ctx.fillStyle = gradient
		ctx.fillRect(0, 0, width, height)

		canvas.toBlob((blob) => {
			const url = URL.createObjectURL(blob)
			const img = new Image()
			img.onload = () => {
				setGradientImage(img)
				URL.revokeObjectURL(url)
			}
			img.src = url
		})
	}, [])

	const handleFunctionChange = useCallback(
		(value) => {
			setSamplingFunction(value)
			setShowPowerSlider(
				value === 'customExponent' || value === 'customParametric'
			)

			// Trigger swatch regeneration if we have an image
			if (gradientImage) {
				debouncedGenerateSwatch({
					startRange: samplingRange.start,
					endRange: samplingRange.end,
					samplingFunction: value,
					powerValue: powerValue,
					sampleCount,
				})
			}
		},
		[
			gradientImage,
			samplingRange,
			powerValue,
			sampleCount,
			debouncedGenerateSwatch,
		]
	)

	// Handle range changes with throttling for smooth updates
	const handleRangeChange = useCallback(
		(field, value) => {
			setSamplingRange((prev) => {
				const newRange = { ...prev, [field]: parseFloat(value) }

				// Validate range order
				if (field === 'start' && newRange.start > newRange.end) {
					newRange.end = newRange.start
				} else if (field === 'end' && newRange.end < newRange.start) {
					newRange.start = newRange.end
				}

				// Trigger swatch regeneration if we have an image
				if (gradientImage) {
					throttledGenerateSwatch({
						startRange: newRange.start,
						endRange: newRange.end,
						samplingFunction,
						powerValue,
						sampleCount,
					})
				}

				return newRange
			})
		},
		[
			gradientImage,
			samplingFunction,
			powerValue,
			sampleCount,
			throttledGenerateSwatch,
		]
	)

	// Handle power value changes
	const handlePowerChange = useCallback(
		(value) => {
			setPowerValue(value)

			if (gradientImage) {
				debouncedGenerateSwatch({
					startRange: samplingRange.start,
					endRange: samplingRange.end,
					samplingFunction,
					powerValue: value,
					sampleCount,
				})
			}
		},
		[
			gradientImage,
			samplingRange,
			samplingFunction,
			sampleCount,
			debouncedGenerateSwatch,
		]
	)

	// Handle step value changes
	const handleStepChange = useCallback((value) => {
		setStepValue(value)
	}, [])

	// Helper function to determine decimal places based on step value
	const getDecimalPlaces = useCallback((step) => {
		const stepStr = step.toString()
		if (stepStr.includes('.')) {
			return stepStr.split('.')[1].length
		}
		return 0
	}, [])

	// Handle show luminance dropdown changes
	const handleShowLuminanceChange = useCallback((value) => {
		setShowLuminance(value)
	}, [])

	// Handle comparison ramp selection
	const handleComparisonSelect = useCallback((ramp) => {
		setComparisonRamp(ramp)
		setShowComparisonSection(true)
	}, [])

	// Handle canvas ready callback
	const handleCanvasReady = useCallback(
		(canvas, ctx) => {
			setCanvasRef(canvas, ctx)

			// Generate initial swatch
			debouncedGenerateSwatch({
				startRange: samplingRange.start,
				endRange: samplingRange.end,
				samplingFunction,
				powerValue,
				sampleCount,
			})
		},
		[
			setCanvasRef,
			samplingRange,
			samplingFunction,
			powerValue,
			sampleCount,
			debouncedGenerateSwatch,
		]
	)

	// Copy color to clipboard
	const handleColorClick = useCallback((color) => {
		copyToClipboard(color.hex, `${color.hex} copied!`)
	}, [])

	// #region Saved Ramps Handlers

	// Save current gradient as a ramp
	const handleSaveCurrentRamp = useCallback(() => {
		if (!hasColors) {
			showNotification('No gradient to save', 'error')
			return
		}

		if (!rampName.trim()) {
			showNotification('Please enter a ramp name', 'error')
			return
		}

		const rampData = {
			name: rampName.trim(),
			colors: generatedColors.map((c) => c.hex),
			sampleCount,
			samplingFunction,
			powerValue,
			luminanceMode,
			samplingRange,
			sourceType: gradientImage ? 'image' : 'colors',

			// Derivation metadata for re-sampling
			originalColors: colorsArray, // Original input colors
			hexInput: hexInput, // Original hex input string
			gradientImage: gradientImage ? 'stored' : null, // Indicate if from image
		}

		saveCurrentRamp(rampData)
		setRampName('') // Clear the input after saving
	}, [
		hasColors,
		rampName,
		generatedColors,
		sampleCount,
		samplingFunction,
		powerValue,
		luminanceMode,
		samplingRange,
		gradientImage,
		colorsArray,
		hexInput,
		saveCurrentRamp,
	])

	// Create test ramps for debugging
	const createTestRamps = useCallback(() => {
		const testRamps = [
			{
				name: 'Test Ramp 1',
				colors: ['#ff0000', '#00ff00', '#0000ff'],
				sampleCount: 11,
				samplingFunction: 'linear',
				powerValue: 2.0,
				luminanceMode: 'hsv',
				samplingRange: { start: 0, end: 100 },
				sourceType: 'colors',
			},
			{
				name: 'Test Ramp 2',
				colors: ['#ffff00', '#ff00ff', '#00ffff'],
				sampleCount: 11,
				samplingFunction: 'linear',
				powerValue: 2.0,
				luminanceMode: 'hsv',
				samplingRange: { start: 0, end: 100 },
				sourceType: 'colors',
			},
			{
				name: 'Test Ramp 3',
				colors: ['#ffffff', '#000000'],
				sampleCount: 11,
				samplingFunction: 'linear',
				powerValue: 2.0,
				luminanceMode: 'hsv',
				samplingRange: { start: 0, end: 100 },
				sourceType: 'colors',
			},
		]

		testRamps.forEach((ramp) => saveCurrentRamp(ramp))
	}, [saveCurrentRamp])

	// Load a saved ramp
	const handleLoadRamp = useCallback(
		(ramp) => {
			// Set all the parameters from the saved ramp
			setSampleCount(ramp.sampleCount || 11)
			setSamplingFunction(ramp.samplingFunction || 'linear')
			setPowerValue(ramp.powerValue || 2.0)
			updateLuminanceMode(ramp.luminanceMode || 'hsv')
			setSamplingRange(ramp.samplingRange || { start: 0, end: 100 })

			// Set the colors and create a gradient
			if (ramp.colors && ramp.colors.length > 0) {
				const colorsString = ramp.colors.join(', ')
				handleHexInputChange(colorsString)
			}

			showNotification(`Loaded "${ramp.name}"`, 'success')
		},
		[
			setSampleCount,
			setSamplingFunction,
			setPowerValue,
			updateLuminanceMode,
			setSamplingRange,
			handleHexInputChange,
		]
	)

	// #endregion

	return (
		<>
			<div id='ramps-page-container' className='ramps-page-container'>
				{/* Performance Indicator */}
				<PerformanceIndicator
					isProcessing={processing || samplingProcessing}
					message={processing ? 'Loading image...' : 'Generating swatch...'}
				/>
				<div className='main-grid'>
					{/* Main Sampler - Left Column */}
					<div
						id='gradient-sampler-main'
						className={`gradient-sampler ${
							showSavedRamps ? 'with-saved-ramps' : 'full-width'
						}`}
					>
						{/* Upload Section */}
						<div className='upload-section'>
							<div className='section-header'>
								<h2>
									Color Ramp Generator
									{testingMode && (
										<span 
											id="test-indicator" 
											className="test-element" 
											style={{
												fontSize: '10px', 
												color: 'rgb(255, 107, 107)', 
												marginLeft: '8px', 
												fontWeight: 'bold'
											}}
										>
											H
										</span>
									)}
								</h2>
								<button
									className='toggle-saved-ramps-btn'
									onClick={() => setShowSavedRamps(!showSavedRamps)}
									title={showSavedRamps ? 'Hide saved ramps panel' : 'Show saved ramps panel'}
								>
									{showSavedRamps ? '🗂️ Hide Ramps' : '🗂️ Show Ramps'}
								</button>
							</div>
							<div className='upload-grid'>
								<div className='upload-item'>
									<label className='upload-label'>PNG Image</label>
									<FileUpload
										accept='image/png'
										onFileSelect={handleImageUpload}
										buttonText='Choose PNG'
										infoText='Gradient to sample'
									/>
								</div>

								<div className='upload-item'>
									<label className='upload-label'>Import Ramps</label>
									<FileUpload
										accept='.gpl'
										onFileSelect={handleGPLImport}
										buttonText='Choose .gpl'
										buttonColor='#28a745'
										infoText='GIMP palette'
									/>
								</div>
							</div>

							<div className='divider'>OR</div>

							<div className='color-input-section'>
								<label className='upload-label'>Create from Colors</label>
								<div className='hex-input-row'>
									<input
										type='text'
										className='hex-input'
										placeholder='#ff0000, #00ff00, #0000ff'
										value={hexInput}
										onChange={(e) => handleHexInputChange(e.target.value)}
									/>
									<button
										className='picker-toggle-btn'
										onClick={() => setShowColorPicker(!showColorPicker)}
									>
										{showColorPicker ? '✕ Hide' : '🎨 Picker'}
									</button>
								</div>

								{showColorPicker && (
									<ColorPicker
										selectedColors={colorsArray}
										onColorsChange={handleColorPickerChange}
										luminanceMode={luminanceMode}
										onLuminanceModeChange={updateLuminanceMode}
									/>
								)}
							</div>
						</div>

						{/* Gradient Display */}
						{gradientImage && (
							<GradientCanvas
								image={gradientImage}
								onCanvasReady={handleCanvasReady}
								samplingRange={samplingRange}
								samplePositions={samplePositions}
							/>
						)}

						{/* Sampling Controls */}
						{gradientImage && (
							<div className='controls-section'>
								<div className='control-group'>
									<label>Sampling Range</label>
									<div className='range-controls'>
										<div className='range-input'>
											<label>Start:</label>
											<input
												type='range'
												min='0'
												max='100'
												step='0.1'
												value={samplingRange.start}
												onChange={(e) =>
													handleRangeChange('start', e.target.value)
												}
											/>
											<input
												type='number'
												min='0'
												max='100'
												step='0.1'
												value={samplingRange.start}
												onChange={(e) =>
													handleRangeChange('start', e.target.value)
												}
											/>
											<span>%</span>
										</div>

										<div className='range-input'>
											<label>End:</label>
											<input
												type='range'
												min='0'
												max='100'
												step='0.1'
												value={samplingRange.end}
												onChange={(e) =>
													handleRangeChange('end', e.target.value)
												}
											/>
											<input
												type='number'
												min='0'
												max='100'
												step='0.1'
												value={samplingRange.end}
												onChange={(e) =>
													handleRangeChange('end', e.target.value)
												}
											/>
											<span>%</span>
										</div>
									</div>
								</div>

								<div className='control-group'>
									<label>Sample Count: {sampleCount} colors</label>
									<input
										type='range'
										min='8'
										max='16'
										step='1'
										value={sampleCount}
										onChange={(e) => {
											const newCount = parseInt(e.target.value)
											setSampleCount(newCount)

											// Trigger swatch regeneration if we have an image
											if (gradientImage) {
												debouncedGenerateSwatch({
													startRange: samplingRange.start,
													endRange: samplingRange.end,
													samplingFunction,
													powerValue,
													sampleCount: newCount,
												})
											}
										}}
										className='sample-count-slider'
									/>
								</div>

								<div className='control-group'>
									<label>Sampling Function</label>
									<select
										value={samplingFunction}
										onChange={(e) => handleFunctionChange(e.target.value)}
										className='function-selector'
									>
										<option value='linear'>Linear</option>
										<option value='customExponent'>Custom Power</option>
										<option value='customParametric'>Custom Parametric</option>
									</select>

									{showPowerSlider && (
										<div className='power-controls'>
											<label>
												α: {powerValue.toFixed(getDecimalPlaces(stepValue))}
											</label>
											<input
												type='range'
												min='0.1'
												max='5'
												step={stepValue}
												value={powerValue}
												onChange={(e) =>
													handlePowerChange(parseFloat(e.target.value))
												}
											/>
											<div className='step-control'>
												<label>Step: </label>
												<input
													type='number'
													min='0.001'
													max='1'
													step='0.001'
													value={stepValue}
													onChange={(e) =>
														handleStepChange(parseFloat(e.target.value))
													}
													className='step-input'
												/>
											</div>
										</div>
									)}

									{/* Curve Preview */}
									<div className='curve-preview-wrapper'>
										<label>Function Curve</label>
										<CurvePreview
											samplingFunction={samplingFunction}
											powerValue={powerValue}
											sampleCount={sampleCount}
											width={200}
											height={60}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Color Swatch Display */}
						{hasColors && (
							<div className='output-section'>
								<div className='section-header'>
									<h2>Generated Swatch ({colorCount} colors)</h2>
									<div className='swatch-actions'>
										<select
											className='show-luminance-selector'
											value={showLuminance}
											onChange={(e) =>
												handleShowLuminanceChange(e.target.value)
											}
											title='Show luminance values on color tiles'
										>
											<option value='none'>Luminance</option>
											<option value='ciel'>CIE L*</option>
											<option value='hsv'>HSV</option>
										</select>
										<button
											className='control-icon-btn'
											onClick={reverseColors}
											title='Reverse Colors'
										>
											🔄
										</button>
										<button
											className='control-icon-btn'
											onClick={clearSwatch}
											title='Clear Swatch'
										>
											🗑️
										</button>
									</div>
								</div>

								<div
									className='swatch-container'
									style={{ gridTemplateColumns: `repeat(${sampleCount}, 1fr)` }}
								>
									{generatedColors.map((color, index) => (
										<div
											key={index}
											className='color-tile'
											style={{ backgroundColor: color.hex }}
											onClick={() => handleColorClick(color)}
											title={`${color.hex} (Click to copy)`}
										>
											<span className='color-index'>{index}</span>
											<span className='color-code'>{color.hex}</span>
											{showLuminance !== 'none' && (
												<span className='luminance-overlay'>
													{showLuminance === 'ciel'
														? Math.round(color.luminance_ciel || 0)
														: Math.round(color.luminance_hsv || 0)}
												</span>
											)}
										</div>
									))}
								</div>

								{/* Comparison Swatch */}
								{comparisonRamp && showComparisonSection && (
									<>
										<div
											className='swatch-container comparison-swatch'
											style={{
												gridTemplateColumns: `repeat(${
													comparisonRamp.colors?.length || sampleCount
												}, 1fr)`,
											}}
										>
											{comparisonRamp.colors?.map((hex, index) => (
												<div
													key={index}
													className='color-tile'
													style={{ backgroundColor: hex }}
													onClick={() => copyToClipboard(hex, `${hex} copied!`)}
													title={`${hex} (Click to copy)`}
												>
													<span className='color-index'>{index}</span>
													<span className='color-code'>{hex}</span>
													{showLuminance !== 'none' && (
														<span className='luminance-overlay'>
															{showLuminance === 'ciel'
																? Math.round(
																		calculateLuminance(
																			parseInt(hex.slice(1, 3), 16),
																			parseInt(hex.slice(3, 5), 16),
																			parseInt(hex.slice(5, 7), 16),
																			'ciel'
																		)
																  )
																: Math.round(
																		calculateLuminance(
																			parseInt(hex.slice(1, 3), 16),
																			parseInt(hex.slice(3, 5), 16),
																			parseInt(hex.slice(5, 7), 16),
																			'hsv'
																		)
																  )}
														</span>
													)}
												</div>
											))}
										</div>
										<div className='comparison-controls'>
											<div className='comparison-info'>
												<span className='comparison-label'>
													Comparing with: <strong>{comparisonRamp.name}</strong>
												</span>
											</div>
											<button
												className='comparison-close-btn'
												onClick={() => setShowComparisonSection(false)}
												title='Hide Comparison'
											>
												✕ Hide Comparison
											</button>
										</div>
									</>
								)}

								<div className='save-section'>
									<h3>Save Current Ramp</h3>
									<div className='save-controls'>
										<input
											type='text'
											className='ramp-name-input'
											placeholder='Enter ramp name...'
											value={rampName}
											onChange={(e) => setRampName(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === 'Enter' && rampName.trim()) {
													handleSaveCurrentRamp()
												}
											}}
										/>
										<button
											className='save-button'
											onClick={handleSaveCurrentRamp}
											disabled={!hasColors || !rampName.trim()}
											title={
												!hasColors
													? 'Generate a gradient first'
													: !rampName.trim()
													? 'Enter a ramp name'
													: 'Save this gradient as a ramp'
											}
										>
											💾
										</button>
									</div>
								</div>

								<div
									className='export-section'
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<h4>Active Ramp Export Options</h4>
									<div className='export-buttons'>
										<button
											className='export-button'
											onClick={() => exportAsGPL('gradient-swatch')}
											title='Download .gpl'
										>
											📄
										</button>
										<button
											className='export-button png-export'
											onClick={() => exportAsPNG('gradient-swatch')}
											title='Download .png'
										>
											🖼️
										</button>
										<button
											className='export-button'
											onClick={() => {
												const gplContent = generatedColors
													.map((c) => c.hex)
													.join(', ')
												copyToClipboard(
													gplContent,
													'Colors copied to clipboard!'
												)
											}}
											title='Copy Colors'
										>
											📋
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Changelog */}
						<div className='changelog-section'>
							<div
								className='section-header'
								onClick={() =>
									setShowChangelogCollapsed(!showChangelogCollapsed)
								}
							>
								<span>Changelog</span>
								<button className='toggle-btn'>
									{showChangelogCollapsed ? '↓' : '↑'}
								</button>
							</div>

							{!showChangelogCollapsed && (
								<div className='changelog-content'>
									<div className='changelog-entry'>
										<div className='version'>v7.0</div>
										<ul>
											<li>
												Complete React/NextJS port with performance
												optimizations
											</li>
											<li>
												Built-in debouncing and throttling for smooth
												interactions
											</li>
											<li>Modular component architecture with custom hooks</li>
											<li>Real-time color sampling with visual feedback</li>
											<li>Export functionality (GPL, PNG, clipboard)</li>
											<li>
												Responsive design optimized for various screen sizes
											</li>
											<li>Performance monitoring and optimization utilities</li>
										</ul>
									</div>
								</div>
							)}
						</div>
					</div>{' '}
					{/* Close gradient-sampler-main */}
					
					{/* Saved Ramps - Right Column */}
					{showSavedRamps && (
						<div className='saved-ramps-section'>
							<h3>Saved Ramps</h3>
							<SavedRamps
								savedRamps={savedRamps}
								isLoading={rampsLoading}
								onLoadRamp={handleLoadRamp}
								onDeleteRamp={deleteSavedRamp}
								onDuplicateRamp={duplicateRamp}
								onUpdateRamp={updateSavedRamp}
								onExportRamps={exportRamps}
								onExportRampsAsGPL={exportRampsAsGPL}
								onExportRampsAsPNG={exportRampsAsPNG}
								onImportRamps={importRamps}
								onClearRamps={clearRamps}
								onReorderRamps={reorderRamps}
								onReverseSavedRamp={reverseSavedRamp}
								onReverseAllRamps={reverseAllRamps}
								onCompareRamp={handleComparisonSelect}
							/>
						</div>
					)}
				</div>{' '}
				{/* Close main-grid */}
			</div>{' '}
			{/* Close ramps-page-container */}
		</>
	)
}

export default GradientColorSampler
