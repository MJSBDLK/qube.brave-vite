import CategorySelect from './CategorySelect'

export default function ChartControls({
  dateRange,
  onDateRangeChange,
  asset,
  onAssetChange,
  measuringStick,
  onMeasuringStickChange,
  availableOptions,
  categories,
}) {
  const ranges = [
    { id: '1y', label: '1Y' },
    { id: '5y', label: '5Y' },
    { id: '10y', label: '10Y' },
    { id: 'max', label: 'Max' },
  ]

  return (
    <div className="chart-controls">
      <div className="control-group">
        <label className="control-label" id="asset-select-label">Asset</label>
        <CategorySelect
          value={asset}
          onChange={onAssetChange}
          options={availableOptions}
          categories={categories}
          label="Asset"
          id="asset-select"
        />
      </div>

      <div className="control-group">
        <label className="control-label" id="stick-select-label">priced in</label>
        <CategorySelect
          value={measuringStick}
          onChange={onMeasuringStickChange}
          options={availableOptions}
          categories={categories}
          label="priced in"
          id="stick-select"
        />
      </div>

      <div className="control-group">
        <label className="control-label">Date Range</label>
        <div className="range-buttons">
          {ranges.map((range) => (
            <button
              key={range.id}
              className={`range-button ${dateRange === range.id ? 'active' : ''}`}
              onClick={() => onDateRangeChange(range.id)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
