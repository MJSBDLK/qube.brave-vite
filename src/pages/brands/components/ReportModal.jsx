import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, FileText, User, Bot, ShieldCheck, ShieldAlert, Info, ClipboardCopy, Check } from 'lucide-react'
import { getDeepResearchPrompt } from '../utils/prompts'

const CITATION_TYPE_LABELS = {
  primary: 'Independent',
  secondary: 'Watchdog/NGO',
  corporate: 'Corporate',
  industry: 'Industry-funded',
}

const CITATION_TYPE_CLASSES = {
  primary: 'cite-icon--primary',
  secondary: 'cite-icon--secondary',
  corporate: 'cite-icon--corporate',
  industry: 'cite-icon--industry',
}

/**
 * Parse report content and render with inline citation icons.
 * Citations are marked as [1], [2], etc. in the content string.
 * Supports basic markdown: ## headers, **bold**, *italic*, paragraphs.
 */
function renderContent(content, citations) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let currentParagraph = []
  let key = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ')
      if (text.trim()) {
        elements.push(
          <p key={key++} className="report-paragraph">
            {renderInlineContent(text, citations)}
          </p>
        )
      }
      currentParagraph = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '') {
      flushParagraph()
      continue
    }

    // H2
    if (trimmed.startsWith('## ')) {
      flushParagraph()
      elements.push(
        <h3 key={key++} className="report-section-title">
          {trimmed.slice(3)}
        </h3>
      )
      continue
    }

    // H3
    if (trimmed.startsWith('### ')) {
      flushParagraph()
      elements.push(
        <h4 key={key++} className="report-subsection-title">
          {trimmed.slice(4)}
        </h4>
      )
      continue
    }

    currentParagraph.push(trimmed)
  }

  flushParagraph()
  return elements
}

/**
 * Render inline text with **bold**, *italic*, and [N] citation markers.
 */
function renderInlineContent(text, citations) {
  // Split on citation markers [N] and markdown formatting
  const parts = []
  let remaining = text
  let partKey = 0

  while (remaining.length > 0) {
    // Find the next citation marker
    const citeMatch = remaining.match(/\[(\d+)\]/)
    // Find the next bold marker
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Find the next italic marker (single *)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)

    // Find which comes first
    const matches = [
      citeMatch && { type: 'cite', match: citeMatch, index: citeMatch.index },
      boldMatch && { type: 'bold', match: boldMatch, index: boldMatch.index },
      italicMatch && { type: 'italic', match: italicMatch, index: italicMatch.index },
    ].filter(Boolean).sort((a, b) => a.index - b.index)

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    const first = matches[0]

    // Add text before the match
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index))
    }

    if (first.type === 'cite') {
      const citationId = parseInt(first.match[1], 10)
      const citation = citations?.find(c => c.id === citationId)
      parts.push(
        <CitationIcon key={`cite-${partKey++}`} citation={citation} id={citationId} />
      )
      remaining = remaining.slice(first.index + first.match[0].length)
    } else if (first.type === 'bold') {
      parts.push(
        <strong key={`bold-${partKey++}`}>{first.match[1]}</strong>
      )
      remaining = remaining.slice(first.index + first.match[0].length)
    } else if (first.type === 'italic') {
      parts.push(
        <em key={`italic-${partKey++}`}>{first.match[1]}</em>
      )
      remaining = remaining.slice(first.index + first.match[0].length)
    }
  }

  return parts
}

function CitationIcon({ citation, id }) {
  if (!citation) {
    return <sup className="cite-icon cite-icon--missing">[{id}]</sup>
  }

  const typeClass = CITATION_TYPE_CLASSES[citation.type] || ''
  const typeLabel = CITATION_TYPE_LABELS[citation.type] || citation.type
  const tooltip = `${citation.label}\n${typeLabel}${citation.accessed ? `\nAccessed: ${citation.accessed}` : ''}`

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`cite-icon ${typeClass}`}
      title={tooltip}
    >
      <sup>{id}</sup>
    </a>
  )
}

