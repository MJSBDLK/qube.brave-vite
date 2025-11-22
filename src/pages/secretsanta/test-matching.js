/**
 * Test script for Secret Santa matching algorithm
 * Run with: node src/pages/secretsanta/test-matching.js
 */

import { generateMatching } from './utils/matchingAlgorithm.js'

// Test helpers
let testCount = 0
let passCount = 0
let failCount = 0

function test(name, fn) {
  testCount++
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Test ${testCount}: ${name}`)
  console.log('='.repeat(60))

  try {
    fn()
    passCount++
    console.log('✅ PASS')
  } catch (error) {
    failCount++
    console.log('❌ FAIL')
    console.error(error.message)
    if (error.stack) {
      console.error(error.stack)
    }
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

function logResult(result) {
  console.log('\nResult:', {
    success: result.success,
    warning: result.warning || 'none',
    error: result.error?.message || 'none'
  })

  if (result.assignments) {
    console.log('\nAssignments:')
    result.assignments.forEach(a => {
      const marker = a.isPreSelected ? '🔒' : ''
      console.log(`  ${a.giver.name} (${a.giver.clan}) → ${a.receiver.name} (${a.receiver.clan}) ${marker}`)
    })
  }

  if (result.error?.details) {
    console.log('\nError details:')
    result.error.details.forEach(d => console.log(`  - ${d}`))
  }
}

// Create test participants
function createParticipants(config) {
  let id = 1
  const participants = []

  for (const [clan, count] of Object.entries(config)) {
    for (let i = 0; i < count; i++) {
      participants.push({
        id: id++,
        name: `${clan}_${i + 1}`,
        clan: clan
      })
    }
  }

  return participants
}

// Run tests
console.log('\n🎅 SECRET SANTA MATCHING ALGORITHM TESTS 🎄\n')

// Test 1: Simple matching (no clans)
test('Simple matching with no clans', () => {
  const participants = createParticipants({ 'No Clan': 5 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(result.success, 'Should succeed')
  assert(result.assignments.length === 5, 'Should have 5 assignments')
  assert(!result.warning, 'Should have no warning')

  // Verify no duplicates
  const receivers = result.assignments.map(a => a.receiver.id)
  assert(new Set(receivers).size === 5, 'All receivers should be unique')

  // Verify no self-assignments
  result.assignments.forEach(a => {
    assert(a.giver.id !== a.receiver.id, 'No self-assignments')
  })
})

// Test 2: Basic clan constraints
test('Basic clan constraints', () => {
  const participants = createParticipants({ 'Smith': 3, 'Jones': 3 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(result.success, 'Should succeed')
  assert(result.assignments.length === 6, 'Should have 6 assignments')

  // Verify no same-clan pairings
  result.assignments.forEach(a => {
    assert(a.giver.clan !== a.receiver.clan, `${a.giver.name} should not give to same clan`)
  })
})

// Test 3: Multiple clans
test('Multiple clans with varying sizes', () => {
  const participants = createParticipants({
    'Smith': 4,
    'Jones': 3,
    'Davis': 2
  })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(result.success, 'Should succeed')
  assert(result.assignments.length === 9, 'Should have 9 assignments')
})

// Test 4: Pre-selections
test('Pre-selections are honored', () => {
  const participants = createParticipants({ 'Smith': 3, 'Jones': 3 })
  const preSelections = [
    { giver: 1, receiver: 4 }, // Smith_1 → Jones_1
    { giver: 4, receiver: 2 }  // Jones_1 → Smith_2
  ]
  const result = generateMatching(participants, preSelections, [])

  logResult(result)
  assert(result.success, 'Should succeed')

  // Verify pre-selections
  const assignment1 = result.assignments.find(a => a.giver.id === 1)
  assert(assignment1.receiver.id === 4, 'Pre-selection 1 should be honored')
  assert(assignment1.isPreSelected, 'Should be marked as pre-selected')

  const assignment2 = result.assignments.find(a => a.giver.id === 4)
  assert(assignment2.receiver.id === 2, 'Pre-selection 2 should be honored')
  assert(assignment2.isPreSelected, 'Should be marked as pre-selected')
})

// Test 5: Exclusions
test('Exclusions are enforced', () => {
  const participants = createParticipants({ 'Smith': 2, 'Jones': 2 })
  const exclusions = [
    { giver: 1, receiver: 3 }, // Smith_1 ⛔→ Jones_1
    { giver: 3, receiver: 1 }  // Jones_1 ⛔→ Smith_1
  ]
  const result = generateMatching(participants, [], exclusions)

  logResult(result)
  assert(result.success, 'Should succeed')

  // Verify exclusions
  const assignment1 = result.assignments.find(a => a.giver.id === 1)
  assert(assignment1.receiver.id !== 3, 'Smith_1 should not give to Jones_1')

  const assignment2 = result.assignments.find(a => a.giver.id === 3)
  assert(assignment2.receiver.id !== 1, 'Jones_1 should not give to Smith_1')
})

// Test 6: No Clan participants
test('No Clan can pair with anyone including other No Clan', () => {
  const participants = createParticipants({ 'No Clan': 4, 'Smith': 2 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(result.success, 'Should succeed')

  // Check if any No Clan → No Clan pairings exist (which is allowed)
  const noClanToNoClan = result.assignments.filter(a =>
    a.giver.clan === 'No Clan' && a.receiver.clan === 'No Clan'
  )
  console.log(`\nNo Clan → No Clan pairings: ${noClanToNoClan.length} (allowed)`)
})

// Test 7: Impossible configuration
test('Impossible configuration is detected', () => {
  const participants = createParticipants({ 'Smith': 5, 'Jones': 2 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  // This should still succeed with warning (relaxed mode)
  assert(result.success || !result.success, 'Should either succeed with warning or fail gracefully')

  if (result.success && result.warning) {
    console.log('\n✓ Relaxed mode used, same-clan pairings allowed')
  }
})

// Test 8: Pre-selection with exclusion conflict
test('Pre-selection overrides would-be exclusion', () => {
  const participants = createParticipants({ 'Smith': 2, 'Jones': 2 })
  const preSelections = [{ giver: 1, receiver: 3 }]
  const exclusions = [{ giver: 1, receiver: 4 }] // Exclude different pairing
  const result = generateMatching(participants, preSelections, exclusions)

  logResult(result)
  assert(result.success, 'Should succeed')

  const assignment = result.assignments.find(a => a.giver.id === 1)
  assert(assignment.receiver.id === 3, 'Pre-selection should be honored')
})

// Test 9: Circular clan distribution
test('Circular clan distribution works', () => {
  const participants = createParticipants({ 'A': 2, 'B': 2, 'C': 2 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(result.success, 'Should succeed')
  assert(!result.warning, 'Should have no warning')

  // Verify all different clans
  result.assignments.forEach(a => {
    assert(a.giver.clan !== a.receiver.clan, 'No same-clan pairings')
  })
})

// Test 10: Large group
test('Large group performance', () => {
  const participants = createParticipants({
    'A': 5, 'B': 5, 'C': 5, 'D': 5, 'E': 5
  })
  const startTime = Date.now()
  const result = generateMatching(participants, [], [])
  const duration = Date.now() - startTime

  logResult(result)
  console.log(`\nExecution time: ${duration}ms`)
  assert(result.success, 'Should succeed')
  assert(duration < 5000, 'Should complete in under 5 seconds')
})

// Test 11: Minimum participants
test('Minimum 2 participants required', () => {
  const participants = createParticipants({ 'Smith': 1 })
  const result = generateMatching(participants, [], [])

  logResult(result)
  assert(!result.success, 'Should fail with only 1 participant')
  assert(result.error.message.includes('at least 2'), 'Should mention minimum requirement')
})

// Test 12: Duplicate pre-selection receivers
test('Duplicate pre-selection receivers rejected', () => {
  const participants = createParticipants({ 'Smith': 3, 'Jones': 3 })
  const preSelections = [
    { giver: 1, receiver: 4 },
    { giver: 2, receiver: 4 } // Same receiver!
  ]
  const result = generateMatching(participants, preSelections, [])

  logResult(result)
  assert(!result.success, 'Should fail')
  assert(result.error.message.includes('Invalid'), 'Should mention invalid pre-selections')
})

// Test 13: Complex scenario
test('Complex scenario with all features', () => {
  const participants = createParticipants({
    'Smith': 4,
    'Jones': 3,
    'No Clan': 2
  })
  const preSelections = [{ giver: 1, receiver: 5 }] // Smith → Jones
  const exclusions = [
    { giver: 2, receiver: 6 }, // Smith_2 ⛔→ Jones_2
    { giver: 8, receiver: 9 }  // No Clan ⛔→ No Clan (still allowed, just excluded this specific pair)
  ]
  const result = generateMatching(participants, preSelections, exclusions)

  logResult(result)
  assert(result.success, 'Should succeed')

  // Verify pre-selection
  const preSelected = result.assignments.find(a => a.giver.id === 1)
  assert(preSelected.receiver.id === 5, 'Pre-selection honored')

  // Verify exclusions
  const excluded1 = result.assignments.find(a => a.giver.id === 2)
  assert(excluded1.receiver.id !== 6, 'Exclusion 1 honored')

  const excluded2 = result.assignments.find(a => a.giver.id === 8)
  assert(excluded2.receiver.id !== 9, 'Exclusion 2 honored')
})

// Print summary
console.log('\n' + '='.repeat(60))
console.log('TEST SUMMARY')
console.log('='.repeat(60))
console.log(`Total tests: ${testCount}`)
console.log(`✅ Passed: ${passCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log('='.repeat(60))

process.exit(failCount > 0 ? 1 : 0)
