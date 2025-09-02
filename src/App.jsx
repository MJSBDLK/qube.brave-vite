import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Ramps from './pages/Ramps'
import { updatePageMetadata, getDisplayUrl } from './utils/urlUtils'

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close sidebar when navigating to non-home routes
  useEffect(() => {
    if (!isHomepage) {
      closeSidebar()
    }
  }, [isHomepage])

  // Set sidebar open by default on homepage for desktop
  useEffect(() => {
    if (isHomepage && typeof window !== 'undefined' && window.innerWidth >= 960) {
      setSidebarOpen(true)
    }
  }, [isHomepage])

  // Update page metadata based on current route
  useEffect(() => {
    const getPageInfo = () => {
      const baseDomain = 'qube.brave'
      
      switch (location.pathname) {
        case '/':
          return {
            title: baseDomain,
            description: 'Personal website and tools by Quinn Davis'
          }
        case '/ramps':
        case '/ramps/':
          return {
            title: `${baseDomain}/ramps`,
            description: 'Advanced gradient ramp tool for color analysis and curve sampling'
          }
        default:
          return {
            title: getDisplayUrl(location.pathname),
            description: 'Personal website and tools by Quinn Davis'
          }
      }
    }
    
    const { title, description } = getPageInfo()
    updatePageMetadata(title, description)
  }, [location.pathname])

  return (
    <div className={`app-layout ${isHomepage ? 'homepage' : 'subpage'}`}>
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <main className={`main-content ${isHomepage ? 'homepage' : 'subpage'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ramps/" element={<Ramps />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  )
}

export default App
