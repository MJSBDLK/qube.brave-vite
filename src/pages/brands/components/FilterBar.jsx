import { useState } from 'react'
import { Search, AlertTriangle, ThumbsUp, SlidersHorizontal, ChevronUp } from 'lucide-react'

const OWNERSHIP_LABELS = {
  family: 'Family',
  founder: 'Founder',
  cooperative: 'Co-op',
  public: 'Public',
  'venture-backed': 'VC-backed',
  'private-equity': 'PE-owned',
  megacorp: 'Megacorp',
}

const WELFARE_LABELS = {
  good: 'Good',
  moderate: 'Moderate',
  poor: 'Poor',
  unknown: 'Unknown',
}

const PRICE_TIER_LABELS = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  allCategories,
  selectedCategories,
  setSelectedCategories,
  allOwnershipTypes,
  selectedOwnership,
  setSelectedOwnership,
  allWelfareRatings,
  selectedWelfare,
  setSelectedWelfare,
  allPriceTiers,
  selectedPriceTiers,
  setSelectedPriceTiers,
  showShitListOnly,
  setShowShitListOnly,
  showRecommendedOnly,
  setShowRecommendedOnly,
}) {
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const activeFilterCount = selectedCategories.length + selectedOwnership.length + selectedWelfare.length + selectedPriceTiers.length + (showShitListOnly ? 1 : 0) + (showRecommendedOnly ? 1 : 0)

  const toggleInArray = (arr, setArr, value) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  return (
    <div className="brands-filter-bar">
      {/* Search + toggle row */}
      <div className="brands-search-row">
        <div className="brands-search-wrapper">
          <Search size={16} className="brands-search-icon" />
          <input
            type="text"
            className="brands-search"
            placeholder="Search brands, companies, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={`brands-filter-toggle-btn ${filtersExpanded ? 'brands-filter-toggle-btn--active' : ''}`}
          onClick={() => setFiltersExpanded(prev => !prev)}
          title={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          {filtersExpanded ? <ChevronUp size={14} /> : <SlidersHorizontal size={14} />}
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Collapsible filter groups */}
      <div className={`brands-filter-groups ${filtersExpanded ? 'brands-filter-groups--expanded' : ''}`}>
        {/* Categories */}
        {allCategories.length > 0 && (
          <div className="brands-filter-group">
            <span className="filter-group-label">Category</span>
            <div className="filter-pills">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  className={`filter-pill ${selectedCategories.includes(cat) ? 'active' : ''}`}
                  onClick={() => toggleInArray(selectedCategories, setSelectedCategories, cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ownership Type */}
        {allOwnershipTypes.length > 0 && (
          <div className="brands-filter-group">
            <span className="filter-group-label">Ownership</span>
            <div className="filter-pills">
              {allOwnershipTypes.map(type => (
                <button
                  key={type}
                  className={`filter-pill ownership-pill--${type} ${selectedOwnership.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleInArray(selectedOwnership, setSelectedOwnership, type)}
                >
                  {OWNERSHIP_LABELS[type] || type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Animal Welfare */}
        {allWelfareRatings.length > 0 && (
          <div className="brands-filter-group">
            <span className="filter-group-label">Animal Welfare</span>
            <div className="filter-pills">
              {allWelfareRatings.map(rating => (
                <button
                  key={rating}
                  className={`filter-pill welfare-pill--${rating} ${selectedWelfare.includes(rating) ? 'active' : ''}`}
                  onClick={() => toggleInArray(selectedWelfare, setSelectedWelfare, rating)}
                >
                  {WELFARE_LABELS[rating] || rating}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Tier */}
        {allPriceTiers.length > 0 && (
          <div className="brands-filter-group">
            <span className="filter-group-label">Price</span>
            <div className="filter-pills">
              {allPriceTiers.map(tier => (
                <button
                  key={tier}
                  className={`filter-pill ${selectedPriceTiers.includes(tier) ? 'active' : ''}`}
                  onClick={() => toggleInArray(selectedPriceTiers, setSelectedPriceTiers, tier)}
                >
                  {PRICE_TIER_LABELS[tier] || `Tier ${tier}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="brands-filter-toggles">
          <button
            className={`filter-toggle ${showShitListOnly ? 'active-danger' : ''}`}
            onClick={() => setShowShitListOnly(prev => !prev)}
          >
            <AlertTriangle size={14} />
            Shit List
          </button>
          <button
            className={`filter-toggle ${showRecommendedOnly ? 'active-success' : ''}`}
            onClick={() => setShowRecommendedOnly(prev => !prev)}
          >
            <ThumbsUp size={14} />
            Recommended
          </button>
        </div>
      </div>
    </div>
  )
}
