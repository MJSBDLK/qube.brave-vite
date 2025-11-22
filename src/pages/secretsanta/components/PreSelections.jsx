import React, { useState } from 'react'

export default function PreSelections({ participants, preSelections, setPreSelections }) {
  const [giver, setGiver] = useState('')
  const [receiver, setReceiver] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!giver || !receiver || giver === receiver) return

    // Check if this giver already has a pre-selection
    const existingIndex = preSelections.findIndex(ps => ps.giver === giver)
    if (existingIndex !== -1) {
      // Replace existing pre-selection
      const updated = [...preSelections]
      updated[existingIndex] = { giver, receiver }
      setPreSelections(updated)
    } else {
      setPreSelections([...preSelections, { giver, receiver }])
    }

    setGiver('')
    setReceiver('')
  }

  const handleRemove = (giverToRemove) => {
    setPreSelections(preSelections.filter(ps => ps.giver !== giverToRemove))
  }

  const getParticipantName = (id) => {
    return participants.find(p => p.id === parseInt(id))?.name || 'Unknown'
  }

  const isSameClan = (giverId, receiverId) => {
    const giverP = participants.find(p => p.id === parseInt(giverId))
    const receiverP = participants.find(p => p.id === parseInt(receiverId))

    // "No Clan" can pair with anyone, including other "No Clan"
    if (giverP?.clan === 'No Clan' || receiverP?.clan === 'No Clan') {
      return false
    }

    return giverP?.clan === receiverP?.clan
  }

  return (
    <div className="pre-selections-section">
      <div className="section-header">
        <h2>Pre-selections (Optional)</h2>
        <button
          className="c-button c-button--secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide' : 'Add Pre-selection'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="pre-selection-form">
          <div className="form-row">
            <select
              value={giver}
              onChange={(e) => setGiver(e.target.value)}
              className="giver-select"
            >
              <option value="">Select giver...</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.clan})
                </option>
              ))}
            </select>

            <span className="arrow">→</span>

            <select
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="receiver-select"
            >
              <option value="">Select receiver...</option>
              {participants
                .filter(p => p.id.toString() !== giver)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clan})
                  </option>
                ))}
            </select>

            <button type="submit" className="c-button c-button--primary">
              Add
            </button>
          </div>

          {giver && receiver && isSameClan(giver, receiver) && (
            <p className="warning-text">
              ⚠️ Warning: This creates a same-clan pairing
            </p>
          )}
        </form>
      )}

      {preSelections.length > 0 && (
        <div className="pre-selections-list">
          <h3>Pre-selected pairings:</h3>
          <ul>
            {preSelections.map(ps => (
              <li key={ps.giver} className="pre-selection-item">
                <span className="pairing">
                  <strong>{getParticipantName(ps.giver)}</strong>
                  {' → '}
                  {getParticipantName(ps.receiver)}
                </span>
                {isSameClan(ps.giver, ps.receiver) && (
                  <span className="same-clan-tag">Same Clan</span>
                )}
                <button
                  onClick={() => handleRemove(ps.giver)}
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
  )
}
