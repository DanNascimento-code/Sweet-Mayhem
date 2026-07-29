import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CHARACTER_DIALOGUE_CATALOG,
  getCharacterDialogueLine,
} from './dialogueCatalog.js'
import { CHARACTER_REACTION_IDS } from './reactionCatalog.js'

test('dialogue catalog has an immutable list for every reaction', () => {
  assert.deepEqual(
    Object.keys(CHARACTER_DIALOGUE_CATALOG),
    Object.values(CHARACTER_REACTION_IDS),
  )

  for (const dialogueLines of Object.values(CHARACTER_DIALOGUE_CATALOG)) {
    assert.equal(Object.isFrozen(dialogueLines), true)
    assert.equal(dialogueLines.every((line) => line.length > 0), true)
  }
})

test('idle has no line and every active reaction has dialogue', () => {
  assert.equal(
    CHARACTER_DIALOGUE_CATALOG[CHARACTER_REACTION_IDS.IDLE].length,
    0,
  )

  for (const reactionId of Object.values(CHARACTER_REACTION_IDS)) {
    if (reactionId !== CHARACTER_REACTION_IDS.IDLE) {
      assert.ok(CHARACTER_DIALOGUE_CATALOG[reactionId].length > 0)
    }
  }
})

test('dialogue selection cycles deterministically through the available lines', () => {
  const reactionId = CHARACTER_REACTION_IDS.MATCH_3
  const dialogueLines = CHARACTER_DIALOGUE_CATALOG[reactionId]

  assert.equal(getCharacterDialogueLine(reactionId, 0), dialogueLines[0])
  assert.equal(getCharacterDialogueLine(reactionId, 1), dialogueLines[1])
  assert.equal(getCharacterDialogueLine(reactionId, 3), dialogueLines[0])
  assert.equal(getCharacterDialogueLine(reactionId, -1), dialogueLines[1])
})

test('unknown reactions and idle do not produce dialogue', () => {
  assert.equal(getCharacterDialogueLine('unknown-reaction', 0), null)
  assert.equal(
    getCharacterDialogueLine(CHARACTER_REACTION_IDS.IDLE, 0),
    null,
  )
})
