// Utility functions for managing changelog entries
// This file provides easy ways to add and manage changelog entries

/**
 * Creates a new changelog entry object with proper formatting
 * @param {string} version - Version number (e.g., "v7.1", "v1.2.3")
 * @param {string} date - Date in format "MMM DD, YYYY" (e.g., "Sep 16, 2025")
 * @param {string[]} changes - Array of change descriptions
 * @returns {Object} Formatted changelog entry
 */
export function createChangelogEntry(version, date, changes) {
  if (!version || !date || !Array.isArray(changes) || changes.length === 0) {
    throw new Error('Version, date, and changes array are required')
  }

  return {
    version,
    date,
    changes: changes.filter(change => change && change.trim()) // Remove empty changes
  }
}

/**
 * Formats a date for changelog entries
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
export function formatChangelogDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Template for creating new changelog entries
 * Copy this template when adding new entries to changelog.js
 */
export const changelogTemplate = `
// Add this to the top of the changelogData array in src/data/changelog.js
{
  version: "v0.0.0", // Update version number
  date: "${formatChangelogDate()}", // Today's date
  changes: [
    "Add your changes here",
    "Each change should be a separate string",
    "Use descriptive, user-friendly language"
  ]
},`

/**
 * Validates a changelog entry object
 * @param {Object} entry - Changelog entry to validate
 * @returns {boolean} Whether the entry is valid
 */
export function validateChangelogEntry(entry) {
  if (!entry || typeof entry !== 'object') return false
  if (!entry.version || typeof entry.version !== 'string') return false
  if (!entry.date || typeof entry.date !== 'string') return false
  if (!Array.isArray(entry.changes) || entry.changes.length === 0) return false
  
  return entry.changes.every(change => 
    typeof change === 'string' && change.trim().length > 0
  )
}

/**
 * Example usage and quick add function
 * Call this in the console to generate a new entry
 */
export function quickAddEntry(version, changes) {
  const entry = createChangelogEntry(
    version,
    formatChangelogDate(),
    changes
  )
  
  console.log('Add this entry to the top of changelogData in src/data/changelog.js:')
  console.log(JSON.stringify(entry, null, 2) + ',')
  
  return entry
}

// Export the template for easy access
export default {
  createChangelogEntry,
  formatChangelogDate,
  changelogTemplate,
  validateChangelogEntry,
  quickAddEntry
}