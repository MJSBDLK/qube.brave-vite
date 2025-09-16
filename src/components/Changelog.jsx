import React, { useState } from 'react'

export default function Changelog({ entries = [], title = "Changelog", defaultCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  if (!entries || entries.length === 0) {
    return null
  }

  return (
    <div className="changelog-section">
      <div className="changelog-header" onClick={toggleCollapsed}>
        <h3 className="changelog-title">{title}</h3>
        <button className="changelog-toggle-btn" type="button">
          {collapsed ? '↓' : '↑'}
        </button>
      </div>
      
      {!collapsed && (
        <div className="changelog-content">
          {entries.map((entry, index) => (
            <ChangelogEntry key={entry.version || index} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChangelogEntry({ entry }) {
  const { version, date, changes = [] } = entry

  return (
    <div className="changelog-entry">
      <div className="changelog-version-header">
        <div className="changelog-version">{version}</div>
        {date && <div className="changelog-date">{date}</div>}
      </div>
      
      {changes.length > 0 && (
        <ul className="changelog-changes">
          {changes.map((change, index) => (
            <li key={index} className="changelog-change">
              {change}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}