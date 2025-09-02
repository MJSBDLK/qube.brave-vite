// app/ramps/utils/savedRampsUtils.js
/**
 * Utilities for managing saved gradient ramps with local storage persistence
 */

const STORAGE_KEY = 'gradient-sampler-saved-ramps'

/**
 * Get all saved ramps from local storage
 */
export function getSavedRamps() {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Error loading saved ramps:', error)
    return []
  }
}

/**
 * Save a new ramp to local storage
 */
export function saveRamp(rampData) {
  if (typeof window === 'undefined') return false
  
  try {
    const existingRamps = getSavedRamps()
    const newRamp = {
      id: generateRampId(),
      name: rampData.name || `Ramp ${existingRamps.length + 1}`,
      colors: rampData.colors || [],
      sampleCount: rampData.sampleCount || 11,
      samplingFunction: rampData.samplingFunction || 'linear',
      powerValue: rampData.powerValue || 2.0,
      luminanceMode: rampData.luminanceMode || 'hsv',
      samplingRange: rampData.samplingRange || { start: 0, end: 100 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      thumbnail: rampData.thumbnail || null, // Base64 encoded thumbnail
      sourceType: rampData.sourceType || 'colors', // 'colors', 'image', 'gpl'
      
      // Derivation metadata for re-sampling
      derivation: {
        originalColors: rampData.originalColors || rampData.colors, // Source colors before sampling
        gradientImage: rampData.gradientImage || null, // Original image data if from image
        hexInput: rampData.hexInput || null, // Original hex input string
        gplData: rampData.gplData || null, // Original GPL data if imported
      }
    }
    
    const updatedRamps = [...existingRamps, newRamp]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRamps))
    return newRamp
  } catch (error) {
    console.error('Error saving ramp:', error)
    return false
  }
}

/**
 * Update an existing saved ramp
 */
export function updateRamp(rampId, updateData) {
  if (typeof window === 'undefined') return false
  
  try {
    const existingRamps = getSavedRamps()
    const rampIndex = existingRamps.findIndex(ramp => ramp.id === rampId)
    
    if (rampIndex === -1) return false
    
    existingRamps[rampIndex] = {
      ...existingRamps[rampIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRamps))
    return existingRamps[rampIndex]
  } catch (error) {
    console.error('Error updating ramp:', error)
    return false
  }
}

/**
 * Delete a saved ramp
 */
export function deleteRamp(rampId) {
  if (typeof window === 'undefined') return false
  
  try {
    const existingRamps = getSavedRamps()
    const filteredRamps = existingRamps.filter(ramp => ramp.id !== rampId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRamps))
    return true
  } catch (error) {
    console.error('Error deleting ramp:', error)
    return false
  }
}

/**
 * Generate a unique ID for a ramp
 */
function generateRampId() {
  return `ramp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a thumbnail from colors array
 */
export function generateThumbnail(colors, width = 100, height = 20) {
  if (typeof window === 'undefined') return null
  
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = width
    canvas.height = height
    
    if (colors.length === 0) return null
    
    if (colors.length === 1) {
      // Single color
      ctx.fillStyle = colors[0]
      ctx.fillRect(0, 0, width, height)
    } else {
      // Gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      colors.forEach((color, index) => {
        const position = index / (colors.length - 1)
        gradient.addColorStop(position, color)
      })
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
    
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return null
  }
}

/**
 * Export saved ramps to a file
 */
export function exportSavedRamps() {
  const ramps = getSavedRamps()
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ramps: ramps
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: 'application/json' 
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gradient-ramps-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export all saved ramps as a single GPL (GIMP Palette) file
 */
export function exportSavedRampsAsGPL() {
  const ramps = getSavedRamps()
  
  if (ramps.length === 0) {
    throw new Error('No saved ramps to export')
  }
  
  let gplContent = 'GIMP Palette\n'
  gplContent += `Name: Gradient Ramps Export\n`
  gplContent += `Columns: 16\n`
  gplContent += `# Exported from Gradient Color Sampler\n`
  gplContent += `# ${new Date().toISOString()}\n`
  gplContent += `# Total ramps: ${ramps.length}\n`
  gplContent += '#\n'
  
  ramps.forEach((ramp, rampIndex) => {
    gplContent += `# Ramp ${rampIndex + 1}: ${ramp.name}\n`
    
    if (ramp.colors && ramp.colors.length > 0) {
      ramp.colors.forEach((color, colorIndex) => {
        const hex = color.startsWith('#') ? color : `#${color}`
        const rgb = hexToRgb(hex)
        
        if (rgb) {
          const r = rgb.r.toString().padStart(3, ' ')
          const g = rgb.g.toString().padStart(3, ' ')
          const b = rgb.b.toString().padStart(3, ' ')
          const colorName = `${ramp.name}_${colorIndex + 1}`
          
          gplContent += `${r} ${g} ${b}	${colorName}\n`
        }
      })
    }
    
    // Add separator between ramps
    if (rampIndex < ramps.length - 1) {
      gplContent += '#\n'
    }
  })
  
  const blob = new Blob([gplContent], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gradient-ramps-${new Date().toISOString().split('T')[0]}.gpl`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export all saved ramps as a single PNG file with single-pixel colors
 */
export function exportSavedRampsAsPNG() {
  const ramps = getSavedRamps()
  
  if (ramps.length === 0) {
    throw new Error('No saved ramps to export')
  }
  
  // Calculate total colors across all ramps
  const totalColors = ramps.reduce((sum, ramp) => {
    return sum + (ramp.colors ? ramp.colors.length : 0)
  }, 0)
  
  if (totalColors === 0) {
    throw new Error('No colors found in saved ramps')
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Create a single row of pixels, one for each color
  canvas.width = totalColors
  canvas.height = 1
  
  let pixelIndex = 0
  
  ramps.forEach(ramp => {
    if (ramp.colors && ramp.colors.length > 0) {
      ramp.colors.forEach(color => {
        const hex = color.startsWith('#') ? color : `#${color}`
        const rgb = hexToRgb(hex)
        
        if (rgb) {
          const imageData = ctx.createImageData(1, 1)
          imageData.data[0] = rgb.r
          imageData.data[1] = rgb.g
          imageData.data[2] = rgb.b
          imageData.data[3] = 255 // Alpha
          
          ctx.putImageData(imageData, pixelIndex, 0)
          pixelIndex++
        }
      })
    }
  })
  
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gradient-ramps-pixels-${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}

