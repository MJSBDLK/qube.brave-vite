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
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r = r / 255
  g = g / 255
  b = b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6
    } else {
      h = ((r - g) / delta + 4) / 6
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  }
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l) {
  h = h / 360
  s = s / 100
  l = l / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2

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
 * Apply Color Balance adjustment to a color (Photoshop-style)
 * @param {string} hex - Hex color string
 * @param {Object} balance - Color balance values {cyanRed: -100 to +100, magentaGreen: -100 to +100, yellowBlue: -100 to +100}
 * @param {string} preserveLuminance - 'none', 'hsv', or 'ciel'
 * @returns {string} - Adjusted hex color
 */
export function applyColorBalance(hex, balance, preserveLuminance = 'none') {
  if (!hex || !isValidHex(hex)) return hex
  if (!balance || (balance.cyanRed === 0 && balance.magentaGreen === 0 && balance.yellowBlue === 0)) return hex

  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  if (preserveLuminance === 'none') {
    // Direct RGB channel adjustments
    return applyColorBalanceDirectRGB(rgb, balance)
  } else if (preserveLuminance === 'hsv') {
    // Preserve HSV brightness
    return applyColorBalancePreserveHSV(rgb, balance)
  } else if (preserveLuminance === 'ciel') {
    // Preserve CIE L* luminance
    return applyColorBalancePreserveCIEL(rgb, balance)
  }
  
  return hex
}

/**
 * Direct RGB Color Balance adjustment (no luminance preservation)
 */
function applyColorBalanceDirectRGB(rgb, balance) {
  // Normalize balance values from -100/+100 to -1/+1
  const cyanRed = balance.cyanRed / 100
  const magentaGreen = balance.magentaGreen / 100  
  const yellowBlue = balance.yellowBlue / 100

  // Apply color balance adjustments
  // Cyan-Red affects Red channel primarily
  // Magenta-Green affects Green channel primarily  
  // Yellow-Blue affects Blue channel primarily
  
  let r = rgb.r
  let g = rgb.g
  let b = rgb.b

  // Cyan-Red adjustment (positive = more red, negative = more cyan)
  if (cyanRed > 0) {
    // Add red, reduce cyan (increase red, slightly reduce green and blue)
    r = Math.min(255, r + (cyanRed * (255 - r) * 0.5))
    g = Math.max(0, g - (cyanRed * g * 0.1))
    b = Math.max(0, b - (cyanRed * b * 0.1))
  } else if (cyanRed < 0) {
    // Add cyan, reduce red (reduce red, increase green and blue)
    r = Math.max(0, r + (cyanRed * r * 0.5))
    g = Math.min(255, g - (cyanRed * (255 - g) * 0.25))
    b = Math.min(255, b - (cyanRed * (255 - b) * 0.25))
  }

  // Magenta-Green adjustment (positive = more green, negative = more magenta)
  if (magentaGreen > 0) {
    // Add green, reduce magenta
    g = Math.min(255, g + (magentaGreen * (255 - g) * 0.5))
    r = Math.max(0, r - (magentaGreen * r * 0.1))
    b = Math.max(0, b - (magentaGreen * b * 0.1))
  } else if (magentaGreen < 0) {
    // Add magenta, reduce green (increase red and blue, reduce green)
    g = Math.max(0, g + (magentaGreen * g * 0.5))
    r = Math.min(255, r - (magentaGreen * (255 - r) * 0.25))
    b = Math.min(255, b - (magentaGreen * (255 - b) * 0.25))
  }

  // Yellow-Blue adjustment (positive = more blue, negative = more yellow)
  if (yellowBlue > 0) {
    // Add blue, reduce yellow
    b = Math.min(255, b + (yellowBlue * (255 - b) * 0.5))
    r = Math.max(0, r - (yellowBlue * r * 0.1))
    g = Math.max(0, g - (yellowBlue * g * 0.1))
  } else if (yellowBlue < 0) {
    // Add yellow, reduce blue (increase red and green, reduce blue)
    b = Math.max(0, b + (yellowBlue * b * 0.5))
    r = Math.min(255, r - (yellowBlue * (255 - r) * 0.25))
    g = Math.min(255, g - (yellowBlue * (255 - g) * 0.25))
  }

  return rgbToHex(Math.round(r), Math.round(g), Math.round(b))
}

/**
 * Color Balance with HSV brightness preservation
 */
function applyColorBalancePreserveHSV(rgb, balance) {
  // Get original HSV values
  const originalHsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  
  // Apply direct RGB color balance
  const balancedHex = applyColorBalanceDirectRGB(rgb, balance)
  const balancedRgb = hexToRgb(balancedHex)
  
  if (!balancedRgb) return rgbToHex(rgb.r, rgb.g, rgb.b)
  
  // Convert balanced color to HSV and preserve original V (brightness)
  const balancedHsv = rgbToHsv(balancedRgb.r, balancedRgb.g, balancedRgb.b)
  
  // Keep original brightness, use new hue and saturation
  const preservedHsv = {
    h: balancedHsv.h,
    s: balancedHsv.s,
    v: originalHsv.v  // Preserve original brightness
  }
  
  const finalRgb = hsvToRgb(preservedHsv.h, preservedHsv.s, preservedHsv.v)
  return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b)
}

/**
 * Color Balance with CIE L* luminance preservation
 */