export default function ReportModal({ brand, onClose }) {
  const overlayRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleCopyResearchPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getDeepResearchPrompt(brand.name))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const hasReport = !!brand?.report
  const hasSummary = !hasReport && !!brand?.summary
  if (!hasReport && !hasSummary) return null

  const { report } = brand

  // Full report mode
  if (hasReport) {
    const isAI = report.generatedBy === 'ai-agent'

    return (
      <div className="report-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="report-modal">
          {/* Header */}
          <div className="report-modal-header">
            <div className="report-modal-title-row">
              <FileText size={18} />
              <h2 className="report-modal-title">
                {brand.name} — Research Report
              </h2>
            </div>
            <button className="report-modal-close" onClick={onClose} aria-label="Close report">
              <X size={18} />
            </button>
          </div>

          {/* Meta bar */}
          <div className="report-meta-bar">
            <span className="report-meta-item">
              {isAI ? <Bot size={13} /> : <User size={13} />}
              {isAI ? 'AI-generated' : 'Admin-curated'}
            </span>
            {report.verified ? (
              <span className="report-meta-item report-meta--verified">
                <ShieldCheck size={13} /> Verified
              </span>
            ) : (
              <span className="report-meta-item report-meta--unverified">
                <ShieldAlert size={13} /> Unverified
              </span>
            )}
            <span className="report-meta-item">
              {report.generatedDate}
            </span>
            {report.promptVersion && (
              <span
                className="report-meta-item report-meta--version"
                title={`Generated with v${report.promptVersion} of the research prompt${report.model ? ` and ${report.model}` : ''}`}
              >
                <Info size={13} />
                v{report.promptVersion}
              </span>
            )}
            {report.citations && (
              <span className="report-meta-item">
                {report.citations.length} source{report.citations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="report-content">
            {renderContent(report.content, report.citations)}
          </div>

          {/* Citations list */}
          {report.citations && report.citations.length > 0 && (
            <div className="report-citations">
              <h4 className="report-citations-title">Sources</h4>
              <ol className="report-citations-list">
                {report.citations.map(cite => (
                  <li key={cite.id} className="report-citation-item">
                    <span className={`cite-type-badge ${CITATION_TYPE_CLASSES[cite.type] || ''}`}>
                      {CITATION_TYPE_LABELS[cite.type] || cite.type}
                    </span>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="report-citation-link"
                    >
                      {cite.label} <ExternalLink size={11} />
                    </a>
                    {cite.accessed && (
                      <span className="report-citation-date">Accessed {cite.accessed}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Summary fallback mode
  return (
    <div className="report-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="report-modal">
        {/* Header */}
        <div className="report-modal-header">
          <div className="report-modal-title-row">
            <Info size={18} />
            <h2 className="report-modal-title">
              {brand.name} — Summary
            </h2>
          </div>
          <button className="report-modal-close" onClick={onClose} aria-label="Close summary">
            <X size={18} />
          </button>
        </div>

        {/* Meta bar */}
        <div className="report-meta-bar">
          <span className="report-meta-item report-meta--unverified">
            <ShieldAlert size={13} /> Unverified summary
          </span>
          {brand.lastUpdated && (
            <span className="report-meta-item">
              {brand.lastUpdated}
            </span>
          )}
          {brand.sources && brand.sources.length > 0 && (
            <span className="report-meta-item">
              {brand.sources.length} source{brand.sources.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            className={`report-meta-copy-btn ${copied ? 'report-meta-copy-btn--copied' : ''}`}
            onClick={handleCopyResearchPrompt}
            title={copied ? 'Copied!' : 'Copy deep research prompt to clipboard'}
          >
            {copied ? <><Check size={13} /> Copied</> : <><ClipboardCopy size={13} /> Research prompt</>}
          </button>
        </div>

        {/* Content — reuse the same markdown renderer */}
        <div className="report-content">
          {renderContent(brand.summary, null)}
        </div>

        {/* Sources */}
        {brand.sources && brand.sources.length > 0 && (
          <div className="report-citations">
            <h4 className="report-citations-title">Sources</h4>
            <ol className="report-citations-list">
              {brand.sources.map((source, i) => (
                <li key={i} className="report-citation-item">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="report-citation-link"
                  >
                    {source.label} <ExternalLink size={11} />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
