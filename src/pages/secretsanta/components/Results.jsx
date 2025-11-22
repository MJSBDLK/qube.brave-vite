import React from 'react'
import { hashToColor, getContrastingTextColor } from '../../ramps/utils/colorUtils'

export default function Results({ results, warning, clanModeEnabled, onReset }) {
  const getClanStyles = (clanName) => {
    // "No Clan" gets neutral gray
    if (clanName === 'No Clan') {
      return {
        backgroundColor: '#7f7f7f',
        color: '#ffffff'
      }
    }

    const bgColor = hashToColor(clanName)
    const textColor = getContrastingTextColor(bgColor)
    return {
      backgroundColor: bgColor,
      color: textColor
    }
  }

  const exportToCSV = () => {
    // Create CSV header
    const headers = clanModeEnabled
      ? ['Giver', 'Giver Clan', 'Receiver', 'Receiver Clan', 'Pre-selected']
      : ['Giver', 'Receiver', 'Pre-selected']

    // Create CSV rows
    const rows = results.map(({ giver, receiver, isPreSelected }) => {
      if (clanModeEnabled) {
        return [
          giver.name,
          giver.clan,
          receiver.name,
          receiver.clan,
          isPreSelected ? 'Yes' : 'No'
        ]
      } else {
        return [
          giver.name,
          receiver.name,
          isPreSelected ? 'Yes' : 'No'
        ]
      }
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `secret-santa-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="results-section">
      <div className="results-header">
        <h2>Secret Santa Assignments</h2>
        <div className="results-actions">
          <button className="c-button c-button--ghost" onClick={exportToCSV}>
            Export to CSV
          </button>
          <button className="c-button c-button--secondary" onClick={onReset}>
            Start Over
          </button>
        </div>
      </div>

      {warning && (
        <div className="warning-banner">
          ⚠️ {warning}
        </div>
      )}

      <div className="results-list">
        {results.map(({ giver, receiver, isPreSelected }) => (
          <div key={giver.id} className="result-item">
            <div className="result-giver">
              <strong>{giver.name}</strong>
              {clanModeEnabled && <span className="clan-tag" style={getClanStyles(giver.clan)}>{giver.clan}</span>}
            </div>
            <div className="result-arrow">→</div>
            <div className="result-receiver">
              <strong>{receiver.name}</strong>
              {clanModeEnabled && <span className="clan-tag" style={getClanStyles(receiver.clan)}>{receiver.clan}</span>}
            </div>
            {isPreSelected && (
              <span className="pre-selected-badge">Pre-selected</span>
            )}
          </div>
        ))}
      </div>

      <div className="results-footer">
        <p className="hint">
          💡 Copy these assignments and share them individually with each participant
        </p>
      </div>
    </div>
  )
}
