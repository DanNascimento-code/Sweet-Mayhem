import test from 'node:test'
import assert from 'node:assert/strict'

import { CHARACTER_REACTION_IDS } from './reactionCatalog.js'
import { getCharacterReactionIdForMatchStep } from './reactionEvents.js'

function createMatchGroup(size) {
  return {
    indices: Array.from({ length: size }, (_, index) => index),
  }
}

test('a first match-found step uses the reaction for its largest group', () => {
  const step = {
    type: 'match-found',
    cascade: 1,
    matchGroups: [createMatchGroup(3), createMatchGroup(5)],
  }

  assert.equal(
    getCharacterReactionIdForMatchStep(step),
    CHARACTER_REACTION_IDS.MATCH_5,
  )
})

test('match groups of 7 or 8 use the match-6 character reaction', () => {
  const step = {
    type: 'match-found',
    cascade: 1,
    matchGroups: [createMatchGroup(8)],
  }

  assert.equal(
    getCharacterReactionIdForMatchStep(step),
    CHARACTER_REACTION_IDS.MATCH_6,
  )
})

test('a later match-found step uses the cascade reaction', () => {
  const step = {
    type: 'match-found',
    cascade: 2,
    matchGroups: [createMatchGroup(3)],
  }

  assert.equal(
    getCharacterReactionIdForMatchStep(step),
    CHARACTER_REACTION_IDS.CASCADE,
  )
})

test('steps without valid match groups do not create a reaction', () => {
  assert.equal(getCharacterReactionIdForMatchStep(null), null)
  assert.equal(
    getCharacterReactionIdForMatchStep({
      type: 'tiles-cleared',
      matchGroups: [createMatchGroup(3)],
    }),
    null,
  )
  assert.equal(
    getCharacterReactionIdForMatchStep({
      type: 'match-found',
      cascade: 1,
      matchGroups: [],
    }),
    null,
  )
})
