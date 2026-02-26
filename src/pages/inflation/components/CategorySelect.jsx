import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import './CategorySelect.css'

export default function CategorySelect({
  value,
  onChange,
  options,
  categories,
  label,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef(null)
  const listboxRef = useRef(null)

  // Build grouped list: flat array of { type: 'header'|'option', ... }
  const flatItems = useMemo(() => {
    const items = []
    for (const cat of categories) {
      const catOptions = options.filter(o => o.category === cat.id)
      if (catOptions.length === 0) continue
      items.push({ type: 'header', label: cat.label, id: `header-${cat.id}` })
      for (const opt of catOptions) {
        items.push({ type: 'option', ...opt })
      }
    }
    return items
  }, [options, categories])

  // Only the selectable items (for keyboard navigation)
  const selectableItems = useMemo(
    () => flatItems.filter(item => item.type === 'option'),
    [flatItems]
  )

  const selectedLabel = options.find(o => o.id === value)?.label || value

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    const el = listboxRef.current?.querySelector(`[data-index="${highlightedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex, isOpen])

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setHighlightedIndex(selectableItems.findIndex(o => o.id === value))
        } else if (highlightedIndex >= 0) {
          onChange(selectableItems[highlightedIndex].id)
          setIsOpen(false)
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
          setHighlightedIndex(selectableItems.findIndex(o => o.id === value))
        } else {
          setHighlightedIndex(prev => Math.min(prev + 1, selectableItems.length - 1))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (optionId) => {
    onChange(optionId)
    setIsOpen(false)
  }

  let selectableIndex = -1

  return (
    <div className="category-select" ref={containerRef}>
      <button
        className="category-select__trigger"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label`}
        id={id}
        type="button"
      >
        <span className="category-select__value">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`category-select__chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          className="category-select__dropdown"
          role="listbox"
          ref={listboxRef}
          aria-labelledby={`${id}-label`}
        >
          {flatItems.map((item) => {
            if (item.type === 'header') {
              return (
                <li
                  key={item.id}
                  className="category-select__header"
                  role="presentation"
                >
                  {item.label}
                </li>
              )
            }

            selectableIndex++
            const currentIndex = selectableIndex
            const isSelected = item.id === value
            const isHighlighted = currentIndex === highlightedIndex

            return (
              <li
                key={item.id}
                className={[
                  'category-select__option',
                  isSelected && 'selected',
                  isHighlighted && 'highlighted',
                ].filter(Boolean).join(' ')}
                role="option"
                aria-selected={isSelected}
                data-index={currentIndex}
                onClick={() => handleSelect(item.id)}
                onMouseEnter={() => setHighlightedIndex(currentIndex)}
              >
                {item.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
