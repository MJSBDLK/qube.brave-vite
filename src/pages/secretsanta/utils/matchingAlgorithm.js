/**
 * Generate Secret Santa assignments with clan constraints
 *
 * @param {Array} participants - Array of {id, name, clan}
 * @param {Array} preSelections - Array of {giver: id, receiver: id}
 * @param {Array} exclusions - Array of {giver: id, receiver: id} pairs that are forbidden
 * @param {boolean} clanModeEnabled - If true, enforce clan constraints. If false, ignore clans.
 * @returns {Object} - {success: boolean, assignments?: Array, warning?: string, error?: Object}
 */
export function generateMatching(participants, preSelections, exclusions = [], clanModeEnabled = true) {
  if (participants.length < 2) {
    return {
      success: false,
      error: {
        message: 'Need at least 2 participants',
        details: []
      }
    }
  }

  // Check for duplicate receivers in pre-selections
  const receiverCounts = {}
  preSelections.forEach(ps => {
    receiverCounts[ps.receiver] = (receiverCounts[ps.receiver] || 0) + 1
  })

  const duplicates = []
  Object.entries(receiverCounts).forEach(([receiverId, count]) => {
    if (count > 1) {
      const receiver = participants.find(p => p.id === parseInt(receiverId))
      duplicates.push(`${receiver?.name} is pre-selected as receiver ${count} times`)
    }
  })

  if (duplicates.length > 0) {
    return {
      success: false,
      error: {
        message: 'Invalid pre-selections',
        details: duplicates
      }
    }
  }

  // If clan mode is disabled, skip clan checking entirely
  if (!clanModeEnabled) {
    const result = attemptMatching(participants, preSelections, exclusions, false, clanModeEnabled)
    if (result.success) {
      return {
        success: true,
        assignments: result.assignments
      }
    }
    return {
      success: false,
      error: {
        message: 'Could not find a valid assignment',
        details: ['Try adjusting pre-selections or exclusions']
      }
    }
  }

  // Try strict matching first (no same-clan pairings for real clans)
  const strictResult = attemptMatching(participants, preSelections, exclusions, true, clanModeEnabled)
  if (strictResult.success) {
    return {
      success: true,
      assignments: strictResult.assignments
    }
  }

  // If strict matching failed, try relaxed matching
  const relaxedResult = attemptMatching(participants, preSelections, exclusions, false, clanModeEnabled)
  if (relaxedResult.success) {
    // Count same-clan violations
    const violations = relaxedResult.assignments.filter(a =>
      isSameClan(a.giver, a.receiver, clanModeEnabled) && !a.isPreSelected
    )

    return {
      success: true,
      assignments: relaxedResult.assignments,
      warning: violations.length > 0
        ? `Could not avoid all same-clan pairings. ${violations.length} participant${violations.length > 1 ? 's' : ''} matched within their clan.`
        : undefined
    }
  }

  // If even relaxed matching failed, return error
  return {
    success: false,
    error: {
      message: 'Could not find a valid assignment',
      details: ['Try adjusting pre-selections or adding more participants']
    }
  }
}

/**
 * Check if a clan should have same-clan restrictions
 * "No Clan" is treated as having no restrictions
 * @param {boolean} clanModeEnabled - If false, always return false (no restrictions)
 */
function isSameClan(person1, person2, clanModeEnabled = true) {
  // If clan mode is disabled, no restrictions
  if (!clanModeEnabled) {
    return false
  }

  // "No Clan" can pair with anyone, including other "No Clan"
  if (person1.clan === 'No Clan' || person2.clan === 'No Clan') {
    return false
  }
  return person1.clan === person2.clan
}

/**
 * Attempt to generate a valid matching using backtracking with randomization
 * @param {boolean} strict - If true, enforce clan constraints strictly. If false, allow same-clan as last resort.
 * @param {boolean} clanModeEnabled - If false, ignore clan constraints entirely.
 */
function attemptMatching(participants, preSelections, exclusions, strict, clanModeEnabled = true, maxAttempts = 100) {
  // Try multiple times with different random orderings
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = tryBacktracking(participants, preSelections, exclusions, strict, clanModeEnabled)
    if (result.success) {
      return result
    }
  }

  return { success: false }
}

/**
 * Check if a giver→receiver pairing is excluded
 */
function isExcluded(giverId, receiverId, exclusions) {
  return exclusions.some(ex =>
    parseInt(ex.giver) === giverId && parseInt(ex.receiver) === receiverId
  )
}

/**
 * Single backtracking attempt
 */
function tryBacktracking(participants, preSelections, exclusions, strict, clanModeEnabled = true) {
  const assignments = new Map() // giver.id -> receiver object
  const taken = new Set() // receiver IDs that are already assigned

  // Apply pre-selections first
  preSelections.forEach(ps => {
    const giver = participants.find(p => p.id === parseInt(ps.giver))
    const receiver = participants.find(p => p.id === parseInt(ps.receiver))
    if (giver && receiver) {
      assignments.set(giver.id, { ...receiver, isPreSelected: true })
      taken.add(receiver.id)
    }
  })

  // Get unassigned givers and shuffle for randomization
  const unassigned = participants
    .filter(p => !assignments.has(p.id))
    .sort(() => Math.random() - 0.5)

  // Backtracking function
  function backtrack(index) {
    if (index === unassigned.length) {
      return true // All assigned successfully
    }

    const giver = unassigned[index]

    // Get valid receivers for this giver
    let validReceivers = participants
      .filter(p =>
        p.id !== giver.id && // Not self
        !taken.has(p.id) && // Not already taken
        !isExcluded(giver.id, p.id, exclusions) // Not excluded
      )

    // In strict mode, filter out same-clan
    // In relaxed mode, prefer different clan but allow same-clan
    if (strict && clanModeEnabled) {
      validReceivers = validReceivers.filter(p => !isSameClan(giver, p, clanModeEnabled))
    } else if (clanModeEnabled) {
      // Sort to prefer different clan, but allow same clan
      validReceivers.sort((a, b) => {
        const aSameClan = isSameClan(giver, a, clanModeEnabled) ? 1 : 0
        const bSameClan = isSameClan(giver, b, clanModeEnabled) ? 1 : 0
        return aSameClan - bSameClan
      })
    }

    // Randomize within the sorted list
    validReceivers = validReceivers.sort((a, b) => {
      // Keep same-clan preference but randomize within each group
      const aSameClan = isSameClan(giver, a, clanModeEnabled)
      const bSameClan = isSameClan(giver, b, clanModeEnabled)
      if (aSameClan === bSameClan) {
        return Math.random() - 0.5
      }
      return aSameClan ? 1 : -1
    })

    for (const receiver of validReceivers) {
      // Try this assignment
      assignments.set(giver.id, { ...receiver, isPreSelected: false })
      taken.add(receiver.id)

      // Recurse
      if (backtrack(index + 1)) {
        return true
      }

      // Backtrack
      assignments.delete(giver.id)
      taken.delete(receiver.id)
    }

    return false
  }

  const success = backtrack(0)

  if (success) {
    // Convert to array format
    const assignmentArray = participants.map(giver => {
      const receiver = assignments.get(giver.id)
      return {
        giver: {
          id: giver.id,
          name: giver.name,
          clan: giver.clan
        },
        receiver: {
          id: receiver.id,
          name: receiver.name,
          clan: receiver.clan
        },
        isPreSelected: receiver.isPreSelected || false
      }
    })

    return {
      success: true,
      assignments: assignmentArray
    }
  }

  return { success: false }
}
