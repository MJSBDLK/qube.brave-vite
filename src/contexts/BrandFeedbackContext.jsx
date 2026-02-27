import React, { createContext, useContext, useState, useCallback } from 'react'

const BrandFeedbackContext = createContext(null)

export function BrandFeedbackProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState(null) // 'request-research' | 'report-inaccuracy'
  const [brand, setBrand] = useState(null) // brand object or null (for new brand suggestions)

  const openRequestResearch = useCallback((brand = null) => {
    setBrand(brand)
    setMode('request-research')
    setIsModalOpen(true)
  }, [])

  const openReportInaccuracy = useCallback((brand) => {
    setBrand(brand)
    setMode('report-inaccuracy')
    setIsModalOpen(true)
  }, [])

  const closeFeedback = useCallback(() => {
    setIsModalOpen(false)
    setMode(null)
    setBrand(null)
  }, [])

  const value = {
    isModalOpen,
    mode,
    brand,
    openRequestResearch,
    openReportInaccuracy,
    closeFeedback,
  }

  return (
    <BrandFeedbackContext.Provider value={value}>
      {children}
    </BrandFeedbackContext.Provider>
  )
}

export function useBrandFeedback() {
  const context = useContext(BrandFeedbackContext)
  if (!context) {
    throw new Error('useBrandFeedback must be used within a BrandFeedbackProvider')
  }
  return context
}

export default BrandFeedbackContext
