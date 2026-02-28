import React, { useState, useEffect } from 'react'
import { X, Send, Check, Loader2, AlertCircle, Search, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { useBrandFeedback } from '../contexts/BrandFeedbackContext'

const REQUEST_API = import.meta.env.VITE_BRAND_REQUEST_API || '/api/brands/request-research'
const INACCURACY_API = import.meta.env.VITE_BRAND_INACCURACY_API || '/api/brands/report-inaccuracy'

const INACCURACY_FIELDS = [
  'Ownership/Parent Company',
  'Animal Welfare Rating',
  'Certifications',
  'Star Rating',
  'Price Tier',
  'Report Content',
  'Sources/Citations',
  'Other',
]

export default function BrandFeedbackModal() {
  const { isModalOpen, mode, brand, closeFeedback } = useBrandFeedback()

  // Request Research form state
  const [brandName, setBrandName] = useState('')
  const [notes, setNotes] = useState('')
  const [contact, setContact] = useState('')

  // Report Inaccuracy form state
  const [field, setField] = useState('')
  const [description, setDescription] = useState('')
  const [correction, setCorrection] = useState('')
  const [sources, setSources] = useState([''])

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setBrandName(brand?.name || '')
      setNotes('')
      setContact('')
      setField('')
      setDescription('')
      setCorrection('')
      setSources([''])
      setSubmitStatus(null)
      setErrorMessage('')
    }
  }, [isModalOpen, brand])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) closeFeedback()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, closeFeedback])

  const isRequestMode = mode === 'request-research'
  const isNewBrand = isRequestMode && !brand

  const canSubmit = isRequestMode
    ? (brand ? true : brandName.trim().length > 0)
    : (field.trim().length > 0 && description.trim().length > 0 && sources.some(s => s.trim().length > 0))

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const url = isRequestMode ? REQUEST_API : INACCURACY_API
      const payload = isRequestMode
        ? {
          brandName: brand?.name || brandName.trim(),
          brandId: brand?.id || null,
          categories: brand?.categories || null,
          isNewBrand,
          notes: notes.trim() || null,
          contact: contact.trim() || null,
        }
        : {
          brandName: brand?.name,
          brandId: brand?.id,
          field: field.trim(),
          description: description.trim(),
          correction: correction.trim() || null,
          sources: sources.map(s => s.trim()).filter(Boolean),
          contact: contact.trim() || null,
        }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`Server responded with ${response.status}`)

      setSubmitStatus('success')
      setTimeout(() => closeFeedback(), 2000)
    } catch (error) {
      console.error('Failed to submit brand feedback:', error)
      setSubmitStatus('error')
      setErrorMessage('Failed to submit. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isModalOpen) return null

  const title = isRequestMode
    ? (isNewBrand ? 'Suggest a Brand' : `Request Research — ${brand.name}`)
    : `Report Inaccuracy — ${brand?.name}`

  const TitleIcon = isRequestMode ? Search : AlertTriangle

  return (
    <div className="bug-report-overlay" onClick={closeFeedback}>
      <div className="bug-report-modal brand-feedback-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bug-report-header">
          <h2><TitleIcon size={18} /> {title}</h2>
          <button className="bug-report-close" onClick={closeFeedback} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Success state */}
        {submitStatus === 'success' ? (
          <div className="bug-report-success">
            <Check size={48} />
            <h3>{isRequestMode ? 'Request Submitted' : 'Report Submitted'}</h3>
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="bug-report-content">
              {isRequestMode ? (
                <RequestResearchForm
                  brand={brand}
                  brandName={brandName}
                  setBrandName={setBrandName}
                  notes={notes}
                  setNotes={setNotes}
                  contact={contact}
                  setContact={setContact}
                />
              ) : (
                <ReportInaccuracyForm
                  brand={brand}
                  field={field}
                  setField={setField}
                  description={description}
                  setDescription={setDescription}
                  correction={correction}
                  setCorrection={setCorrection}
                  sources={sources}
                  setSources={setSources}
                  contact={contact}
                  setContact={setContact}
                />
              )}

              {errorMessage && (
                <div className="bug-report-error">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bug-report-footer">
              <button className="bug-report-btn secondary" onClick={closeFeedback}>
                Cancel
              </button>
              <button
                className="bug-report-btn primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="spinner" />
                ) : (
                  <Send size={16} />
                )}
                {isRequestMode ? 'Submit Request' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RequestResearchForm({ brand, brandName, setBrandName, notes, setNotes, contact, setContact }) {
  const isNewBrand = !brand

  return (
    <>
      {isNewBrand ? (
        <>
          <p className="suggestion-intro">
            Suggest a brand or product you'd like us to research.
          </p>
          <div className="bug-report-field">
            <label>Brand name <span className="required">*</span></label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., Seventh Generation, Beyond Meat..."
            />
          </div>
        </>
      ) : (
        <>
          <p className="suggestion-intro">
            Request a full research report for <strong>{brand.name}</strong>.
          </p>
          {brand.categories && brand.categories.length > 0 && (
            <div className="brand-feedback-categories">
              {brand.categories.map(cat => (
                <span key={cat} className="brand-feedback-category-pill">{cat}</span>
              ))}
            </div>
          )}
        </>
      )}

      <div className="bug-report-field">
        <label>What would you like researched? (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Full deep dive, or any specific concerns..."
          rows={3}
        />
      </div>

      <div className="bug-report-field contact-field">
        <label>Contact (optional)</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email, Twitter, etc."
        />
      </div>
    </>
  )
}

function ReportInaccuracyForm({ brand, field, setField, description, setDescription, correction, setCorrection, sources, setSources, contact, setContact }) {
  const updateSource = (index, value) => {
    const next = [...sources]
    next[index] = value
    setSources(next)
  }

  const addSource = () => {
    if (sources.length < 10) setSources([...sources, ''])
  }

  const removeSource = (index) => {
    if (sources.length > 1) setSources(sources.filter((_, i) => i !== index))
  }

  return (
    <>
      <p className="suggestion-intro">
        Flag incorrect information for <strong>{brand?.name}</strong>.
      </p>

      <div className="bug-report-field">
        <label>What's inaccurate? <span className="required">*</span></label>
        <select value={field} onChange={(e) => setField(e.target.value)}>
          <option value="">Select a field...</option>
          {INACCURACY_FIELDS.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="bug-report-field">
        <label>What's wrong? <span className="required">*</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what's incorrect..."
          rows={3}
        />
      </div>

      <div className="bug-report-field">
        <label>What should it say? (optional)</label>
        <textarea
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          placeholder="If you know the correct information..."
          rows={2}
        />
      </div>

      <div className="bug-report-field">
        <label>Sources <span className="required">*</span> <span className="field-hint">(at least 1 required)</span></label>
        {sources.map((src, i) => (
          <div key={i} className="source-input-row">
            <input
              type="url"
              value={src}
              onChange={(e) => updateSource(i, e.target.value)}
              placeholder="https://..."
            />
            {sources.length > 1 && (
              <button type="button" className="source-remove-btn" onClick={() => removeSource(i)} aria-label="Remove source">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {sources.length < 10 && (
          <button type="button" className="source-add-btn" onClick={addSource}>
            <Plus size={14} /> Add source
          </button>
        )}
      </div>

      <div className="bug-report-field contact-field">
        <label>Contact (optional)</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email, Twitter, etc."
        />
      </div>
    </>
  )
}
