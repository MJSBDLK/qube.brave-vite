import { ExternalLink, AlertTriangle, FlaskConical, ShieldCheck, ShieldX, Search } from 'lucide-react'
import { useBrandFeedback } from '../../../contexts/BrandFeedbackContext'

const WELFARE_LABELS = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
  unknown: 'Unknown',
}

const OWNERSHIP_LABELS = {
  family: 'Family',
  founder: 'Founder',
  cooperative: 'Co-op',
  public: 'Public',
  'venture-backed': 'VC-backed',
  'private-equity': 'PE-owned',
  megacorp: 'Megacorp',
}

const PRICE_LABELS = { 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

export default function BrandDetailPanel({ brand }) {
  const { animalWelfare, sources, notes, tldr, dateAdded, lastUpdated, parentCompany, ownershipType, categories, priceTier } = brand
  const { openRequestResearch, openReportInaccuracy } = useBrandFeedback()

  return (
    <div className="brand-detail-panel">
      <div className="brand-detail-grid">
        {/* TL;DR */}
        {tldr && (
          <div className="brand-detail-section">
            <div className="brand-detail-label">tl;dr</div>
            <div className="brand-detail-value">
              <p className="brand-detail-tldr">{tldr}</p>
            </div>
          </div>
        )}

        {/* Quick info row: parent, ownership, categories, price */}
        <div className="brand-detail-section">
          <div className="brand-detail-label">Details</div>
          <div className="brand-detail-quick-info">
            {parentCompany && (
              <span className="brand-detail-meta">
                <span className="brand-detail-meta-key">Parent:</span> {parentCompany}
              </span>
            )}
            {Array.isArray(ownershipType) && ownershipType.length > 0 && (
              <span className="brand-detail-meta">
                {ownershipType.map(t => (
                  <span key={t} className={`ownership-badge ownership-badge--${t}`}>
                    {OWNERSHIP_LABELS[t] || t}
                  </span>
                ))}
              </span>
            )}
            {categories && categories.length > 0 && (
              <span className="brand-detail-meta">
                {categories.map(c => (
                  <span key={c} className="category-pill">{c}</span>
                ))}
              </span>
            )}
            {priceTier && (
              <span className="brand-detail-meta">
                <span className="price-tier">{PRICE_LABELS[priceTier]}</span>
              </span>
            )}
          </div>
        </div>

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

        {/* Dates + Actions */}
        <div className="brand-detail-section">
          <div className="brand-detail-dates">
            Added {dateAdded}{lastUpdated !== dateAdded && ` · Updated ${lastUpdated}`}
            <span className="brand-detail-actions">
              {!brand.report && (
                <button
                  className="brand-detail-action-link"
                  onClick={() => openRequestResearch(brand)}
                >
                  <Search size={11} /> Request research
                </button>
              )}
              <button
                className="brand-detail-action-link"
                onClick={() => openReportInaccuracy(brand)}
              >
                <AlertTriangle size={11} /> Report inaccuracy
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