function applyColorBalancePreserveCIEL(rgb, balance) {
  // Get original L* value
  const originalLab = rgbToLab(rgb.r, rgb.g, rgb.b)
  const targetL = originalLab.L
  
  // Apply direct RGB color balance
  const balancedHex = applyColorBalanceDirectRGB(rgb, balance)
  const balancedRgb = hexToRgb(balancedHex)
  
  if (!balancedRgb) return rgbToHex(rgb.r, rgb.g, rgb.b)
  
  // Convert balanced color to LAB
  const balancedLab = rgbToLab(balancedRgb.r, balancedRgb.g, balancedRgb.b)
  
  // Preserve original L* while keeping new A* and B* (color direction)
  const preservedLab = {
    L: targetL,  // Preserve original luminance
    A: balancedLab.A,  // Keep new color direction
    B: balancedLab.B   // Keep new color direction
  }
  
  const finalRgb = labToRgb(preservedLab.L, preservedLab.A, preservedLab.B)
  return rgbToHex(finalRgb.r, finalRgb.g, finalRgb.b)
}

/**
 * Apply Color Balance to an array of colors
 */
export function applyColorBalanceToColors(colors, balance, preserveLuminance = 'none') {
  if (!colors || colors.length === 0) return []
  
  return colors.map(color => {
    if (typeof color === 'string') {
      return applyColorBalance(color, balance, preserveLuminance)
    } else {
      const newHex = applyColorBalance(color.hex, balance, preserveLuminance)
      const newRgb = hexToRgb(newHex)
      return {
        ...color,
        ...newRgb,
        hex: newHex,
        luminance: calculateLuminance(newRgb.r, newRgb.g, newRgb.b, preserveLuminance === 'none' ? 'ciel' : preserveLuminance)
      }
    }
  })
}

/**
 * Apply Hue Shift with intensity to a color (All mode)
 * @param {string} hex - Hex color to adjust
 * @param {number} hueDirection - Hue direction in degrees (0-360)
 * @param {number} intensity - Intensity percentage (0-100)
 * @param {string} preserveLuminance - 'none', 'hsv', or 'ciel'
 */
export function applyHueShift(hex, hueDirection, intensity, preserveLuminance = 'none') {
  if (!hex || intensity === 0) return hex

  const rgb = hexToRgb(hex)
  
  if (preserveLuminance === 'none') {
    return applyHueShiftDirectRGB(rgb, hueDirection, intensity)
  } else if (preserveLuminance === 'hsv') {
    return applyHueShiftPreserveHSV(rgb, hueDirection, intensity)
  } else {
    return applyHueShiftPreserveCIEL(rgb, hueDirection, intensity)
  }
}

/**
 * Direct RGB Hue Shift (no luminance preservation)
 */
function applyHueShiftDirectRGB(rgb, hueDirection, intensity) {
  // Convert RGB to HSL
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // Apply hue shift with intensity
  const shiftAmount = (hueDirection * intensity) / 100
  let newHue = hsl.h + shiftAmount
  
  // Normalize hue to 0-360 range
  while (newHue < 0) newHue += 360
  while (newHue >= 360) newHue -= 360
  
  // Convert back to RGB
  const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Hue Shift with HSV brightness preservation
 */
function applyHueShiftPreserveHSV(rgb, hueDirection, intensity) {
  const originalBrightness = rgbToHSVLuminance(rgb.r, rgb.g, rgb.b)
  
  // Apply hue shift
  const shiftedHex = applyHueShiftDirectRGB(rgb, hueDirection, intensity)
  const shiftedRgb = hexToRgb(shiftedHex)
  
  // Calculate brightness scaling factor
  const newBrightness = rgbToHSVLuminance(shiftedRgb.r, shiftedRgb.g, shiftedRgb.b)
  const brightnessFactor = newBrightness > 0 ? originalBrightness / newBrightness : 1
  
  // Apply brightness correction
  const correctedR = Math.min(255, Math.max(0, Math.round(shiftedRgb.r * brightnessFactor)))
  const correctedG = Math.min(255, Math.max(0, Math.round(shiftedRgb.g * brightnessFactor)))
  const correctedB = Math.min(255, Math.max(0, Math.round(shiftedRgb.b * brightnessFactor)))
  
  return rgbToHex(correctedR, correctedG, correctedB)
}

/**
 * Hue Shift with CIE L* luminance preservation
 */
function applyHueShiftPreserveCIEL(rgb, hueDirection, intensity) {
  const originalLuminance = rgbToLStar(rgb.r, rgb.g, rgb.b)
  
  // Apply hue shift
  const shiftedHex = applyHueShiftDirectRGB(rgb, hueDirection, intensity)
  const shiftedRgb = hexToRgb(shiftedHex)
  
  // Convert to LAB to preserve L* 
  const lab = rgbToLab(shiftedRgb.r, shiftedRgb.g, shiftedRgb.b)
  
  // Restore original luminance
  lab.L = originalLuminance
  
  // Convert back to RGB
  const correctedRgb = labToRgb(lab.L, lab.A, lab.B)
  return rgbToHex(
    Math.min(255, Math.max(0, Math.round(correctedRgb.r))),
    Math.min(255, Math.max(0, Math.round(correctedRgb.g))),
    Math.min(255, Math.max(0, Math.round(correctedRgb.b)))
  )
}

/**
 * Apply Hue Shift to an array of colors
 */
export function applyHueShiftToColors(colors, hueDirection, intensity, preserveLuminance = 'none') {
  if (!colors || colors.length === 0 || intensity === 0) return colors
  
  return colors.map(color => {
    if (typeof color === 'string') {
      return applyHueShift(color, hueDirection, intensity, preserveLuminance)
    } else {
      const newHex = applyHueShift(color.hex, hueDirection, intensity, preserveLuminance)
      const newRgb = hexToRgb(newHex)
      return {
        ...color,
        ...newRgb,
        hex: newHex,
        luminance: calculateLuminance(newRgb.r, newRgb.g, newRgb.b, preserveLuminance === 'none' ? 'ciel' : preserveLuminance)
      }
    }
  })
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
