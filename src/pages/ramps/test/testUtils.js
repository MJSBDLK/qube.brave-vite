// app/ramps/test/testUtils.js
/**
 * Test utilities for the gradient sampler
 */

/**
 * Create a test gradient canvas for testing color sampling
 */
export function createTestGradient(colors = ['#ff0000', '#00ff00', '#0000ff']) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = 300
  canvas.height = 100
  
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  colors.forEach((color, index) => {
    const position = index / (colors.length - 1)
    gradient.addColorStop(position, color)
  })
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  return canvas
}

/**
 * Convert canvas to blob for testing image upload
 */
export function canvasToFile(canvas, filename = 'test-gradient.png') {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], filename, { type: 'image/png' })
      resolve(file)
    }, 'image/png')
  })
}

/**
 * Test color sampling accuracy
 */
export function testColorSampling(generatedColors, expectedColors, tolerance = 10) {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  }

  generatedColors.forEach((color, index) => {
    if (expectedColors[index]) {
      const expected = expectedColors[index]
      const actual = color
      
      const rDiff = Math.abs(expected.r - actual.r)
      const gDiff = Math.abs(expected.g - actual.g)
      const bDiff = Math.abs(expected.b - actual.b)
      
      const passed = rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance
      
      if (passed) {
        results.passed++
      } else {
        results.failed++
      }
      
      results.details.push({
        index,
        expected: expected.hex,
        actual: actual.hex,
        passed,
        differences: { r: rDiff, g: gDiff, b: bDiff }
      })
    }
  })

  return results
}
