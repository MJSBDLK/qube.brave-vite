import React, { createContext, useContext, useState, useCallback } from 'react'

const DatasetSuggestionContext = createContext(null)

export function DatasetSuggestionProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openDatasetSuggestion = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeDatasetSuggestion = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const value = {
    isModalOpen,
    openDatasetSuggestion,
    closeDatasetSuggestion,
  }

  return (
    <DatasetSuggestionContext.Provider value={value}>
      {children}
    </DatasetSuggestionContext.Provider>
  )
}

export function useDatasetSuggestion() {
  const context = useContext(DatasetSuggestionContext)
  if (!context) {
    throw new Error('useDatasetSuggestion must be used within a DatasetSuggestionProvider')
  }
  return context
}

export default DatasetSuggestionContext
