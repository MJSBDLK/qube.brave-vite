import React, { useState, useEffect, useCallback } from 'react'
import { X, Send, Download, Camera, Eye, EyeOff, AlertCircle, Check, Loader2 } from 'lucide-react'
import { useBugReport } from '../contexts/BugReportContext'
import {
  buildReport,
  formatReportPreview,
  downloadReport,
  getBrowserInfo,
  getScreenInfo,
  getAppState,
} from '../utils/bugReporter'

// API endpoint for bug reports (configurable)
const BUG_REPORT_API = import.meta.env.VITE_BUG_REPORT_API || '/api/bug-report'

export default function BugReportModal() {
  const { isModalOpen, closeBugReport, getLogs, crashError, clearLogs } = useBugReport()

  // Form state
  const [description, setDescription] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [email, setEmail] = useState('')

  // Privacy toggles
  const [includeBrowserInfo, setIncludeBrowserInfo] = useState(false)
  const [includeScreenInfo, setIncludeScreenInfo] = useState(false)
  const [includeFullUrl, setIncludeFullUrl] = useState(false)
  const [includeAppState, setIncludeAppState] = useState(false)
  const [includeEmail, setIncludeEmail] = useState(false)
  const [includeScreenshot, setIncludeScreenshot] = useState(false)

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [screenshot, setScreenshot] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      // Pre-fill description if this is a crash report
      if (crashError) {
        setDescription(`Crash Report: ${crashError.message || 'Application crashed'}`)
      } else {
        setDescription('')
      }
      setStepsToReproduce('')
      setEmail('')
      setSubmitStatus(null)
      setErrorMessage('')
      setScreenshot(null)
    }
  }, [isModalOpen, crashError])

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeBugReport()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, closeBugReport])

  // Capture screenshot using html2canvas
  const captureScreenshot = useCallback(async () => {
    setIsCapturing(true)
    try {
      // Dynamically import html2canvas-pro
      const html2canvas = (await import('html2canvas-pro')).default

      // Hide the modal temporarily for screenshot
      const modal = document.querySelector('.bug-report-overlay')
      if (modal) modal.style.display = 'none'

      const canvas = await html2canvas(document.body, {
        logging: false,
        useCORS: true,
        scale: 1, // Reduce size
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      })

      // Restore modal
      if (modal) modal.style.display = ''

      // Convert to base64, compress by using JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      setScreenshot(dataUrl)
      setIncludeScreenshot(true)
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      setErrorMessage('Failed to capture screenshot')
    } finally {
      setIsCapturing(false)
    }
  }, [])

  // Build the current report for preview
  const getCurrentReport = useCallback(() => {
    return buildReport({
      description,
      stepsToReproduce,
      logs: getLogs(),
      crashError,
      includeBrowserInfo,
      includeScreenInfo,
      includeFullUrl,
      includeAppState,
      includeEmail,
      email,
      screenshot: includeScreenshot ? screenshot : null,
    })
  }, [
    description,
    stepsToReproduce,
    getLogs,
    crashError,
    includeBrowserInfo,
    includeScreenInfo,
    includeFullUrl,
    includeAppState,
    includeEmail,
    email,
    includeScreenshot,
    screenshot,
  ])

  // Submit report to API
  const handleSubmit = async () => {
    if (!description.trim()) {
      setErrorMessage('Please provide a description of the issue')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const report = getCurrentReport()

      const response = await fetch(BUG_REPORT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()
      setSubmitStatus('success')

      // Clear logs after successful submission
      clearLogs()

      // Close modal after a short delay
      setTimeout(() => {
        closeBugReport()
      }, 2000)
    } catch (error) {
      console.error('Failed to submit bug report:', error)
      setSubmitStatus('error')
      setErrorMessage(
        'Failed to submit report. You can download it instead and send it manually.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Download report as JSON
  const handleDownload = () => {
    const report = getCurrentReport()
    downloadReport(report)
  }

  if (!isModalOpen) return null

  const logs = getLogs()
  const logCounts = {
    error: logs.filter((l) => l.level === 'error').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    info: logs.filter((l) => l.level === 'log' || l.level === 'info').length,
  }

  return (
    <div className="bug-report-overlay" onClick={closeBugReport}>
      <div className="bug-report-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bug-report-header">
          <h2>{crashError ? 'Report Crash' : 'Report a Bug'}</h2>
          <button className="bug-report-close" onClick={closeBugReport} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Success state */}
        {submitStatus === 'success' ? (
          <div className="bug-report-success">
            <Check size={48} />
            <h3>Report Submitted</h3>
            <p>Thank you for helping me improve the site!</p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="bug-report-content">
              {/* Crash banner */}
              {crashError && (
                <div className="bug-report-crash-banner">
                  <AlertCircle size={18} />
                  <span>
                    The application encountered an error. Your report will include crash details.
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="bug-report-field">
                <label htmlFor="bug-description">
                  What happened? <span className="required">*</span>
                </label>
                <textarea
                  id="bug-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue you encountered..."
                  rows={3}
                />
              </div>

              {/* Steps to reproduce */}
              <div className="bug-report-field">
                <label htmlFor="bug-steps">Steps to reproduce (optional but very helpful)</label>
                <textarea
                  id="bug-steps"
                  value={stepsToReproduce}
                  onChange={(e) => setStepsToReproduce(e.target.value)}
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                  rows={3}
                />
              </div>

              {/* Auto-included data */}
              <div className="bug-report-auto-data">
                <h4>Automatically included:</h4>
                <ul>
                  <li>Current page route</li>
                  <li>Timestamp</li>
                  <li>
                    Console logs ({logCounts.error} errors, {logCounts.warn} warnings,{' '}
                    {logCounts.info} info)
                  </li>
                  {crashError && <li>Crash details and stack trace</li>}
                </ul>
              </div>

              {/* Privacy toggles */}
              <div className="bug-report-privacy">
                <h4>Optional data (your choice):</h4>
                <div className="privacy-toggles">
                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={includeBrowserInfo}
                      onChange={(e) => setIncludeBrowserInfo(e.target.checked)}
                    />
                    <span className="toggle-label">Browser & OS</span>
                    <span className="toggle-preview">
                      {includeBrowserInfo && `(${getBrowserInfo().browser}, ${getBrowserInfo().os})`}
                    </span>
                  </label>

                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={includeScreenInfo}
                      onChange={(e) => setIncludeScreenInfo(e.target.checked)}
                    />
                    <span className="toggle-label">Screen resolution</span>
                    <span className="toggle-preview">
                      {includeScreenInfo && `(${getScreenInfo().resolution})`}
                    </span>
                  </label>

                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={includeFullUrl}
                      onChange={(e) => setIncludeFullUrl(e.target.checked)}
                    />
                    <span className="toggle-label">Full URL</span>
                    <span className="toggle-preview">
                      {includeFullUrl && `(${window.location.href.substring(0, 40)}...)`}
                    </span>
                  </label>

                  <label className="privacy-toggle">
                    <input
                      type="checkbox"
                      checked={includeAppState}
                      onChange={(e) => setIncludeAppState(e.target.checked)}
                    />
                    <span className="toggle-label">App settings</span>
                    <span className="toggle-preview">
                      {includeAppState && `(${Object.keys(getAppState()).length} items)`}
                    </span>
                  </label>

                  <div className="privacy-toggle-group">
                    <label className="privacy-toggle">
                      <input
                        type="checkbox"
                        checked={includeEmail}
                        onChange={(e) => setIncludeEmail(e.target.checked)}
                      />
                      <span className="toggle-label">Contact email (for follow-up)</span>
                    </label>
                    {includeEmail && (
                      <input
                        type="email"
                        className="email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    )}
                  </div>

                  <div className="privacy-toggle-group">
                    <label className="privacy-toggle">
                      <input
                        type="checkbox"
                        checked={includeScreenshot}
                        onChange={(e) => setIncludeScreenshot(e.target.checked)}
                        disabled={!screenshot}
                      />
                      <span className="toggle-label">Screenshot</span>
                      {screenshot && (
                        <span className="toggle-preview">
                          ({Math.round(screenshot.length / 1024)}KB)
                        </span>
                      )}
                    </label>
                    <button
                      className="screenshot-btn"
                      onClick={captureScreenshot}
                      disabled={isCapturing}
                    >
                      {isCapturing ? (
                        <Loader2 size={16} className="spinner" />
                      ) : (
                        <Camera size={16} />
                      )}
                      {screenshot ? 'Retake' : 'Capture'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview toggle */}
              <div className="bug-report-preview-toggle">
                <button onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? 'Hide Preview' : 'Preview Report'}
                </button>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="bug-report-preview">
                  <pre>{formatReportPreview(getCurrentReport())}</pre>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="bug-report-error">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bug-report-footer">
              <button className="bug-report-btn secondary" onClick={handleDownload}>
                <Download size={16} />
                Download JSON
              </button>
              <button
                className="bug-report-btn primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !description.trim()}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <Send size={16} />
                )}
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
