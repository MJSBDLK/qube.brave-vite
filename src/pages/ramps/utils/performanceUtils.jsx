// utils/performanceUtils.jsx
import React from 'react'

/**
 * Performance optimization utilities for the gradient sampler
 */

// Global debounce timers map
const debounceTimers = new Map()

// Global throttle tracking
const throttleLastRun = new Map()

/**
 * Debounce utility with different rates for different operations
 * @param {string} key - Unique identifier for the debounced operation
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds (default: 250ms)
 */
export function debounce(key, func, delay = 250) {
  if (debounceTimers.has(key)) {
    clearTimeout(debounceTimers.get(key))
  }

  debounceTimers.set(
    key,
    setTimeout(() => {
      func()
      debounceTimers.delete(key)
    }, delay)
  )
}

/**
 * Throttle for very frequent operations (like slider drags)
 * @param {string} key - Unique identifier for the throttled operation
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds (default: 100ms)
 */
export function throttle(key, func, limit = 100) {
  const now = Date.now()
  
  if (!throttleLastRun.has(key) || now - throttleLastRun.get(key) >= limit) {
    func()
    throttleLastRun.set(key, now)
  }
}

/**
 * React hook for debounced values
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * React hook for throttled values
 * @param {any} value - Value to throttle
 * @param {number} limit - Time limit in milliseconds
 */
export function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = React.useState(value)
  const lastRan = React.useRef(Date.now())

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Performance indicator component
 */
export function PerformanceIndicator({ isProcessing, message = 'Processing...', className = '' }) {
  return (
    <div className={`performance-indicator ${isProcessing ? 'show' : ''} ${className}`}>
      {message}
    </div>
  )
}

/**
 * Notification system
 */
let notificationTimeout = null

export function showNotification(message, type = 'success', duration = 3000) {
  // Clear existing notification
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
  }

  // Create or update notification element
  let notification = document.getElementById('app-notification')
  if (!notification) {
    notification = document.createElement('div')
    notification.id = 'app-notification'
    notification.className = 'notification'
    document.body.appendChild(notification)
  }

  notification.textContent = message
  notification.className = `notification ${type} show`

  // Auto-hide after duration
  notificationTimeout = setTimeout(() => {
    notification.classList.remove('show')
  }, duration)
}

/**
 * Copy text to clipboard with notification
 */
export async function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text)
    showNotification(successMessage)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    showNotification('Failed to copy to clipboard', 'error')
    return false
  }
}

/**
 * Resize image if needed for better performance
 */
export function resizeImageIfNeeded(img, maxWidth = 1200, maxHeight = 400) {
  const { width, height } = img

  // If image is already small enough, return as-is
  if (width <= maxWidth && height <= maxHeight) {
    return img
  }

  // Calculate new dimensions maintaining aspect ratio
  const aspectRatio = width / height
  let newWidth = width
  let newHeight = height

  if (width > maxWidth) {
    newWidth = maxWidth
    newHeight = newWidth / aspectRatio
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight
    newWidth = newHeight * aspectRatio
  }

  // Create temporary canvas for resizing
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')

  tempCanvas.width = Math.round(newWidth)
  tempCanvas.height = Math.round(newHeight)

  // Use high-quality scaling
  tempCtx.imageSmoothingEnabled = true
  tempCtx.imageSmoothingQuality = 'high'
  tempCtx.drawImage(img, 0, 0, newWidth, newHeight)

  // Create new image from resized canvas
  const resizedImg = new Image()
  resizedImg.src = tempCanvas.toDataURL()

  showNotification(
    `Image resized from ${width}×${height} to ${Math.round(newWidth)}×${Math.round(newHeight)} for better performance`
  )

  return resizedImg
}

/**
 * Measure and log performance of operations
 */
export function measurePerformance(operationName) {
  const startTime = performance.now()
  
  return {
    end: () => {
      const duration = performance.now() - startTime
      console.log(`${operationName}: ${Math.round(duration)}ms`)
      return duration
    }
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const [stats, setStats] = React.useState(null)

  React.useEffect(() => {
    const interval = setInterval(() => {
      // This would integrate with the color utils performance stats
      const performanceData = {
        timestamp: new Date().toISOString(),
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        } : null
      }
      setStats(performanceData)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return stats
}

/**
 * Optimized file reader with progress
 */
export function readFileOptimized(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    
    if (onProgress) {
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentLoaded = Math.round((e.loaded / e.total) * 100)
          onProgress(percentLoaded)
        }
      }
    }

    reader.readAsDataURL(file)
  })
}
