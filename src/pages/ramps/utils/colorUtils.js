// app/ramps/utils/colorUtils.js
/**
 * Color conversion and sampling utilities with performance optimizations
 */

// Performance monitoring
let performanceStats = {
  lastUpdate: Date.now(),
  updateCount: 0,
  debounceCount: 0,
}

/**
 * Convert RGB values to hex string
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b]
    .map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    })
    .join('')
}

/**
 * Convert hex string to RGB values
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r, g, b) {
  r = r / 255
  g = g / 255
  b = b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }

  if (h < 0) h += 360

  const s = max === 0 ? 0 : (delta / max) * 100
  const v = max * 100

  return { h, s, v }
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h, s, v) {
  h = h / 360
  s = s / 100
  v = v / 100

  const c = v * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = v - c

  let r, g, b

  if (h < 1/6) {
    r = c; g = x; b = 0
  } else if (h < 2/6) {
    r = x; g = c; b = 0
  } else if (h < 3/6) {
    r = 0; g = c; b = x
  } else if (h < 4/6) {
    r = 0; g = x; b = c
  } else if (h < 5/6) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return { r, g, b }
}

/**
 * Convert RGB values to CIE L* (perceptual lightness)
 */
export function rgbToLStar(r, g, b) {
  // Normalize RGB values to 0-1 range
  r = r / 255.0
  g = g / 255.0
  b = b / 255.0

  // Apply gamma correction (sRGB to linear RGB)
  function gammaCorrect(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  const rLinear = gammaCorrect(r)
  const gLinear = gammaCorrect(g)
  const bLinear = gammaCorrect(b)

  // Convert linear RGB to XYZ (using sRGB matrix)
  // We only need the Y component for lightness
  const y = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear

  // Convert Y to L* using CIE formula
  function f(t) {
    const delta = 6.0 / 29.0
    return t > Math.pow(delta, 3)
      ? Math.pow(t, 1.0 / 3.0)
      : t / (3 * delta * delta) + 4.0 / 29.0
  }

  const lStar = 116 * f(y) - 16
  return Math.max(0, Math.min(100, lStar))
}

/**
 * Convert RGB values to HSV-based luminance (0-100)
 */
export function rgbToHSVLuminance(r, g, b) {
  const max = Math.max(r, g, b) / 255.0
  return max * 100
}

/**
 * Convert RGB to LAB color space
 */
export function rgbToLab(r, g, b) {
  // Normalize RGB values
  r = r / 255.0
  g = g / 255.0
  b = b / 255.0

  // Apply gamma correction
  function gammaCorrect(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  const rLinear = gammaCorrect(r)
  const gLinear = gammaCorrect(g)
  const bLinear = gammaCorrect(b)

  // Convert to XYZ using sRGB matrix
  const x = 0.4124564 * rLinear + 0.3575761 * gLinear + 0.1804375 * bLinear
  const y = 0.2126729 * rLinear + 0.7151522 * gLinear + 0.072175 * bLinear
  const z = 0.0193339 * rLinear + 0.119192 * gLinear + 0.9503041 * bLinear

  // Convert XYZ to LAB
  function f(t) {
    const delta = 6.0 / 29.0
    return t > Math.pow(delta, 3)
      ? Math.pow(t, 1.0 / 3.0)
      : t / (3 * delta * delta) + 4.0 / 29.0
  }

  const fx = f(x / 0.95047)
  const fy = f(y / 1.0)
  const fz = f(z / 1.08883)

  const L = 116 * fy - 16
  const A = 500 * (fx - fy)
  const B = 200 * (fy - fz)

  return { L: Math.max(0, Math.min(100, L)), A, B }
}

/**
 * Convert LAB to RGB color space
 */
export function labToRgb(L, A, B) {
  // Convert LAB to XYZ
  const fy = (L + 16) / 116
  const fx = A / 500 + fy
  const fz = fy - B / 200

  function f_inv(t) {
    const delta = 6.0 / 29.0
    return t > delta
      ? Math.pow(t, 3)
      : 3 * delta * delta * (t - 4.0 / 29.0)
  }

  const x = 0.95047 * f_inv(fx)
  const y = 1.0 * f_inv(fy)
  const z = 1.08883 * f_inv(fz)

  // Convert XYZ to linear RGB
  let rLinear = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  let gLinear = -0.969266 * x + 1.8760108 * y + 0.041556 * z
  let bLinear = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z

  // Apply inverse gamma correction
  function gammaInverse(c) {
    return c <= 0.0031308
      ? 12.92 * c
      : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }

  rLinear = gammaInverse(rLinear)
  gLinear = gammaInverse(gLinear)
  bLinear = gammaInverse(bLinear)

  // Convert to 8-bit RGB
  const r = Math.max(0, Math.min(255, Math.round(rLinear * 255)))
  const g = Math.max(0, Math.min(255, Math.round(gLinear * 255)))
  const b = Math.max(0, Math.min(255, Math.round(bLinear * 255)))

  return { r, g, b }
}

/**
 * Calculate luminance using the selected algorithm
 */
export function calculateLuminance(r, g, b, mode = 'ciel') {
  if (mode === 'hsv') {
    return Math.round(rgbToHSVLuminance(r, g, b))
  } else {
    return Math.round(rgbToLStar(r, g, b))
  }
}

/**
 * Validate hex color format
 */
export function isValidHex(hex) {
  return /^#([A-Fa-f0-9]{3}){1,2}$|^#([A-Fa-f0-9]{4}){1,2}$/.test(hex)
}

/**
 * Parse multiple hex colors from input string
 */
export function parseHexColors(input) {
  if (!input || typeof input !== 'string') return []

  // Split by comma, space, or semicolon
  const parts = input.split(/[,;\s]+/)
  const colors = []

  for (let part of parts) {
    if (!part || typeof part !== 'string') continue

    part = part.trim()
    if (!part) continue

    // Add # if missing
    if (!part.startsWith('#')) {
      part = '#' + part
    }

    // Validate hex color (3, 4, 6, or 8 digits)
    if (isValidHex(part)) {
      // Expand 3-digit hex to 6-digit
      if (part.length === 4) {
        part = '#' + part[1] + part[1] + part[2] + part[2] + part[3] + part[3]
      }
      colors.push(part)
    }
  }

  return colors
}

/**
 * Sample color from canvas at specific position with averaging
 */
export function sampleColorAtPosition(canvas, ctx, position, sampleSize = 2) {
  const x = Math.floor(position * (canvas.width - 1))
  const y = Math.floor(canvas.height / 2)

  let r = 0, g = 0, b = 0
  let samples = 0

  // Sample area around the point for better accuracy
  for (let dx = -sampleSize; dx <= sampleSize; dx++) {
    for (let dy = -sampleSize; dy <= sampleSize; dy++) {
      const sampleX = Math.max(0, Math.min(canvas.width - 1, x + dx))
      const sampleY = Math.max(0, Math.min(canvas.height - 1, y + dy))

      const pixelData = ctx.getImageData(sampleX, sampleY, 1, 1).data
      r += pixelData[0]
      g += pixelData[1]
      b += pixelData[2]
      samples++
    }
  }

  r = Math.round(r / samples)
  g = Math.round(g / samples)
  b = Math.round(b / samples)

  return {
    r,
    g,
    b,
    hex: rgbToHex(r, g, b),
  }
}

/**
 * Sampling functions for different curve types
 */
export const samplingFunctions = {
  linear: (t) => t,
  customExponent: (t, power = 2.0) => {
    return 1 - Math.pow(1 - t, power)
  },
  customParametric: (t, power = 2.0) => {
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, power)
    } else {
      return 1 - 0.5 * Math.pow(2 * (1 - t), power)
    }
  },
}

