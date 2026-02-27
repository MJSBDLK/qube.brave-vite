import { Search, AlertTriangle, ThumbsUp } from 'lucide-react'

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
  showShitListOnly,
  setShowShitListOnly,
  showRecommendedOnly,
  setShowRecommendedOnly,
}) {
  const toggleInArray = (arr, setArr, value) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }

  return (
    <div className="brands-filter-bar">
      {/* Search */}
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

      {/* Filter groups */}
      <div className="brands-filter-groups">
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
