import { ExternalLink, AlertTriangle, FlaskConical, ShieldCheck, ShieldX } from 'lucide-react'

const WELFARE_LABELS = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
  unknown: 'Unknown',
}

export default function BrandDetailPanel({ brand }) {
  const { animalWelfare, sources, notes, dateAdded, lastUpdated } = brand

  return (
    <div className="brand-detail-panel">
      <div className="brand-detail-grid">
        {/* Animal Welfare Details */}
        <div className="brand-detail-section">
          <div className="brand-detail-label">Animal Welfare</div>
          <div className="brand-detail-value">
            <span className={`welfare-badge welfare-badge--${animalWelfare.rating}`}>
              {WELFARE_LABELS[animalWelfare.rating]}
            </span>
            <div className="brand-welfare-flags">
              {animalWelfare.supplyChainAbuse && (
                <span className="welfare-flag welfare-flag--danger">
                  <AlertTriangle size={12} /> Supply chain abuse
                </span>
              )}
              {animalWelfare.testingOnAnimals ? (
                <span className="welfare-flag welfare-flag--danger">
                  <FlaskConical size={12} /> Tests on animals
                </span>
              ) : (
                <span className="welfare-flag welfare-flag--safe">
                  <ShieldCheck size={12} /> No animal testing
                </span>
              )}
              {!animalWelfare.supplyChainAbuse && (
                <span className="welfare-flag welfare-flag--safe">
                  <ShieldCheck size={12} /> No supply chain abuse
                </span>
              )}
            </div>
            {animalWelfare.notes && (
              <p className="brand-detail-notes">{animalWelfare.notes}</p>
            )}
          </div>
        </div>

        {/* General Notes */}
        {notes && (
          <div className="brand-detail-section">
            <div className="brand-detail-label">Notes</div>
            <div className="brand-detail-value">
              <p className="brand-detail-notes">{notes}</p>
            </div>
          </div>
        )}

        {/* Sources */}
        {sources && sources.length > 0 && (
          <div className="brand-detail-section">
            <div className="brand-detail-label">Sources</div>
            <div className="brand-detail-value">
              <ul className="brand-source-list">
                {sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="brand-source-link"
                    >
                      {source.label} <ExternalLink size={11} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="brand-detail-section">
          <div className="brand-detail-dates">
            Added {dateAdded}{lastUpdated !== dateAdded && ` · Updated ${lastUpdated}`}
          </div>
        </div>
      </div>
    </div>
  )
}
