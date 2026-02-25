#!/usr/bin/env node
/**
 * build-sp500.js
 *
 * Downloads Robert Shiller's ie_data.xls (monthly S&P Composite back to 1871),
 * merges with existing FRED daily data (2016+), and outputs sp500.json.
 *
 * Usage: node scripts/build-sp500.js
 */

import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SHILLER_URL = 'http://www.econ.yale.edu/~shiller/data/ie_data.xls'
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'inflation', 'sp500.json')
const TEMP_XLS = path.join(__dirname, '..', '.cache', 'ie_data.xls')

// FRED daily data starts here — use Shiller for everything before this
const FRED_CUTOFF = '2016-01-01'

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const doRequest = (reqUrl) => {
      client.get(reqUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${reqUrl}`))
          return
        }
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      }).on('error', reject)
    }
    doRequest(url)
  })
}

function parseShillerDate(dateNum) {
  // Shiller dates: 1871.01 = Jan 1871, 1871.1 = Oct 1871
  // The decimal is MM/100, so .01 = Jan, .02 = Feb, ..., .1 = Oct, .11 = Nov, .12 = Dec
  const year = Math.floor(dateNum)
  const monthFrac = Math.round((dateNum - year) * 100)
  const month = monthFrac || 1 // default to January if 0
  return `${year}-${String(month).padStart(2, '0')}-01`
}

async function main() {
  // Ensure cache dir exists
  const cacheDir = path.dirname(TEMP_XLS)
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  // Download Shiller data
  console.log('Downloading Shiller ie_data.xls...')
  const xlsBuffer = await download(SHILLER_URL)
  fs.writeFileSync(TEMP_XLS, xlsBuffer)
  console.log(`  Saved to ${TEMP_XLS} (${(xlsBuffer.length / 1024).toFixed(0)} KB)`)

  // Parse the Data sheet
  const wb = XLSX.readFile(TEMP_XLS)
  const ws = wb.Sheets['Data']
  if (!ws) {
    throw new Error('No "Data" sheet found in Shiller workbook')
  }

  // Extract Shiller monthly prices
  // Row 7 is header: Date, P, D, E, CPI, ...
  // Row 8+ is data: 1871.01, 4.44, ...
  const shillerDates = []
  const shillerValues = []
  const range = XLSX.utils.decode_range(ws['!ref'])

  for (let r = 8; r <= range.e.r; r++) {
    const dateCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
    const priceCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]

    if (!dateCell || typeof dateCell.v !== 'number') continue
    if (!priceCell || typeof priceCell.v !== 'number') continue

    const dateStr = parseShillerDate(dateCell.v)
    if (dateStr >= FRED_CUTOFF) break // stop before FRED range

    shillerDates.push(dateStr)
    shillerValues.push(Math.round(priceCell.v * 100) / 100)
  }

  console.log(`  Shiller: ${shillerDates.length} monthly records (${shillerDates[0]} to ${shillerDates[shillerDates.length - 1]})`)

  // Load existing FRED data
  let fredDates = []
  let fredValues = []

  if (fs.existsSync(OUTPUT_PATH)) {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'))
    const cutoffIdx = existing.data.dates.findIndex(d => d >= FRED_CUTOFF)
    if (cutoffIdx >= 0) {
      fredDates = existing.data.dates.slice(cutoffIdx)
      fredValues = existing.data.values.slice(cutoffIdx)
    }
    console.log(`  FRED: ${fredDates.length} daily records (${fredDates[0]} to ${fredDates[fredDates.length - 1]})`)
  } else {
    console.log('  No existing sp500.json found — using Shiller data only')
  }

  // Merge: Shiller monthly + FRED daily
  const allDates = [...shillerDates, ...fredDates]
  const allValues = [...shillerValues, ...fredValues]

  console.log(`  Merged: ${allDates.length} total records (${allDates[0]} to ${allDates[allDates.length - 1]})`)

  // Build output
  const output = {
    meta: {
      seriesId: 'sp500',
      source: 'Shiller/FRED',
      description: 'S&P 500 Index',
      frequency: 'monthly (pre-2016), daily (2016+)',
      category: 'asset',
      lastUpdated: new Date().toISOString(),
      lastAttempted: new Date().toISOString(),
      status: 'success',
      recordCount: allDates.length,
      dateRange: {
        start: allDates[0],
        end: allDates[allDates.length - 1],
      },
      caveats: [
        'Pre-2016: Monthly S&P Composite Index from Robert Shiller (Yale)',
        '2016+: Daily S&P 500 from FRED',
      ],
      error: null,
    },
    data: {
      dates: allDates,
      values: allValues,
    },
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2))
  console.log(`  Written to ${OUTPUT_PATH}`)
  console.log('Done.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