/**
 * Generate color swatch using sampling function and range
 */
export function generateColorSwatch(canvas, ctx, options = {}) {
  const {
    startRange = 0,
    endRange = 100,
    sampleCount = 11,
    samplingFunction = 'linear',
    powerValue = 2.0,
    sampleSize = 2,
    luminanceMode = 'ciel'
  } = options

  const start = startRange / 100
  const end = endRange / 100
  const func = samplingFunctions[samplingFunction]

  const colors = []
  const positions = []

  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1)
    const mappedT = samplingFunction === 'linear' 
      ? func(t) 
      : func(t, powerValue)
    const position = start + (end - start) * mappedT

    positions.push(position)
    const color = sampleColorAtPosition(canvas, ctx, position, sampleSize)
    
    // Calculate both luminance values
    color.luminance_ciel = calculateLuminance(color.r, color.g, color.b, 'ciel')
    color.luminance_hsv = calculateLuminance(color.r, color.g, color.b, 'hsv')
    color.luminance = calculateLuminance(color.r, color.g, color.b, luminanceMode)
    
    colors.push(color)
  }

  return { colors, positions }
}

/**
 * Performance monitoring utilities
 */
export function updatePerformanceStats() {
  performanceStats.updateCount++
}

export function getPerformanceStats() {
  const now = Date.now()
  const timeDiff = now - performanceStats.lastUpdate

  if (timeDiff > 5000) {
    const updatesPerSecond = performanceStats.updateCount / (timeDiff / 1000)
    
    const stats = {
      updatesPerSecond: updatesPerSecond.toFixed(1),
      debounceCount: performanceStats.debounceCount,
      timeDiff
    }

    // Reset for next period
    performanceStats = {
      lastUpdate: now,
      updateCount: 0,
      debounceCount: 0,
    }

    return stats
  }

  return null
}
