import React from 'react'
import { EyeOff, Bug } from 'lucide-react'
import { useBugReport } from '../contexts/BugReportContext'

export default function Footer() {
  const { openBugReport } = useBugReport()

  const handleBugClick = (e) => {
    e.preventDefault()
    openBugReport()
  }

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Left side - Keep minimal or empty */}
        <div className="footer-left">
          {/* Could add version info or leave empty */}
        </div>

        {/* Center - Minimal links */}
        <div className="footer-center">
          <nav className="footer-nav">
            {/* Is this even working? */}
            <a href="#" className="footer-link" title="Coming soonish"><EyeOff /></a>
            <button
              className="footer-link"
              onClick={handleBugClick}
              title="Report a bug"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Bug />
            </button>
          </nav>
        </div>

        {/* Right side - Empty for now */}
        <div className="footer-right">
          {/* Removed system status until we implement monitoring */}
        </div>
      </div>
    </footer>
  )
}
