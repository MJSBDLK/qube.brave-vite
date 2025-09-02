import { useState, useEffect } from 'react'
import { useSpicyMode } from '../contexts/SpicyModeContext'

const workSafeTaglines = [
	'Ayo chill',
	'N-naw...',
	'Not sorry',
	'Relax there chief',
	'Stellar and Baller',
	'What it do, little man?',
	'Wizzards pls',
]
const spicyTaglines = ['Fuck off']

const localDebug = {
	forceSpicy: false,
	logTaglinePool: false,
}

// Simple hash function to create consistent IDs for taglines
function simpleHash(str) {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(36)
}

// Better random selection from available pool
function selectRandomTagline(availableTaglines) {
	if (availableTaglines.length === 0) return null

	// Use Math.random() for better randomness
	const randomIndex = Math.floor(Math.random() * availableTaglines.length)
	return availableTaglines[randomIndex]
}

// Simple function that returns available taglines based on spicyMode
function getTaglines(spicyMode = false) {
	// Return early on server
	if (typeof window === 'undefined') {
		return spicyMode
			? [...spicyTaglines, ...workSafeTaglines]
			: workSafeTaglines
	}

	// Get all relevant taglines for the mode
	const allRelevantTaglines = spicyMode
		? [...spicyTaglines, ...workSafeTaglines]
		: workSafeTaglines

	// Get used hashes from localStorage (we'll use a single key for simplicity)
	const storageKey = spicyMode ? 'usedCombinedTaglines' : 'usedWorkSafeTaglines'
	const usedHashes = JSON.parse(localStorage.getItem(storageKey) || '[]')

	// Filter out used taglines
	let availableTaglines = allRelevantTaglines.filter((text) => {
		const hash = simpleHash(text)
		return !usedHashes.includes(hash)
	})

	// Reset if all have been used
	if (availableTaglines.length === 0) {
		localStorage.removeItem(storageKey)
		availableTaglines = [...allRelevantTaglines]
	}

	if (localDebug.logTaglinePool) {
		console.log('getTaglines:', {
			spicyMode,
			allRelevantTaglines,
			usedHashes,
			availableTaglines,
		})
	}

	return availableTaglines
}

// Helper function to mark a tagline as used
function markTaglineAsUsed(tagline, spicyMode) {
	if (typeof window === 'undefined') return

	const hash = simpleHash(tagline)
	const storageKey = spicyMode ? 'usedCombinedTaglines' : 'usedWorkSafeTaglines'
	const usedHashes = JSON.parse(localStorage.getItem(storageKey) || '[]')
	const updatedUsedHashes = [...usedHashes, hash]
	localStorage.setItem(storageKey, JSON.stringify(updatedUsedHashes))
}

export default function Tagline() {
	const { isSpicyMode } = useSpicyMode()
	const [currentTagline, setCurrentTagline] = useState('')

	// Function to select and set a random tagline
	const selectRandomTagline = (mode) => {
		const availableTaglines = getTaglines(mode)

		if (availableTaglines.length === 0) {
			setCurrentTagline('Stellar and Baller') // Fallback
			return
		}

		const randomIndex = Math.floor(Math.random() * availableTaglines.length)
		const selectedTagline = availableTaglines[randomIndex]

		setCurrentTagline(selectedTagline)
		markTaglineAsUsed(selectedTagline, mode)
	}

	// Set initial tagline on mount
	useEffect(() => {
		selectRandomTagline(isSpicyMode)
	}, [])

	// Update tagline when spicyMode changes
	useEffect(() => {
		if (currentTagline !== '') {
			// Only run after initial mount
			selectRandomTagline(isSpicyMode)
		}
	}, [isSpicyMode])

	// Don't render anything until we have a tagline (avoids hydration mismatch)
	if (currentTagline === '') {
		return (
			<div className='superheader text-caption text-teal u-mb-sm'>
				{/* Empty during SSR, will be populated on client */}
			</div>
		)
	}

	return (
		<div className='superheader text-caption text-teal u-mb-sm'>
			{currentTagline}
		</div>
	)
}
