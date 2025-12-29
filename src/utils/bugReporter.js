/**
 * Bug Reporter Utility
 * Handles console log interception, sanitization, and report formatting
 */

// Patterns to sanitize from logs (potential secrets/PII)
const SENSITIVE_PATTERNS = [
  // JWT tokens
  /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
  // API keys (common patterns)
  /(?:api[_-]?key|apikey|api_secret|secret_key)[=:]["']?[A-Za-z0-9-_]{16,}["']?/gi,
  // Bearer tokens
  /Bearer\s+[A-Za-z0-9-_]+/gi,
  // Email addresses (optional - can be toggled)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Credit card numbers (basic pattern)
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  // AWS access keys
  /AKIA[A-Z0-9]{16}/g,
  // Private keys
  /-----BEGIN[A-Z ]+PRIVATE KEY-----[\s\S]*?-----END[A-Z ]+PRIVATE KEY-----/g,
  // Password fields in objects/JSON
  /"?password"?\s*[=:]\s*["'][^"']+["']/gi,
]

/**
 * Sanitize a string by replacing sensitive patterns
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    try {
      str = JSON.stringify(str)
    } catch {
      str = String(str)
    }
  }

  let sanitized = str
  SENSITIVE_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })

  return sanitized
}

/**
 * Safely stringify an object, handling circular references
 */
export function safeStringify(obj, space = 2) {
  const seen = new WeakSet()
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]'
        }
        seen.add(value)
      }
      // Sanitize string values
      if (typeof value === 'string') {
        return sanitizeString(value)
      }
      return value
    },
    space
  )
}

/**
 * Format a log entry for the report
 */
export function formatLogEntry(level, args, timestamp) {
  const formattedArgs = args.map((arg) => {
    if (arg instanceof Error) {
      return {
        message: sanitizeString(arg.message),
        stack: sanitizeString(arg.stack || ''),
        name: arg.name,
      }
    }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.parse(safeStringify(arg))
      } catch {
        return sanitizeString(String(arg))
      }
    }
    return sanitizeString(String(arg))
  })

  return {
    level,
    timestamp: timestamp.toISOString(),
    message: formattedArgs,
  }
}

/**
 * Get browser and OS information
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser = 'Firefox ' + ua.split('Firefox/')[1].split(' ')[0]
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome ' + ua.split('Chrome/')[1].split(' ')[0]
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari ' + (ua.split('Version/')[1]?.split(' ')[0] || '')
  } else if (ua.includes('Edg/')) {
    browser = 'Edge ' + ua.split('Edg/')[1].split(' ')[0]
  }

  // Detect OS
  if (ua.includes('Windows')) {
    os = 'Windows'
    if (ua.includes('Windows NT 10')) os = 'Windows 10/11'
    else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1'
    else if (ua.includes('Windows NT 6.2')) os = 'Windows 8'
  } else if (ua.includes('Mac OS X')) {
    const version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.')
    os = version ? `macOS ${version}` : 'macOS'
  } else if (ua.includes('Linux')) {
    os = 'Linux'
  } else if (ua.includes('Android')) {
    const version = ua.match(/Android (\d+\.?\d*)/)?.[1]
    os = version ? `Android ${version}` : 'Android'
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    const version = ua.match(/OS (\d+_\d+)/)?.[1]?.replace('_', '.')
    os = version ? `iOS ${version}` : 'iOS'
  }

  return { browser, os }
}

/**
 * Get screen information
 */
export function getScreenInfo() {
  return {
    resolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
  }
}

/**
 * Get app state from localStorage (sanitized)
 */
export function getAppState() {
  const state = {}
  const safeKeys = ['spicyMode', 'theme', 'preferences'] // Whitelist of safe keys

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (safeKeys.some((safe) => key.toLowerCase().includes(safe.toLowerCase()))) {
      try {
        const value = localStorage.getItem(key)
        state[key] = value.length > 500 ? value.substring(0, 500) + '...' : value
      } catch {
        state[key] = '[Unable to read]'
      }
    }
  }

  return state
}

/**
 * Generate a unique report ID
 */
export function generateReportId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

/**
 * Build the final bug report object
 */
export function buildReport({
  description,
  stepsToReproduce = '',
  logs = [],
  crashError = null,
  includeBrowserInfo = false,
  includeScreenInfo = false,
  includeFullUrl = false,
  includeAppState = false,
  includeEmail = false,
  email = '',
  screenshot = null,
}) {
  const report = {
    meta: {
      reportId: generateReportId(),
      timestamp: new Date().toISOString(),
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      route: window.location.hash.replace('#', '') || '/',
    },
    source: {
      frontend: import.meta.env.DEV ? 'development' : 'production',
      origin: window.location.origin,
    },
    issue: {
      description: sanitizeString(description),
      stepsToReproduce: stepsToReproduce ? sanitizeString(stepsToReproduce) : null,
      type: crashError ? 'crash' : 'bug',
    },
    console: logs.slice(-100), // Last 100 log entries
  }

  // Optional: Crash error details
  if (crashError) {
    report.crash = {
      message: sanitizeString(crashError.message || ''),
      stack: sanitizeString(crashError.stack || ''),
      componentStack: crashError.componentStack
        ? sanitizeString(crashError.componentStack)
        : null,
    }
  }

  // Optional: Environment info (requires consent)
  if (includeBrowserInfo) {
    report.environment = getBrowserInfo()
  }

  if (includeScreenInfo) {
    report.screen = getScreenInfo()
  }

  if (includeFullUrl) {
    report.url = sanitizeString(window.location.href)
  }

  if (includeAppState) {
    report.appState = getAppState()
  }

  if (includeEmail && email) {
    report.contact = { email: sanitizeString(email) }
  }

  if (screenshot) {
    report.screenshot = screenshot
  }

  return report
}

/**
 * Format report for display in preview
 */
export function formatReportPreview(report) {
  // Create a copy without the screenshot for preview (too large)
  const previewReport = { ...report }
  if (previewReport.screenshot) {
    previewReport.screenshot = `[Image: ${Math.round(previewReport.screenshot.length / 1024)}KB]`
  }
  return JSON.stringify(previewReport, null, 2)
}

/**
 * Download report as JSON file
 */
export function downloadReport(report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bug-report-${report.meta.reportId}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
