import { useState, useEffect, useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { useDatasetSuggestion } from '../../contexts/DatasetSuggestionContext'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import ChartControls from './components/ChartControls'
import DataFreshness from './components/DataFreshness'
import LoadingOverlay from './components/LoadingOverlay'
import { transformData } from './utils/dataTransforms'

// Dedupe and sort data by timestamp
function dedupeAndSort(data) {
  if (!data) return null
  const map = new Map()
  for (const point of data) {
    map.set(point.time, point.value)
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({ time, value }))
}

// Available options (both dropdowns share the same list)
const DATA_SERIES = [
  // Assets
  { id: 'sp500', label: 'S&P 500', file: 'sp500.json' },
  { id: 'median-home', label: 'Median Home', file: 'median-home.json' },
  { id: 'beans', label: 'Dried Beans (lb)', file: 'beans.json' },
  { id: 'rice', label: 'Rice (lb)', file: 'rice.json' },
  { id: 'gasoline', label: 'Gasoline (gal)', file: 'gasoline.json' },
  { id: 'beef-retail', label: 'Beef (lb)', file: 'beef-retail.json' },
  { id: 'pork-retail', label: 'Pork (lb)', file: 'pork-retail.json' },
  { id: 'chicken-retail', label: 'Chicken (lb)', file: 'chicken-retail.json' },
  // Measuring sticks
  { id: 'gold', label: 'Gold (oz)', file: 'gold.json' },
  { id: 'silver', label: 'Silver (oz)', file: 'silver.json' },
  { id: 'bitcoin', label: 'Bitcoin', file: 'bitcoin.json' },
  { id: 'labor-hours', label: 'Median Work Hour', file: 'labor-hours.json' },
  { id: 'mfg-wage', label: 'Mfg Work Hour', file: 'mfg-wage.json' },
  { id: 'avg-wage', label: 'Avg Work Hour', file: 'avg-wage.json' },
  { id: 'min-wage', label: 'Min Wage Hour', file: 'min-wage.json' },
  { id: 'usd', label: 'USD (nominal)', file: null },
]

// Unit labels for measuring sticks
const UNIT_LABELS = {
  'gold': 'oz gold',
  'silver': 'oz silver',
  'bitcoin': 'BTC',
  'labor-hours': 'hours',
  'mfg-wage': 'hours',
  'avg-wage': 'hours',
  'min-wage': 'hours',
  'usd': 'USD',
}

// Short "per unit" labels for assets
const ASSET_UNITS = {
  'sp500': '/ share',
  'median-home': '/ home',
  'beans': '/ lb',
  'rice': '/ lb',
  'gasoline': '/ gal',
  'beef-retail': '/ lb',
  'pork-retail': '/ lb',
  'chicken-retail': '/ lb',
  'gold': '/ oz',
  'silver': '/ oz',
  'bitcoin': '/ BTC',
  'labor-hours': '/ hour',
  'mfg-wage': '/ hour',
  'avg-wage': '/ hour',
  'min-wage': '/ hour',
  'usd': '/ $1',
}

// Format timestamp for X-axis
function formatXAxis(timestamp) {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = date.toLocaleString('en-US', { month: 'short' })
  return `${month} ${year}`
}

// Format value for Y-axis and tooltip
function formatValue(value) {
  if (value >= 1000) return value.toFixed(0)
  if (value >= 100) return value.toFixed(1)
  if (value >= 1) return value.toFixed(2)
  return value.toFixed(4)
}

export default function InflationPage() {
  const { openDatasetSuggestion } = useDatasetSuggestion()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rawData, setRawData] = useState({})
  const [metadata, setMetadata] = useState({})
  const [dateRange, setDateRange] = useState('max')
  const [asset, setAsset] = useState('sp500')
  const [measuringStick, setMeasuringStick] = useState('labor-hours')

  // Transform data when selections change
  const chartData = useMemo(() => {
    // X priced in X = always 1
    if (asset === measuringStick) {
      const sourceData = rawData[asset] || Object.values(rawData)[0]
      if (!sourceData) return null
      return dedupeAndSort(sourceData.map(point => ({ time: point.time, value: 1 })))
    }

    // Handle USD as asset (synthetic $1 series)
    if (asset === 'usd') {
      if (!rawData[measuringStick]) return null
      const usdData = rawData[measuringStick].map(point => ({
        time: point.time,
        value: 1,
      }))
      return transformData(usdData, rawData[measuringStick], measuringStick)
    }

    if (!rawData[asset]) return null

    // Handle USD as measuring stick (just return nominal prices)
    if (measuringStick === 'usd') {
      return dedupeAndSort(rawData[asset])
    }

    if (!rawData[measuringStick]) return null
    return transformData(rawData[asset], rawData[measuringStick], measuringStick)
  }, [rawData, asset, measuringStick])

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!chartData) return null

    const now = new Date()
    let startDate = null

    switch (dateRange) {
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case '5y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
        break
      case '10y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())
        break
      case 'max':
      default:
        return chartData
    }

    const startTimestamp = Math.floor(startDate.getTime() / 1000)
    return chartData.filter(d => d.time >= startTimestamp)
  }, [chartData, dateRange])

  // Dynamic label for legend
  const chartLabel = useMemo(() => {
    const assetLabel = DATA_SERIES.find(a => a.id === asset)?.label || asset
    const stickLabel = DATA_SERIES.find(m => m.id === measuringStick)?.label || measuringStick
    return `${assetLabel} in ${stickLabel}`
  }, [asset, measuringStick])

  // Unit label for Y-axis (e.g., "oz gold / share", "hours / home")
  const unitLabel = useMemo(() => {
    const stickUnit = UNIT_LABELS[measuringStick] || measuringStick
    const assetUnit = ASSET_UNITS[asset] || ''
    return `${stickUnit} ${assetUnit}`.trim()
  }, [measuringStick, asset])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)

    try {
      // Collect all files to load (only items with actual data files)
      const filesToLoad = DATA_SERIES
        .filter(d => d.file)
        .map(d => ({ id: d.id, file: d.file }))

      const results = await Promise.all(
        filesToLoad.map(async ({ id, file }) => {
          const res = await fetch(`/data/inflation/${file}`)
          if (!res.ok) throw new Error(`Failed to load ${file}`)
          const data = await res.json()
          return { id, data }
        })
      )

      // Build rawData and metadata objects
      const newRawData = {}
      const newMetadata = {}

      for (const { id, data } of results) {
        // Convert to chart format (keep all data points)
        const chartFormat = data.data.dates.map((date, i) => ({
          time: Math.floor(new Date(date).getTime() / 1000),
          value: data.data.values[i],
        }))
        newRawData[id] = chartFormat
        newMetadata[id] = data.meta
      }

      setRawData(newRawData)
      setMetadata(newMetadata)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    const date = new Date(data.time * 1000)
    return (
      <div className="recharts-custom-tooltip">
        <p className="tooltip-date">
          {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
        <p className="tooltip-value">{formatValue(data.value)} {unitLabel}</p>
      </div>
    )
  }

  return (
    <div className="inflation-page">
      <div className="inflation-header">
        <h1 className="inflation-title">Inflation™</h1>
        <p className="inflation-subtitle">
          Price assets using alternative measuring sticks
        </p>
      </div>

      <div className="inflation-controls">
        <ChartControls
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          asset={asset}
          onAssetChange={setAsset}
          measuringStick={measuringStick}
          onMeasuringStickChange={setMeasuringStick}
          availableOptions={DATA_SERIES}
        />
      </div>

      <div className="inflation-chart-container">
        {loading && <LoadingOverlay />}
        {error && (
          <div className="inflation-error">
            <p>{error}</p>
            <button onClick={loadData}>Retry</button>
          </div>
        )}
        {filteredData && filteredData.length > 0 && (
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b73a3" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6b73a3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatXAxis}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis
                tickFormatter={formatValue}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
                width={80}
                label={{
                  value: unitLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#9ca3af', fontSize: 12 },
                  offset: 10,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#6b73a3"
                strokeWidth={2}
                fill="url(#areaGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="inflation-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#6b73a3' }} />
          <span className="legend-label">{chartLabel}</span>
        </div>
      </div>

      <DataFreshness metadata={metadata} activeIds={[asset, measuringStick]} />

      <div className="inflation-suggest">
        <button className="suggest-dataset-btn" onClick={openDatasetSuggestion}>
          <Lightbulb size={16} />
          Suggest a Dataset
        </button>
      </div>
    </div>
  )
}
