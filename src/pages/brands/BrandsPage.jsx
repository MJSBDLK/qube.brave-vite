import { useState, useEffect, useMemo, useCallback } from 'react'
import { ShieldCheck, AlertTriangle, Star, Sparkles, Check, Search } from 'lucide-react'
import FilterBar from './components/FilterBar'
import BrandsTable from './components/BrandsTable'
import ReportModal from './components/ReportModal'
import { getDiscoveryPrompt, getDeepResearchPrompt } from './utils/prompts'
import { useBrandFeedback } from '../../contexts/BrandFeedbackContext'

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedOwnership, setSelectedOwnership] = useState([])
  const [selectedWelfare, setSelectedWelfare] = useState([])
  const [selectedPriceTiers, setSelectedPriceTiers] = useState([])
  const [showShitListOnly, setShowShitListOnly] = useState(false)
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false)

  // Report modal state
  const [reportBrand, setReportBrand] = useState(null)
  const handleViewReport = useCallback((brand) => setReportBrand(brand), [])
  const handleCloseReport = useCallback(() => setReportBrand(null), [])

  const { openRequestResearch } = useBrandFeedback()

  // Discovery prompt state
  const [discoverInput, setDiscoverInput] = useState('')
  const [discoverCopied, setDiscoverCopied] = useState(false)

  const handleDiscoverCopy = async () => {
    if (!discoverInput.trim()) return
    try {
      await navigator.clipboard.writeText(getDiscoveryPrompt(discoverInput.trim()))
      setDiscoverCopied(true)
      setTimeout(() => setDiscoverCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Research brand prompt state
  const [researchInput, setResearchInput] = useState('')
  const [researchCopied, setResearchCopied] = useState(false)

  const handleResearchCopy = async () => {
    if (!researchInput.trim()) return
    try {
      await navigator.clipboard.writeText(getDeepResearchPrompt(researchInput.trim()))
      setResearchCopied(true)
      setTimeout(() => setResearchCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Load data
  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch('./data/brands/brands.json')
        if (!res.ok) throw new Error('Failed to load brands data')
        const json = await res.json()
        setBrands(json.brands.filter(b => !b.sample))
      } catch (err) {
        console.error('Error loading brands:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadBrands()
  }, [])

  // Derive unique filter options from data
  const allCategories = useMemo(() => {
    const set = new Set()
    brands.forEach(b => b.categories.forEach(c => set.add(c)))
    return [...set].sort()
  }, [brands])

  const allOwnershipTypes = useMemo(() => {
    const set = new Set()
    brands.forEach(b => {
      const types = Array.isArray(b.ownershipType) ? b.ownershipType : [b.ownershipType]
      types.forEach(t => set.add(t))
    })
    return [...set].sort()
  }, [brands])

  const allWelfareRatings = useMemo(() => {
    const order = ['good', 'moderate', 'poor', 'unknown']
    const set = new Set()
    brands.forEach(b => set.add(b.animalWelfare.rating))
    return order.filter(r => set.has(r))
  }, [brands])

  const allPriceTiers = useMemo(() => {
    const set = new Set()
    brands.forEach(b => { if (b.priceTier) set.add(b.priceTier) })
    return [...set].sort((a, b) => a - b)
  }, [brands])

  // Filtered data
  const filteredBrands = useMemo(() => {
    let result = brands

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.parentCompany && b.parentCompany.toLowerCase().includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q)) ||
        (b.tldr && b.tldr.toLowerCase().includes(q)) ||
        b.categories.some(c => c.toLowerCase().includes(q))
      )
    }

    if (selectedCategories.length > 0) {
      result = result.filter(b =>
        b.categories.some(c => selectedCategories.includes(c))
      )
    }

    if (selectedOwnership.length > 0) {
      result = result.filter(b => {
        const types = Array.isArray(b.ownershipType) ? b.ownershipType : [b.ownershipType]
        return types.some(t => selectedOwnership.includes(t))
      })
    }

    if (selectedWelfare.length > 0) {
      result = result.filter(b => selectedWelfare.includes(b.animalWelfare.rating))
    }

    if (selectedPriceTiers.length > 0) {
      result = result.filter(b => b.priceTier && selectedPriceTiers.includes(b.priceTier))
    }

    if (showShitListOnly) result = result.filter(b => b.shitList)
    if (showRecommendedOnly) result = result.filter(b => b.recommended)

    return result
  }, [brands, searchQuery, selectedCategories, selectedOwnership, selectedWelfare, selectedPriceTiers, showShitListOnly, showRecommendedOnly])

  // Summary stats
  const stats = useMemo(() => ({
    total: brands.length,
    recommended: brands.filter(b => b.recommended).length,
    shitList: brands.filter(b => b.shitList).length,
    avgRating: brands.length > 0
      ? (brands.reduce((sum, b) => sum + b.starRating, 0) / brands.length).toFixed(1)
      : '—',
  }), [brands])

  if (loading) {
    return (
      <div className="brands-page">
        <div className="brands-loading">Loading brands data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="brands-page">
        <div className="brands-error">
          <p>Failed to load brands data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="brands-page">
      {/* Header */}
      <div className="brands-header">
        <div className="brands-header-top">
          <div>
            <h1 className="brands-title">Brands Spreadsheet</h1>
            <p className="brands-subtitle">
              Tracking corporate ownership, animal welfare practices, and supply chain ethics
            </p>
          </div>
          <div className="brands-prompt-builders">
            <div className="brands-discover">
              <label className="brands-discover-label">Discover brands</label>
              <div className="brands-discover-row">
                <span className="brands-discover-prefix">I want to buy</span>
                <input
                  type="text"
                  className="brands-discover-input"
                  placeholder="shampoo"
                  value={discoverInput}
                  onChange={e => setDiscoverInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDiscoverCopy()}
                />
                <button
                  className={`brands-discover-btn ${discoverCopied ? 'brands-discover-btn--copied' : ''}`}
                  onClick={handleDiscoverCopy}
                  disabled={!discoverInput.trim()}
                  title={discoverCopied ? 'Copied!' : 'Copy discovery prompt to clipboard'}
                >
                  {discoverCopied ? <><Check size={14} /> Copied</> : <><Sparkles size={14} /> Copy prompt</>}
                </button>
              </div>
            </div>
            <div className="brands-discover">
              <label className="brands-discover-label">Research brand</label>
              <div className="brands-discover-row">
                <span className="brands-discover-prefix">Interested in</span>
                <input
                  type="text"
                  className="brands-discover-input"
                  placeholder="Dr. Bronner's"
                  value={researchInput}
                  onChange={e => setResearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleResearchCopy()}
                />
                <button
                  className={`brands-discover-btn ${researchCopied ? 'brands-discover-btn--copied' : ''}`}
                  onClick={handleResearchCopy}
                  disabled={!researchInput.trim()}
                  title={researchCopied ? 'Copied!' : 'Copy deep research prompt to clipboard'}
                >
                  {researchCopied ? <><Check size={14} /> Copied</> : <><Sparkles size={14} /> Copy prompt</>}
                </button>
              </div>
            </div>
          </div>
          <button
            className="brands-suggest-btn"
            onClick={() => openRequestResearch(null)}
            title="Suggest a brand for us to research"
          >
            <Search size={14} /> Suggest a brand
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="brands-stats">
        <div className="brands-stat-card">
          <div className="brands-stat-value">{stats.total}</div>
          <div className="brands-stat-label">Brands Tracked</div>
        </div>
        <div className="brands-stat-card brands-stat-card--success">
          <div className="brands-stat-value">
            <ShieldCheck size={18} className="brands-stat-icon--success" /> {stats.recommended}
          </div>
          <div className="brands-stat-label">Recommended</div>
        </div>
        <div className="brands-stat-card brands-stat-card--danger">
          <div className="brands-stat-value">
            <AlertTriangle size={18} className="brands-stat-icon--danger" /> {stats.shitList}
          </div>
          <div className="brands-stat-label">Shit List</div>
        </div>
        <div className="brands-stat-card">
          <div className="brands-stat-value">
            <Star size={18} className="brands-stat-icon--gold" /> {stats.avgRating}
          </div>
          <div className="brands-stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        allOwnershipTypes={allOwnershipTypes}
        selectedOwnership={selectedOwnership}
        setSelectedOwnership={setSelectedOwnership}
        allWelfareRatings={allWelfareRatings}
        selectedWelfare={selectedWelfare}
        setSelectedWelfare={setSelectedWelfare}
        allPriceTiers={allPriceTiers}
        selectedPriceTiers={selectedPriceTiers}
        setSelectedPriceTiers={setSelectedPriceTiers}
        showShitListOnly={showShitListOnly}
        setShowShitListOnly={setShowShitListOnly}
        showRecommendedOnly={showRecommendedOnly}
        setShowRecommendedOnly={setShowRecommendedOnly}
      />

      {/* Table */}
      <BrandsTable data={filteredBrands} onViewReport={handleViewReport} />

      {/* Report Modal */}
      {reportBrand && (
        <ReportModal brand={reportBrand} onClose={handleCloseReport} />
      )}
    </div>
  )
}
