import React, { createContext, useContext, useState, useEffect } from 'react'

const SpicyModeContext = createContext()

export function useSpicyMode() {
  const context = useContext(SpicyModeContext)
  if (!context) {
    throw new Error('useSpicyMode must be used within a SpicyModeProvider')
  }
  return context
}

export function SpicyModeProvider({ children }) {
  // TODO: When authentication is implemented, only enable spicy mode for authenticated users
  // For now, spicy mode is disabled and toggle is hidden
  const [isSpicyMode, setIsSpicyMode] = useState(false)

  // Load spicy mode from localStorage on mount
  // TODO: Replace with user preference from auth system
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Temporarily disabled - will re-enable with authentication
      // const savedSpicyMode = localStorage.getItem('spicyMode') === 'true'
      // setIsSpicyMode(savedSpicyMode)
      setIsSpicyMode(false) // Force disabled for now
    }
  }, [])

  // Save to localStorage whenever spicy mode changes
  // TODO: Save to user profile when auth is implemented
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spicyMode', isSpicyMode.toString())
    }
  }, [isSpicyMode])

  const toggleSpicyMode = () => {
    setIsSpicyMode(prev => !prev)
  }

  return (
    <SpicyModeContext.Provider value={{
      isSpicyMode,
      setIsSpicyMode,
      toggleSpicyMode
    }}>
      {children}
    </SpicyModeContext.Provider>
  )
}

// Helper function for backward compatibility
export function isSpicyModeOn() {
  // This will work when used inside components wrapped with SpicyModeProvider
  const context = useContext(SpicyModeContext)
  return context?.isSpicyMode || false
}
