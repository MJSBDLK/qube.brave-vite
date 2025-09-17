// app/ramps/hooks/useColorSampling.js
/**
 * React hook for color sampling with performance optimizations
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  generateColorSwatch, 
  updatePerformanceStats,
  calculateLuminance,
  applyColorBalanceToColors,
  applyHueShiftToColors
} from '../utils/colorUtils'
import { 
  debounce, 
  throttle, 
  showNotification,
  measurePerformance 
} from '../utils/performanceUtils'

export function useColorSampling() {
  const [generatedColors, setGeneratedColors] = useState([])
  const [samplePositions, setSamplePositions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [luminanceMode, setLuminanceMode] = useState('hsv') // 'hsv' or 'ciel'
  
  // Color adjustment mode: 'rgbcym' or 'all'
  const [colorAdjustmentMode, setColorAdjustmentMode] = useState('rgbcym')
  
  // RGBCYM Color Balance state
  const [colorBalance, setColorBalance] = useState({
    cyanRed: 0,        // -100 to +100 (negative = cyan, positive = red)
    magentaGreen: 0,   // -100 to +100 (negative = magenta, positive = green)
    yellowBlue: 0      // -100 to +100 (negative = yellow, positive = blue)
  })
  
  // All mode (Hue + Intensity) state
  const [hueAdjustment, setHueAdjustment] = useState({
    direction: 0,      // 0-360 degrees
    intensity: 0       // 0-100 percentage
  })
  
  // Store original colors to apply color balance to
  const [originalColors, setOriginalColors] = useState([])

  // Refs for canvas operations
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  /**
   * Set canvas reference for sampling operations
   */
  const setCanvasRef = useCallback((canvas, ctx) => {
    canvasRef.current = canvas
    ctxRef.current = ctx
  }, [])

  /**
   * Generate color swatch with performance optimization
   */
  const generateSwatch = useCallback((options = {}) => {
    if (!canvasRef.current || !ctxRef.current) {
      console.warn('Canvas not ready for sampling')
      return
    }

    const perf = measurePerformance('generateSwatch')
    setIsProcessing(true)
    updatePerformanceStats()

    try {
      const result = generateColorSwatch(
        canvasRef.current, 
        ctxRef.current, 
        {
          luminanceMode,
          ...options
        }
      )

      // Store original colors for color adjustments
      setOriginalColors(result.colors)
      
      // Apply current color adjustments if any
      let finalColors = result.colors
      
      if (colorAdjustmentMode === 'rgbcym') {
        const hasBalance = colorBalance.cyanRed !== 0 || colorBalance.magentaGreen !== 0 || colorBalance.yellowBlue !== 0
        finalColors = hasBalance ? applyColorBalanceToColors(result.colors, colorBalance, luminanceMode) : result.colors
      } else {
        const hasHueShift = hueAdjustment.intensity !== 0
        finalColors = hasHueShift ? applyHueShiftToColors(result.colors, hueAdjustment.direction, hueAdjustment.intensity, luminanceMode) : result.colors
      }
      
      setGeneratedColors(finalColors)
      setSamplePositions(result.positions)
      
      const duration = perf.end()
      showNotification(`Swatch generated (${Math.round(duration)}ms)`)
      
    } catch (error) {
      console.error('Error generating swatch:', error)
      showNotification('Failed to generate swatch', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [luminanceMode, colorBalance, colorAdjustmentMode, hueAdjustment])

  /**
   * Debounced swatch generation for expensive operations
   */
  const debouncedGenerateSwatch = useCallback((options = {}) => {
    debounce('generate-swatch', () => generateSwatch(options), 200)
  }, [generateSwatch])

  /**
   * Throttled swatch generation for frequent operations like slider changes
   */
  const throttledGenerateSwatch = useCallback((options = {}) => {
    throttle('generate-swatch-throttled', () => generateSwatch(options), 100)
  }, [generateSwatch])

  /**
   * Update color adjustments and apply to colors
   */
  const updateColorAdjustments = useCallback((updates) => {
    if (colorAdjustmentMode === 'rgbcym') {
      const newBalance = { ...colorBalance, ...updates }
      setColorBalance(newBalance)
      
      if (originalColors.length > 0) {
        const hasBalance = newBalance.cyanRed !== 0 || newBalance.magentaGreen !== 0 || newBalance.yellowBlue !== 0
        const adjustedColors = hasBalance ? applyColorBalanceToColors(originalColors, newBalance, luminanceMode) : originalColors
        
        // Ensure luminance is calculated with current mode
        const updatedColors = adjustedColors.map(color => ({
          ...color,
          luminance: calculateLuminance(color.r, color.g, color.b, luminanceMode)
        }))
        
        setGeneratedColors(updatedColors)
        
        const preserveText = luminanceMode === 'ciel' ? ' (preserving CIE L*)' : luminanceMode === 'hsv' ? ' (preserving HSV)' : ''
        if (hasBalance) {
          showNotification(`Color balance applied${preserveText}`, 'info')
        }
      }
    } else {
      const newHueAdjustment = { ...hueAdjustment, ...updates }
      setHueAdjustment(newHueAdjustment)
      
      if (originalColors.length > 0) {
        const hasHueShift = newHueAdjustment.intensity !== 0
        const adjustedColors = hasHueShift ? applyHueShiftToColors(originalColors, newHueAdjustment.direction, newHueAdjustment.intensity, luminanceMode) : originalColors
        
        // Ensure luminance is calculated with current mode
        const updatedColors = adjustedColors.map(color => ({
          ...color,
          luminance: calculateLuminance(color.r, color.g, color.b, luminanceMode)
        }))
        
        setGeneratedColors(updatedColors)
        
        const preserveText = luminanceMode === 'ciel' ? ' (preserving CIE L*)' : luminanceMode === 'hsv' ? ' (preserving HSV)' : ''
        if (hasHueShift) {
          showNotification(`Hue shift applied${preserveText}`, 'info')
        }
      }
    }
  }, [originalColors, luminanceMode, colorBalance, hueAdjustment, colorAdjustmentMode])

  /**
   * Legacy updateColorBalance for backward compatibility
   */
  const updateColorBalance = useCallback((balanceUpdates) => {
    updateColorAdjustments(balanceUpdates)
  }, [updateColorAdjustments])

  /**
   * Reset current color adjustments to neutral
   */
  const resetColorAdjustments = useCallback(() => {
    if (colorAdjustmentMode === 'rgbcym') {
      setColorBalance({ cyanRed: 0, magentaGreen: 0, yellowBlue: 0 })
    } else {
      setHueAdjustment({ direction: 0, intensity: 0 })
    }
    
    if (originalColors.length > 0) {
      setGeneratedColors(originalColors)
      showNotification('Color adjustments reset', 'info')
    }
  }, [originalColors, colorAdjustmentMode])

  /**
   * Legacy resetColorBalance for backward compatibility
   */
  const resetColorBalance = useCallback(() => {
    resetColorAdjustments()
  }, [resetColorAdjustments])

  /**
   * Toggle between RGBCYM and All color adjustment modes
   */
  const toggleColorAdjustmentMode = useCallback(() => {
    const newMode = colorAdjustmentMode === 'rgbcym' ? 'all' : 'rgbcym'
    setColorAdjustmentMode(newMode)
    
    // Reset adjustments when switching modes
    setColorBalance({ cyanRed: 0, magentaGreen: 0, yellowBlue: 0 })
    setHueAdjustment({ direction: 0, intensity: 0 })
    
    if (originalColors.length > 0) {
      setGeneratedColors(originalColors)
      showNotification(`Switched to ${newMode.toUpperCase()} mode`, 'info')
    }
  }, [colorAdjustmentMode, originalColors])

  /**
   * Update luminance mode and recalculate if needed
   */
  const updateLuminanceMode = useCallback((mode) => {
    setLuminanceMode(mode)
    
    // Recalculate luminance for existing colors
    if (generatedColors.length > 0) {
      const updatedColors = generatedColors.map(color => ({
        ...color,
        luminance: calculateLuminance(color.r, color.g, color.b, mode)
      }))
      setGeneratedColors(updatedColors)
    }
    
    showNotification(`Luminance mode: ${mode === 'hsv' ? 'HSV' : 'CIE L*'}`)
  }, [generatedColors])

  /**
   * Reverse the current color array
   */
  const reverseColors = useCallback(() => {
    if (generatedColors.length === 0) {
      showNotification('No colors to reverse!', 'error')
      return
    }

    setGeneratedColors(prev => [...prev].reverse())
    setSamplePositions(prev => [...prev].reverse())
    showNotification('Colors reversed!')
  }, [generatedColors])

  /**
   * Clear current swatch
   */
  const clearSwatch = useCallback(() => {
    setGeneratedColors([])
    setOriginalColors([])
    setSamplePositions([])
    setColorBalance({ cyanRed: 0, magentaGreen: 0, yellowBlue: 0 })
    showNotification('Swatch cleared')
  }, [])

  /**
   * Get swatch as GPL format string
   */
  const getGPLContent = useCallback((swatchName = 'Current Swatch') => {
    if (generatedColors.length === 0) return ''

    let gplContent = 'GIMP Palette\n'
    gplContent += `Name: ${swatchName}\n`
    gplContent += 'Columns: 11\n'
    gplContent += '# Generated by Gradient Color Sampler v7.0\n'
    gplContent += '#\n'

    generatedColors.forEach((color, index) => {
      const r = color.r.toString().padStart(3)
      const g = color.g.toString().padStart(3)
      const b = color.b.toString().padStart(3)
      gplContent += `${r} ${g} ${b}    Color ${index}\n`
    })

    return gplContent
  }, [generatedColors])

  /**
   * Export swatch as PNG (11x1 pixels)
   */
  const exportAsPNG = useCallback((filename = 'color-ramp') => {
    if (generatedColors.length === 0) {
      showNotification('No colors to export!', 'error')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = 11
    canvas.height = 1
    const ctx = canvas.getContext('2d')

    generatedColors.forEach((color, index) => {
      ctx.fillStyle = color.hex
      ctx.fillRect(index, 0, 1, 1)
    })

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.png`
      a.click()
      URL.revokeObjectURL(url)
      showNotification('PNG exported!')
    }, 'image/png')
  }, [generatedColors])

  /**
   * Export swatch as GPL file
   */
  const exportAsGPL = useCallback((filename = 'color-ramp', swatchName = 'Current Swatch') => {
    if (generatedColors.length === 0) {
      showNotification('No colors to export!', 'error')
      return
    }

    const gplContent = getGPLContent(swatchName)
    const blob = new Blob([gplContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.gpl`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('GPL file exported!')
  }, [getGPLContent, generatedColors])

  return {
    // State
    generatedColors,
    samplePositions,
    isProcessing,
    luminanceMode,
    colorBalance,
    colorAdjustmentMode,
    hueAdjustment,
    
    // Canvas management
    setCanvasRef,
    
    // Sampling operations
    generateSwatch,
    debouncedGenerateSwatch,
    throttledGenerateSwatch,
    
    // Color operations
    reverseColors,
    clearSwatch,
    
    // Settings
    updateLuminanceMode,
    updateColorBalance,
    resetColorBalance,
    updateColorAdjustments,
    resetColorAdjustments,
    toggleColorAdjustmentMode,
    
    // Export operations
    getGPLContent,
    exportAsPNG,
    exportAsGPL,
    
    // Computed values
    hasColors: generatedColors.length > 0,
    colorCount: generatedColors.length
  }
}
