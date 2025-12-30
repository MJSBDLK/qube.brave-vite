export default function ChartControls({
  dateRange,
  onDateRangeChange,
  asset,
  onAssetChange,
  measuringStick,
  onMeasuringStickChange,
  availableOptions,
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
        <label className="control-label">Asset</label>
        <select
          className="control-select"
          value={asset}
          onChange={(e) => onAssetChange(e.target.value)}
        >
          {availableOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label className="control-label">priced in</label>
        <select
          className="control-select"
          value={measuringStick}
          onChange={(e) => onMeasuringStickChange(e.target.value)}
        >
          {availableOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
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
