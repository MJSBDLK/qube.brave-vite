import React, { useState, useEffect } from 'react'
import { X, Send, Plus, Trash2, Check, Loader2, AlertCircle } from 'lucide-react'
import { useDatasetSuggestion } from '../contexts/DatasetSuggestionContext'

const SUGGESTION_API = import.meta.env.VITE_SUGGESTION_API || '/api/inflation/suggest'

const emptySuggestion = () => ({
  name: '',
  description: '',
  sourceUrl: '',
})

export default function DatasetSuggestionModal() {
  const { isModalOpen, closeDatasetSuggestion } = useDatasetSuggestion()

  // Form state
  const [suggestions, setSuggestions] = useState([emptySuggestion()])
  const [contact, setContact] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setSuggestions([emptySuggestion()])
      setContact('')
      setSubmitStatus(null)
      setErrorMessage('')
    }
  }, [isModalOpen])

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeDatasetSuggestion()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, closeDatasetSuggestion])

  const addSuggestion = () => {
    setSuggestions([...suggestions, emptySuggestion()])
  }

  const removeSuggestion = (index) => {
    if (suggestions.length > 1) {
      setSuggestions(suggestions.filter((_, i) => i !== index))
    }
  }

  const updateSuggestion = (index, field, value) => {
    const updated = [...suggestions]
    updated[index] = { ...updated[index], [field]: value }
    setSuggestions(updated)
  }

  const hasValidSuggestion = suggestions.some(s => s.name.trim())

  const handleSubmit = async () => {
    if (!hasValidSuggestion) {
      setErrorMessage('Please provide at least one dataset name')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(SUGGESTION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestions: suggestions.filter(s => s.name.trim()),
          contact: contact.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      setSubmitStatus('success')

      // Close modal after a short delay
      setTimeout(() => {
        closeDatasetSuggestion()
      }, 2000)
    } catch (error) {
      console.error('Failed to submit suggestion:', error)
      setSubmitStatus('error')
      setErrorMessage('Failed to submit suggestion. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isModalOpen) return null

  return (
    <div className="bug-report-overlay" onClick={closeDatasetSuggestion}>
      <div className="bug-report-modal dataset-suggestion-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bug-report-header">
          <h2>Suggest a Dataset</h2>
          <button className="bug-report-close" onClick={closeDatasetSuggestion} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Success state */}
        {submitStatus === 'success' ? (
          <div className="bug-report-success">
            <Check size={48} />
            <h3>Suggestion Submitted</h3>
            <p>Thank you for your suggestion!</p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="bug-report-content">
              <p className="suggestion-intro">
                What datasets would you like to see? You can suggest assets to price or new measuring sticks.
              </p>

              {/* Suggestions list */}
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-header">
                      <span className="suggestion-number">#{index + 1}</span>
                      {suggestions.length > 1 && (
                        <button
                          className="suggestion-remove"
                          onClick={() => removeSuggestion(index)}
                          aria-label="Remove suggestion"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="bug-report-field">
                      <label>
                        Dataset name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        value={suggestion.name}
                        onChange={(e) => updateSuggestion(index, 'name', e.target.value)}
                        placeholder="e.g., Average rent, Gallon of gas, Big Mac..."
                      />
                    </div>

                    <div className="bug-report-field">
                      <label>Description (optional)</label>
                      <textarea
                        value={suggestion.description}
                        onChange={(e) => updateSuggestion(index, 'description', e.target.value)}
                        placeholder="What is this measurement? Any details that might help..."
                        rows={2}
                      />
                    </div>

                    <div className="bug-report-field">
                      <label>Data source URL (optional)</label>
                      <input
                        type="text"
                        value={suggestion.sourceUrl}
                        onChange={(e) => updateSuggestion(index, 'sourceUrl', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add another button */}
              <button className="add-suggestion-btn" onClick={addSuggestion}>
                <Plus size={16} />
                Add another dataset
              </button>

              {/* Contact field */}
              <div className="bug-report-field contact-field">
                <label>Feel free to contact me at (optional)</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email, Twitter, etc."
                />
              </div>

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
              <button
                className="bug-report-btn secondary"
                onClick={closeDatasetSuggestion}
              >
                Cancel
              </button>
              <button
                className="bug-report-btn primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !hasValidSuggestion}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <Send size={16} />
                )}
                Submit Suggestion
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
