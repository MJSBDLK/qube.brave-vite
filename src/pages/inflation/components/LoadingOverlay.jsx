import React from 'react'

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <span className="loading-text">Loading data...</span>
    </div>
  )
}
