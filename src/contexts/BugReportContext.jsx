import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { formatLogEntry } from '../utils/bugReporter'

const BugReportContext = createContext(null)

const MAX_LOG_ENTRIES = 100

export function BugReportProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [logs, setLogs] = useState([])
  const [crashError, setCrashError] = useState(null)
  const logsRef = useRef([])
  const originalConsole = useRef({})

  // Intercept console methods
  useEffect(() => {
    const methodsToIntercept = ['log', 'warn', 'error', 'info', 'debug']

    // Store original methods
    methodsToIntercept.forEach((method) => {
      originalConsole.current[method] = console[method]
    })

    // Create interceptors
    methodsToIntercept.forEach((method) => {
      console[method] = (...args) => {
        // Call original method
        originalConsole.current[method].apply(console, args)

        // Capture the log entry
        const entry = formatLogEntry(method, args, new Date())
        logsRef.current = [...logsRef.current.slice(-MAX_LOG_ENTRIES + 1), entry]
        setLogs([...logsRef.current])
      }
    })

    // Capture unhandled errors
    const handleError = (event) => {
      const entry = formatLogEntry(
        'error',
        [
          {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error,
          },
        ],
        new Date()
      )
      logsRef.current = [...logsRef.current.slice(-MAX_LOG_ENTRIES + 1), entry]
      setLogs([...logsRef.current])
    }

    // Capture unhandled promise rejections
    const handleRejection = (event) => {
      const entry = formatLogEntry(
        'error',
        [
          {
            type: 'UnhandledPromiseRejection',
            reason: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
          },
        ],
        new Date()
      )
      logsRef.current = [...logsRef.current.slice(-MAX_LOG_ENTRIES + 1), entry]
      setLogs([...logsRef.current])
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    // Cleanup
    return () => {
      methodsToIntercept.forEach((method) => {
        console[method] = originalConsole.current[method]
      })
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  // Open the bug report modal
  const openBugReport = useCallback((error = null) => {
    if (error) {
      setCrashError(error)
    }
    setIsModalOpen(true)
  }, [])

  // Close the modal and reset crash error
  const closeBugReport = useCallback(() => {
    setIsModalOpen(false)
    setCrashError(null)
  }, [])

  // Get current logs snapshot
  const getLogs = useCallback(() => {
    return [...logsRef.current]
  }, [])

  // Clear logs (useful after successful report)
  const clearLogs = useCallback(() => {
    logsRef.current = []
    setLogs([])
  }, [])

  const value = {
    isModalOpen,
    openBugReport,
    closeBugReport,
    logs,
    getLogs,
    clearLogs,
    crashError,
    setCrashError,
  }

  return <BugReportContext.Provider value={value}>{children}</BugReportContext.Provider>
}

export function useBugReport() {
  const context = useContext(BugReportContext)
  if (!context) {
    throw new Error('useBugReport must be used within a BugReportProvider')
  }
  return context
}

export default BugReportContext
