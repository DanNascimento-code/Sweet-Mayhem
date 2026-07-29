import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CHARACTER_REACTION_CATALOG,
  CHARACTER_REACTION_IDS,
  getCharacterMatchReactionId,
  getCharacterReaction,
} from './reactionCatalog.js'

test('reaction catalog contains one immutable entry per identity', () => {
  const reactionIds = Object.values(CHARACTER_REACTION_IDS)

  assert.deepEqual(Object.keys(CHARACTER_REACTION_CATALOG), reactionIds)

  for (const reactionId of reactionIds) {
    const reaction = CHARACTER_REACTION_CATALOG[reactionId]

    assert.equal(reaction.id, reactionId)
    assert.ok(reaction.animationKey.length > 0)
    assert.ok(Number.isInteger(reaction.priority))
    assert.ok(reaction.priority >= 0)
    assert.ok(Number.isInteger(reaction.cooldown))
    assert.ok(reaction.cooldown >= 0)
    assert.equal(
      reaction.motionDuration === null || Number.isInteger(reaction.motionDuration),
      true,
    )
    assert.equal(Object.isFrozen(reaction), true)
  }
})

test('idle is indefinite and active reactions have positive durations', () => {
  assert.equal(
    CHARACTER_REACTION_CATALOG[CHARACTER_REACTION_IDS.IDLE].duration,
    null,
  )

  for (const reaction of Object.values(CHARACTER_REACTION_CATALOG)) {
    if (reaction.id !== CHARACTER_REACTION_IDS.IDLE) {
      assert.ok(Number.isInteger(reaction.duration))
      assert.ok(reaction.duration > 0)
      assert.ok(reaction.motionDuration > 0)
      assert.ok(reaction.duration > reaction.motionDuration)
    }
  }
})

test('reaction priorities grow with the importance of the game event', () => {
  const priorityFor = (reactionId) =>
    CHARACTER_REACTION_CATALOG[reactionId].priority

  assert.ok(
    priorityFor(CHARACTER_REACTION_IDS.MATCH_4) >
      priorityFor(CHARACTER_REACTION_IDS.MATCH_3),
  )
  assert.ok(
    priorityFor(CHARACTER_REACTION_IDS.MATCH_5) >
      priorityFor(CHARACTER_REACTION_IDS.MATCH_4),
  )
  assert.ok(
    priorityFor(CHARACTER_REACTION_IDS.MATCH_6) >
      priorityFor(CHARACTER_REACTION_IDS.MATCH_5),
  )
  assert.ok(
    priorityFor(CHARACTER_REACTION_IDS.CASCADE) >
      priorityFor(CHARACTER_REACTION_IDS.MATCH_6),
  )
})

test('getCharacterReaction returns known reactions and rejects unknown ids', () => {
  assert.equal(
    getCharacterReaction(CHARACTER_REACTION_IDS.IDLE),
    CHARACTER_REACTION_CATALOG[CHARACTER_REACTION_IDS.IDLE],
  )
  assert.equal(getCharacterReaction('unknown-reaction'), null)
})

test('match sizes map to character reactions and 7 or 8 use match-6', () => {
  assert.equal(getCharacterMatchReactionId(3), CHARACTER_REACTION_IDS.MATCH_3)
  assert.equal(getCharacterMatchReactionId(4), CHARACTER_REACTION_IDS.MATCH_4)
  assert.equal(getCharacterMatchReactionId(5), CHARACTER_REACTION_IDS.MATCH_5)
  assert.equal(getCharacterMatchReactionId(6), CHARACTER_REACTION_IDS.MATCH_6)
  assert.equal(getCharacterMatchReactionId(7), CHARACTER_REACTION_IDS.MATCH_6)
  assert.equal(getCharacterMatchReactionId(8), CHARACTER_REACTION_IDS.MATCH_6)
})

test('invalid match sizes do not produce character reactions', () => {
  assert.equal(getCharacterMatchReactionId(2), null)
  assert.equal(getCharacterMatchReactionId(3.5), null)
  assert.equal(getCharacterMatchReactionId('3'), null)
})
