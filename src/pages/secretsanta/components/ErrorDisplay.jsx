import React from 'react'

export default function ErrorDisplay({ error, onReset }) {
  return (
    <div className="error-section">
      <div className="error-header">
        <h2>Configuration Impossible</h2>
      </div>

      <div className="error-content">
        <p className="error-message">{error.message}</p>

        {error.details && error.details.length > 0 && (
          <div className="error-details">
            <h3>Issues found:</h3>
            <ul>
              {error.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="error-suggestions">
          <h3>Suggestions:</h3>
          <ul>
            <li>Add more participants from different clans</li>
            <li>Remove some pre-selections that create conflicts</li>
            <li>Reduce the number of participants in over-constrained clans</li>
          </ul>
        </div>
      </div>

      <button className="c-button c-button--primary" onClick={onReset}>
        Back to Setup
      </button>
    </div>
  )
}