/**
 * Reverse the order of colors within a saved ramp
 */
export function reverseSavedRampColors(rampId) {
  const ramps = getSavedRamps()
  const rampIndex = ramps.findIndex(ramp => ramp.id === rampId)
  
  if (rampIndex === -1) {
    throw new Error('Ramp not found')
  }
  
  const ramp = ramps[rampIndex]
  if (ramp.colors && ramp.colors.length > 0) {
    ramp.colors = [...ramp.colors].reverse()
    ramp.updatedAt = new Date().toISOString()
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ramps))
    return ramp
  }
  
  throw new Error('No colors to reverse in this ramp')
}

/**
 * Reverse the order of all saved ramps
 */
export function reverseAllSavedRamps() {
  const ramps = getSavedRamps()
  
  if (ramps.length === 0) {
    throw new Error('No ramps to reverse')
  }
  
  const reversedRamps = [...ramps].reverse()
  
  // Update timestamps to maintain the new order
  const updatedRamps = reversedRamps.map(ramp => ({
    ...ramp,
    updatedAt: new Date().toISOString()
  }))
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRamps))
  return updatedRamps
}

/**
 * Helper function to convert hex to RGB (moved from colorUtils to avoid circular import)
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Import saved ramps from a file
 */
export function importSavedRamps(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (!data.ramps || !Array.isArray(data.ramps)) {
          throw new Error('Invalid file format')
        }
        
        const existingRamps = getSavedRamps()
        const importedRamps = data.ramps.map(ramp => ({
          ...ramp,
          id: generateRampId(), // Generate new IDs to avoid conflicts
          importedAt: new Date().toISOString()
        }))
        
        const allRamps = [...existingRamps, ...importedRamps]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRamps))
        
        resolve(importedRamps.length)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Clear all saved ramps (with confirmation)
 */
export function clearAllRamps() {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing ramps:', error)
    return false
  }
}

/**
 * Reorder saved ramps by replacing the entire array
 */
export function reorderSavedRamps(reorderedRamps) {
  if (typeof window === 'undefined') return false
  
  try {
    // Update all ramps with new updatedAt timestamp to preserve order
    const rampsWithTimestamp = reorderedRamps.map(ramp => ({
      ...ramp,
      updatedAt: new Date().toISOString()
    }))
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rampsWithTimestamp))
    return true
  } catch (error) {
    console.error('Error reordering ramps:', error)
    return false
  }
}

/**
 * Re-derive a saved ramp with new sample count
 * This uses the original derivation data to regenerate the ramp
 */
export function reDeriveRamp(ramp, newSampleCount, newSamplingFunction, newPowerValue) {
  try {
    // If we have original colors/gradient data, we can re-derive
    if (ramp.derivation && ramp.derivation.originalColors) {
      // This would need to be implemented with the actual sampling logic
      // For now, we'll just interpolate the existing colors
      const sourceColors = ramp.derivation.originalColors
      
      // Simple linear interpolation for now
      // In a real implementation, this would use the actual sampling algorithms
      const newColors = []
      for (let i = 0; i < newSampleCount; i++) {
        const t = newSampleCount === 1 ? 0 : i / (newSampleCount - 1)
        const sourceIndex = t * (sourceColors.length - 1)
        const lowerIndex = Math.floor(sourceIndex)
        const upperIndex = Math.ceil(sourceIndex)
        
        if (lowerIndex === upperIndex) {
          newColors.push(sourceColors[lowerIndex])
        } else {
          // Simple interpolation - in practice you'd want proper color space interpolation
          newColors.push(sourceColors[lowerIndex]) // Simplified
        }
      }
      
      return {
        ...ramp,
        colors: newColors,
        sampleCount: newSampleCount,
        samplingFunction: newSamplingFunction,
        powerValue: newPowerValue,
        updatedAt: new Date().toISOString()
      }
    }
    
    // If no derivation data, return original ramp
    return ramp
  } catch (error) {
    console.error('Error re-deriving ramp:', error)
    return ramp
  }
}
