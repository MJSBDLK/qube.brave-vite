import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

function FreshnessCard({ id, meta, formatDate, getStatusBadge }) {
  const [expanded, setExpanded] = useState(false)
  const hasCaveats = meta.caveats?.length > 0
  const hasDetails = meta.caveats?.length > 1

  return (
    <div className="freshness-item">
      <div className="freshness-header">
        <span className="freshness-name">{meta.description || id}</span>
        {getStatusBadge(meta.status)}
      </div>
      <div className="freshness-details">
        <span>Source: {meta.source} ({meta.fredSeriesId || meta.seriesId || id})</span>
        <span>Updated: {formatDate(meta.lastUpdated)}</span>
        <span>Range: {meta.dateRange?.start} to {meta.dateRange?.end}</span>
        <span>{meta.recordCount?.toLocaleString()} records ({meta.frequency})</span>
        {hasCaveats && (
          <div className="freshness-caveat-section">
            <span className="freshness-caveat">
              Note: {meta.caveats[0]}
            </span>
            {hasDetails && (
              <>
                <button
                  className="freshness-caveat-toggle"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? 'Less' : 'More details'}
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {expanded && (
                  <ul className="freshness-caveat-details">
                    {meta.caveats.slice(1).map((caveat, i) => (
                      <li key={i}>{caveat}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DataFreshness({ metadata, activeIds = [] }) {
  if (!metadata || Object.keys(metadata).length === 0) return null

  // Filter to only show active datasets
  const activeMetadata = activeIds
    .filter(id => id && id !== 'usd' && metadata[id])
    .map(id => [id, metadata[id]])

  if (activeMetadata.length === 0) return null

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown'
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="status-badge status-success">Current</span>
      case 'stale':
        return <span className="status-badge status-stale">Stale</span>
      case 'error':
        return <span className="status-badge status-error">Error</span>
      default:
        return <span className="status-badge status-pending">Pending</span>
    }
  }

  return (
    <div className="data-freshness">
      <h3 className="freshness-title">Data Sources</h3>
      <div className="freshness-grid">
        {activeMetadata.map(([id, meta]) => (
          <FreshnessCard
            key={id}
            id={id}
            meta={meta}
            formatDate={formatDate}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>
    </div>
  )
}
