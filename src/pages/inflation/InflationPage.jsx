import { useState, useEffect, useRef, useMemo } from 'react'
import { createChart, AreaSeries } from 'lightweight-charts'
import ChartControls from './components/ChartControls'
import DataFreshness from './components/DataFreshness'
import LoadingOverlay from './components/LoadingOverlay'
import { transformData } from './utils/dataTransforms'

// Dedupe and sort data by timestamp (Lightweight Charts requires unique ascending times)
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

// Normalize data to monthly frequency (first data point per month)
// This prevents time-axis distortion when data changes from monthly to daily
function normalizeToMonthly(data) {
  if (!data || data.length === 0) return data

  const monthMap = new Map()
  for (const point of data) {
    const date = new Date(point.time * 1000)
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`
    // Keep first data point for each month
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, point)
    }
  }

  return [...monthMap.values()].sort((a, b) => a.time - b.time)
}

// Available options (both dropdowns share the same list)
const DATA_SERIES = [
  { id: 'sp500', label: 'S&P 500', file: 'sp500.json' },
  { id: 'gold', label: 'Gold (oz)', file: 'gold.json' },
  { id: 'bitcoin', label: 'Bitcoin', file: 'bitcoin.json' },
  { id: 'labor-hours', label: 'Labor-Hours', file: 'labor-hours.json' },
  { id: 'usd', label: 'USD (nominal)', file: null },
]

export default function InflationPage() {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

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

  // Dynamic label for legend
  const chartLabel = useMemo(() => {
    const assetLabel = DATA_SERIES.find(a => a.id === asset)?.label || asset
    const stickLabel = DATA_SERIES.find(m => m.id === measuringStick)?.label || measuringStick
    return `${assetLabel} in ${stickLabel}`
  }, [asset, measuringStick])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !chartData) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: false,
        uniformDistribution: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        mode: 0,
      },
      localization: {
        priceFormatter: (price) => {
          if (price >= 1000) return price.toFixed(0)
          if (price >= 100) return price.toFixed(1)
          if (price >= 1) return price.toFixed(2)
          return price.toFixed(4)
        },
      },
    })

    // Create area series (v5 API)
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#6b73a3',
      topColor: 'rgba(107, 115, 163, 0.4)',
      bottomColor: 'rgba(107, 115, 163, 0.0)',
      lineWidth: 2,
    })

    series.setData(chartData)

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // Fit content
    chart.timeScale().fitContent()

    chartRef.current = chart
    seriesRef.current = series

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [chartData])

  // Filter data by date range
  useEffect(() => {
    if (!chartRef.current || !chartData) return

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
        startDate = null
    }

    if (startDate) {
      const startTimestamp = Math.floor(startDate.getTime() / 1000)
      chartRef.current.timeScale().setVisibleRange({
        from: startTimestamp,
        to: Math.floor(now.getTime() / 1000),
      })
    } else {
      chartRef.current.timeScale().fitContent()
    }
  }, [dateRange, chartData])

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
        // Convert to chart format
        const chartFormat = data.data.dates.map((date, i) => ({
          time: Math.floor(new Date(date).getTime() / 1000),
          value: data.data.values[i],
        }))
        // Normalize to monthly to prevent time-axis distortion from mixed frequencies
        newRawData[id] = normalizeToMonthly(chartFormat)
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
        <div
          ref={chartContainerRef}
          className="inflation-chart"
        />
      </div>

      <div className="inflation-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#6b73a3' }} />
          <span className="legend-label">{chartLabel}</span>
        </div>
      </div>

      <DataFreshness metadata={metadata} />
    </div>
  )
}
