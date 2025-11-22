import React, { useState } from 'react'
import { hashToColor, getContrastingTextColor } from '../../ramps/utils/colorUtils'

export default function ParticipantInput({ participants, setParticipants, clanModeEnabled }) {
  const [name, setName] = useState('')
  const [clan, setClan] = useState('')

  const clans = [...new Set(participants.map(p => p.clan).filter(Boolean))]

  const handleAdd = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const newParticipant = {
      id: Date.now(),
      name: name.trim(),
      clan: clanModeEnabled ? (clan.trim() || 'No Clan') : 'No Clan'
    }

    setParticipants([...participants, newParticipant])
    setName('')
    setClan('')
  }

  const handleRemove = (id) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

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

  const groupedByClan = participants.reduce((acc, p) => {
    if (!acc[p.clan]) acc[p.clan] = []
    acc[p.clan].push(p)
    return acc
  }, {})

  return (
    <div className="participant-input-section">
      <h2>Participants</h2>

      <form onSubmit={handleAdd} className="participant-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="name-input"
          />
          {clanModeEnabled && (
            <>
              <input
                type="text"
                placeholder="Clan (optional)"
                value={clan}
                onChange={(e) => setClan(e.target.value)}
                list="clan-list"
                className="clan-input"
              />
              <datalist id="clan-list">
                {clans.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </>
          )}
          <button type="submit" className="c-button c-button--primary">
            Add
          </button>
        </div>
      </form>

      {participants.length > 0 && (
        <div className="participants-list">
          {clanModeEnabled ? (
            // Group by clan when clan mode is enabled
            Object.entries(groupedByClan).map(([clanName, members]) => (
              <div key={clanName} className="clan-group">
                <div className="clan-header" style={getClanStyles(clanName)}>
                  <strong>{clanName}</strong> ({members.length})
                </div>
                <ul className="clan-members">
                  {members.map(p => (
                    <li key={p.id} className="participant-item">
                      <span>{p.name}</span>
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="remove-button"
                        title="Remove"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // Simple list when clan mode is disabled
            <div className="clan-group">
              <div className="clan-header" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <strong>Participants</strong> ({participants.length})
              </div>
              <ul className="clan-members">
                {participants.map(p => (
                  <li key={p.id} className="participant-item">
                    <span>{p.name}</span>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="remove-button"
                      title="Remove"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
