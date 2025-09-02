import React from 'react'
import { EyeOff, Bug } from 'lucide-react'

export default function Footer() {
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
            <a href="#" className="footer-link" title="Coming soon"><Bug /></a>
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
