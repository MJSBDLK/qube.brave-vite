/**
 * Secret Santa Generator
 *
 * Features:
 * - Clan constraints: No one gets matched within their own clan (except "No Clan")
 * - Pre-selections: Force specific giver → receiver pairings
 * - Exclusions: Prevent specific giver → receiver pairings
 * - Best-effort matching: Falls back to relaxed mode if strict matching is impossible
 *
 * Testing:
 * From project root, run: node src/pages/secretsanta/test-matching.js
 * Tests cover: basic matching, clan constraints, pre-selections, exclusions, edge cases
 * All 13 tests should pass with detailed output showing assignments and validations
 */

import React, { useState, useEffect } from 'react'
import ParticipantInput from './components/ParticipantInput'
import PreSelections from './components/PreSelections'
import Exclusions from './components/Exclusions'
import Results from './components/Results'
import ErrorDisplay from './components/ErrorDisplay'
import { generateMatching } from './utils/matchingAlgorithm'

const STORAGE_KEY = 'secretSantaState'

export default function SecretSanta() {
  // Load initial state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          participants: parsed.participants || [],
          preSelections: parsed.preSelections || [],
          exclusions: parsed.exclusions || [],
          clanModeEnabled: parsed.clanModeEnabled !== undefined ? parsed.clanModeEnabled : true
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error)
    }
    return {
      participants: [],
      preSelections: [],
      exclusions: [],
      clanModeEnabled: true
    }
  }

  const initialState = loadState()

  const [participants, setParticipants] = useState(initialState.participants)
  const [preSelections, setPreSelections] = useState(initialState.preSelections)
  const [exclusions, setExclusions] = useState(initialState.exclusions)
  const [clanModeEnabled, setClanModeEnabled] = useState(initialState.clanModeEnabled)
  const [results, setResults] = useState(null)
  const [warning, setWarning] = useState(null)
  const [error, setError] = useState(null)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      const state = {
        participants,
        preSelections,
        exclusions,
        clanModeEnabled
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save state:', error)
    }
  }, [participants, preSelections, exclusions, clanModeEnabled])

  const handleGenerate = () => {
    setError(null)
    setResults(null)
    setWarning(null)

    const result = generateMatching(participants, preSelections, exclusions, clanModeEnabled)

    if (result.success) {
      setResults(result.assignments)
      setWarning(result.warning)
    } else {
      setError(result.error)
    }
  }

  const handleReset = () => {
    setResults(null)
    setWarning(null)
    setError(null)
  }

  const handleClearAll = () => {
    if (confirm('Clear all participants, pre-selections, and exclusions?')) {
      setParticipants([])
      setPreSelections([])
      setExclusions([])
      setResults(null)
      setWarning(null)
      setError(null)
    }
  }

  return (
    <div className="secret-santa-container">
      <div className="secret-santa-header">
        <h1>Secret Santa Generator</h1>
        <p className="subtitle">
          {clanModeEnabled
            ? 'With clan constraints - no one gets matched within their own clan'
            : 'Simple random matching without clan restrictions'
          }
        </p>

        <div className="clan-mode-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={clanModeEnabled}
              onChange={(e) => setClanModeEnabled(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-text">
              Enable clan constraints
            </span>
          </label>
        </div>

        {participants.length > 0 && !results && (
          <div className="clear-all-section">
            <button
              onClick={handleClearAll}
              className="c-button c-button--ghost clear-all-button"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {error && <ErrorDisplay error={error} onReset={handleReset} />}

      <div className={results ? "side-by-side-layout" : ""}>
        <div className="inputs-section">
          <ParticipantInput
            participants={participants}
            setParticipants={setParticipants}
            clanModeEnabled={clanModeEnabled}
          />

          {participants.length > 0 && (
            <>
              <PreSelections
                participants={participants}
                preSelections={preSelections}
                setPreSelections={setPreSelections}
              />

              <Exclusions
                participants={participants}
                exclusions={exclusions}
                setExclusions={setExclusions}
              />
            </>
          )}

          {participants.length >= 2 && !results && (
            <div className="generate-section">
              <button
                className="c-button c-button--primary generate-button"
                onClick={handleGenerate}
              >
                Generate Secret Santa
              </button>
            </div>
          )}
        </div>

        {results && (
          <Results
            results={results}
            warning={warning}
            clanModeEnabled={clanModeEnabled}
            onReset={handleReset}
            participants={participants}
          />
        )}
      </div>
    </div>
  )
}
