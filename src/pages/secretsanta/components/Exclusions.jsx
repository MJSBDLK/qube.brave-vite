import React, { useState } from 'react'

export default function Exclusions({ participants, exclusions, setExclusions }) {
  const [giver, setGiver] = useState('')
  const [receiver, setReceiver] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!giver || !receiver || giver === receiver) return

    // Check if this exclusion already exists
    const exists = exclusions.some(ex => ex.giver === giver && ex.receiver === receiver)
    if (exists) return

    setExclusions([...exclusions, { giver, receiver }])
    setGiver('')
    setReceiver('')
  }

  const handleRemove = (giverToRemove, receiverToRemove) => {
    setExclusions(exclusions.filter(ex =>
      !(ex.giver === giverToRemove && ex.receiver === receiverToRemove)
    ))
  }

  const getParticipantName = (id) => {
    return participants.find(p => p.id === parseInt(id))?.name || 'Unknown'
  }

  return (
    <div className="exclusions-section">
      <div className="section-header">
        <h2>Exclusions (Optional)</h2>
        <button
          className="c-button c-button--secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Hide' : 'Add Exclusion'}
        </button>
      </div>

      <p className="section-description">
        Prevent specific people from being paired together (e.g., "Julia cannot get Aunt Norma")
      </p>

      {showForm && (
        <form onSubmit={handleAdd} className="exclusion-form">
          <div className="form-row">
            <select
              value={giver}
              onChange={(e) => setGiver(e.target.value)}
              className="giver-select"
            >
              <option value="">Select giver...</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <span className="arrow exclusion-arrow">⛔→</span>

            <select
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="receiver-select"
            >
              <option value="">Cannot give to...</option>
              {participants
                .filter(p => p.id.toString() !== giver)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>

            <button type="submit" className="c-button c-button--primary">
              Add
            </button>
          </div>
        </form>
      )}

      {exclusions.length > 0 && (
        <div className="exclusions-list">
          <h3>Excluded pairings:</h3>
          <ul>
            {exclusions.map((ex, idx) => (
              <li key={idx} className="exclusion-item">
                <span className="pairing">
                  <strong>{getParticipantName(ex.giver)}</strong>
                  {' ⛔→ '}
                  {getParticipantName(ex.receiver)}
                </span>
                <button
                  onClick={() => handleRemove(ex.giver, ex.receiver)}
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
