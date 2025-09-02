// app/ramps/components/SavedRamps.jsx
'use client'
import React, { useState } from 'react'

const SavedRamps = ({ 
  savedRamps = [], 
  isLoading = false,
  onLoadRamp,
  onDeleteRamp,
  onDuplicateRamp,
  onUpdateRamp,
  onExportRamps,
  onExportRampsAsGPL,
  onExportRampsAsPNG,
  onImportRamps,
  onClearRamps,
  onReorderRamps,
  onReverseSavedRamp,
  onReverseAllRamps,
  onCompareRamp
}) => {
  const [editingRamp, setEditingRamp] = useState(null)
  const [newName, setNewName] = useState('')
  const [showActions, setShowActions] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dropZoneIndex, setDropZoneIndex] = useState(null)

  const handleStartEdit = (ramp) => {
    setEditingRamp(ramp.id)
    setNewName(ramp.name)
  }

  const handleSaveEdit = () => {
    if (editingRamp && newName.trim()) {
      onUpdateRamp(editingRamp, { name: newName.trim() })
      setEditingRamp(null)
      setNewName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingRamp(null)
    setNewName('')
  }

  const handleImportFile = (event) => {
    const file = event.target.files[0]
    if (file) {
      onImportRamps(file)
      event.target.value = '' // Reset input
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Drag and drop handlers
  const handleDragStart = (e, ramp, index) => {
    setDraggedItem({ ramp, index })
    e.dataTransfer.effectAllowed = 'move'
    
    // Create a custom drag image from just this item
    const dragImage = e.target.cloneNode(true)
    dragImage.style.transform = 'rotate(0deg)'
    dragImage.style.opacity = '1'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.left = '-1000px'
    dragImage.style.width = e.target.offsetWidth + 'px'
    dragImage.style.height = e.target.offsetHeight + 'px'
    dragImage.style.pointerEvents = 'none'
    dragImage.style.zIndex = '1000'
    
    document.body.appendChild(dragImage)
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, e.target.offsetWidth / 2, e.target.offsetHeight / 2)
    
    // Clean up the temporary element after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)
    
    // Style the original element
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
    setDropZoneIndex(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, index) => {
    e.preventDefault()
    if (!draggedItem) return
    
    // Determine if we should drop above or below the current item
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const mouseY = e.clientY
    
    // If dragging above midpoint, insert before this item
    // If dragging below midpoint, insert after this item
    const dropIndex = mouseY < midpoint ? index : index + 1
    
    // Don't show drop zone if it would be the same position
    if (draggedItem.index === index || draggedItem.index === dropIndex || 
        (draggedItem.index < index && draggedItem.index === dropIndex - 1) ||
        (draggedItem.index > index && draggedItem.index === dropIndex)) {
      setDropZoneIndex(null)
    } else {
      setDropZoneIndex(dropIndex)
    }
  }

  const handleDragLeave = (e) => {
    // Check if we're leaving the entire saved ramps list area
    const rect = e.currentTarget.closest('.saved-ramps-list').getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropZoneIndex(null)
    }
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    
    if (!draggedItem) {
      setDropZoneIndex(null)
      return
    }

    // Calculate the actual drop position
    const rect = e.currentTarget.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    const mouseY = e.clientY
    const dropIndex = mouseY < midpoint ? targetIndex : targetIndex + 1
    
    // Don't move if dropping in the exact same position
    if (draggedItem.index === dropIndex) {
      setDropZoneIndex(null)
      return
    }

    const newRamps = [...savedRamps]
    const draggedRamp = newRamps[draggedItem.index]
    
    // Remove the dragged item
    newRamps.splice(draggedItem.index, 1)
    
    // Adjust drop index if we removed an item before it
    const adjustedDropIndex = draggedItem.index < dropIndex ? dropIndex - 1 : dropIndex
    
    // Insert at new position
    newRamps.splice(adjustedDropIndex, 0, draggedRamp)
    
    // Call the reorder callback if provided
    if (onReorderRamps) {
      onReorderRamps(newRamps)
    }
    
    setDropZoneIndex(null)
    setDraggedItem(null)
  }

  // Create color squares grid like the original HTML
  const createRampPreview = (ramp) => {
    const colors = ramp.colors || []
    const sampleCount = ramp.sampleCount || 11
    
    // If we have fewer colors than sample count, interpolate
    const displayColors = []
    for (let i = 0; i < sampleCount; i++) {
      if (colors.length === 0) {
        displayColors.push('#333333')
      } else if (i < colors.length) {
        displayColors.push(colors[i])
      } else {
        // Simple repeat last color for now
        displayColors.push(colors[colors.length - 1])
      }
    }

    return (
      <div className="ramp-preview-grid" style={{ gridTemplateColumns: `repeat(${sampleCount}, 1fr)` }}>
        {displayColors.map((color, index) => (
          <div
            key={index}
            className="ramp-color-square"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="saved-ramps-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="saved-ramps-container">
      {/* Header with actions */}
      <div className="saved-ramps-header">
        <div className="ramps-count">
          {savedRamps.length} saved
        </div>
        <button 
          className="actions-toggle"
          onClick={() => setShowActions(!showActions)}
          title="Manage ramps"
        >
          ⚙️
        </button>
      </div>

      {/* Actions panel */}
      {showActions && (
        <div className="actions-panel">
          <div className="action-group">
            <label className="import-btn">
              📁 Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                style={{ display: 'none' }}
              />
            </label>
            
            {savedRamps.length > 0 && (
              <>
                <button 
                  className="export-btn"
                  onClick={onExportRamps}
                >
                  💾 Export JSON
                </button>
                
                <button 
                  className="export-btn"
                  onClick={onExportRampsAsGPL}
                  title="Export all ramps as GIMP palette"
                >
                  🎨 Export GPL
                </button>
                
                <button 
                  className="export-btn"
                  onClick={onExportRampsAsPNG}
                  title="Export all colors as single-pixel PNG"
                >
                  🖼️ Export PNG
                </button>
                
                <button 
                  className="reverse-btn"
                  onClick={() => {
                    if (confirm('Reverse the order of all saved ramps?')) {
                      onReverseAllRamps()
                    }
                  }}
                  title="Reverse order of all ramps"
                >
                  🔄 Reverse All
                </button>
                
                <button 
                  className="clear-btn"
                  onClick={() => {
                    if (confirm(`Delete all ${savedRamps.length} saved ramps?`)) {
                      onClearRamps()
                    }
                  }}
                >
                  🗑️ Clear
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ramps list - tightly packed grid like original */}
      <div className="saved-ramps-list">
        {savedRamps.length === 0 ? (
          <div className="empty-state">
            <p>No saved ramps yet</p>
            <span>Generate and save a ramp!</span>
          </div>
        ) : (
          savedRamps.map((ramp, index) => (
            <React.Fragment key={ramp.id}>
              {/* Drop zone before first item */}
              {index === 0 && dropZoneIndex === 0 && (
                <div className="drop-zone-indicator" />
              )}
              
              <div 
                className={`saved-ramp-item ${draggedItem?.index === index ? 'dragging' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, ramp, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Ramp preview grid */}
                <div className="ramp-header">
                  <div className="drag-handle">⋮⋮</div>
                  {createRampPreview(ramp)}
                </div>
                
                {/* Ramp info */}
                <div className="ramp-info">
                  {editingRamp === ramp.id ? (
                    <div className="ramp-edit">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="edit-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button 
                          className="save-edit"
                          onClick={handleSaveEdit}
                        >
                          ✓
                        </button>
                        <button 
                          className="cancel-edit"
                          onClick={handleCancelEdit}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ramp-name">{ramp.name}</div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="ramp-actions">
                    <button 
                      className="ramp-action-btn"
                      onClick={() => onLoadRamp(ramp)}
                      title="Load"
                    >
                      📂
                    </button>
                    {onCompareRamp && (
                      <button 
                        className="ramp-action-btn"
                        onClick={() => onCompareRamp(ramp)}
                        title="Compare with current"
                      >
                        🔗
                      </button>
                    )}
                    <button 
                      className="ramp-action-btn"
                      onClick={() => onReverseSavedRamp(ramp.id)}
                      title="Reverse colors"
                    >
                      🔄
                    </button>
                    <button 
                      className="ramp-action-btn"
                      onClick={() => onDuplicateRamp(ramp.id)}
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button 
                      className="ramp-action-btn"
                      onClick={() => handleStartEdit(ramp)}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button 
                      className="ramp-action-btn delete-btn"
                      onClick={() => {
                        if (confirm(`Delete "${ramp.name}"?`)) {
                          onDeleteRamp(ramp.id)
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Drop zone after this item */}
              {dropZoneIndex === index + 1 && (
                <div className="drop-zone-indicator" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  )
}

export default SavedRamps
