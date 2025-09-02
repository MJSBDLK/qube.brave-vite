import React from 'react'
import { useLocation } from 'react-router-dom'
import IPFSIndicator from './IPFSIndicator'

export default function Header({ onMenuToggle, sidebarOpen }) {
  const location = useLocation()
  
  // Get the page title based on the current route
  // Always shows qube.brave regardless of IPFS hash in actual URL
  const getPageTitle = () => {
    const baseDomain = 'qube.brave'
    
    if (location.pathname === '/' || location.pathname === '') return baseDomain
    if (location.pathname === '/ramps' || location.pathname === '/ramps/') return `${baseDomain}/ramps`
    
    // Clean up path and add to domain
    const cleanPath = location.pathname.replace(/\/$/, '') // Remove trailing slash
    return `${baseDomain}${cleanPath}`
  }

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Left side - Hamburger + Title */}
        <div className="header-left">
          <button 
            className="hamburger-btn" 
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            <div className={`hamburger-icon ${sidebarOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <h1 className="brand-text">{getPageTitle()}</h1>
        </div>

        {/* Right side - Actions */}
        <div className="header-actions">
          <IPFSIndicator />
          
          <button className="header-btn" aria-label="Search">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
          
          {/* User Profile - shown when we implement auth */}
          <div className="header-user" style={{ display: 'none' }}>
            <div className="user-avatar">Q</div>
            <div className="user-info">
              <div className="user-name">Quinn Davis</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
