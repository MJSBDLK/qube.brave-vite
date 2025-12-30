/**
 * Transform asset data using a measuring stick
 *
 * @param {Array} assetData - Array of {time, value} for the asset
 * @param {Array} stickData - Array of {time, value} for the measuring stick
 * @param {string} stickType - Type of measuring stick ('labor-hours', 'gold', 'bitcoin')
 * @returns {Array} Transformed data as {time, value}
 */
export function transformData(assetData, stickData, stickType) {
  // Build a map of measuring stick values by timestamp
  const stickByTime = new Map()
  for (const point of stickData) {
    stickByTime.set(point.time, point.value)
  }

  // Sort stick timestamps for interpolation
  const sortedStickTimes = [...stickByTime.keys()].sort((a, b) => a - b)

  // Find the applicable measuring stick value for a given timestamp
  function getStickValue(timestamp) {
    // Return null if timestamp is before measuring stick data begins
    const firstStickTime = sortedStickTimes[0]
    if (!firstStickTime || timestamp < firstStickTime) {
      return null
    }

    // Find the most recent stick data point on or before this timestamp
    let lastValue = null
    for (const t of sortedStickTimes) {
      if (t <= timestamp) {
        lastValue = stickByTime.get(t)
      } else {
        break
      }
    }
    return lastValue
  }

  // Apply transformation based on stick type
  // Use a Map to dedupe by timestamp (last value wins)
  const resultMap = new Map()
  for (const point of assetData) {
    const stickValue = getStickValue(point.time)

    if (stickValue && stickValue > 0) {
      let transformedValue

      switch (stickType) {
        case 'labor-hours':
          // Weekly earnings / 40 = hourly wage
          // Asset price / hourly wage = labor hours
          transformedValue = point.value / (stickValue / 40)
          break
        case 'gold':
          // Asset price / gold price per oz = oz of gold
          transformedValue = point.value / stickValue
          break
        case 'bitcoin':
          // Asset price / BTC price = BTC
          transformedValue = point.value / stickValue
          break
        default:
          transformedValue = point.value / stickValue
      }

      resultMap.set(point.time, transformedValue)
    }
  }

  // Convert to sorted array (ascending by time)
  return [...resultMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([time, value]) => ({ time, value }))
}

/**
 * Legacy function for backwards compatibility
 */
export function transformToLaborHours(sp500Data, laborData) {
  const assetData = sp500Data.data.dates.map((date, i) => ({
    time: Math.floor(new Date(date).getTime() / 1000),
    value: sp500Data.data.values[i],
  }))

  const stickData = laborData.data.dates.map((date, i) => ({
    time: Math.floor(new Date(date).getTime() / 1000),
    value: laborData.data.values[i],
  }))

  return transformData(assetData, stickData, 'labor-hours')
}
