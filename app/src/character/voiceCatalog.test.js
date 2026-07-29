import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { CHARACTER_DIALOGUE_CATALOG } from './dialogueCatalog.js'
import { CHARACTER_REACTION_IDS } from './reactionCatalog.js'
import {
  CHARACTER_VOICE_CATALOG,
  getAllCharacterVoiceAssets,
  getCharacterVoiceAsset,
} from './voiceCatalog.js'

test('voice catalog mirrors the dialogue variations for every reaction', () => {
  assert.deepEqual(
    Object.keys(CHARACTER_VOICE_CATALOG),
    Object.values(CHARACTER_REACTION_IDS),
  )

  for (const reactionId of Object.values(CHARACTER_REACTION_IDS)) {
    assert.equal(
      CHARACTER_VOICE_CATALOG[reactionId].length,
      CHARACTER_DIALOGUE_CATALOG[reactionId].length,
    )
    assert.equal(
      Object.isFrozen(CHARACTER_VOICE_CATALOG[reactionId]),
      true,
    )
  }
})

test('every voice asset is immutable, local and has a valid volume', () => {
  const voiceAssets = getAllCharacterVoiceAssets()

  assert.equal(voiceAssets.length, 21)
  assert.equal(Object.isFrozen(voiceAssets), true)

  for (const voiceAsset of voiceAssets) {
    assert.equal(Object.isFrozen(voiceAsset), true)
    assert.match(voiceAsset.id, /^[a-z0-9-]+$/)
    assert.match(voiceAsset.src, /\.wav$/)
    assert.ok(voiceAsset.volume > 0)
    assert.ok(voiceAsset.volume <= 1)
    assert.equal(existsSync(fileURLToPath(voiceAsset.src)), true)
  }
})

test('voice selection cycles with the same deterministic policy as dialogue', () => {
  const reactionId = CHARACTER_REACTION_IDS.MATCH_3
  const voiceAssets = CHARACTER_VOICE_CATALOG[reactionId]

  assert.equal(getCharacterVoiceAsset(reactionId, 0), voiceAssets[0])
  assert.equal(getCharacterVoiceAsset(reactionId, 1), voiceAssets[1])
  assert.equal(getCharacterVoiceAsset(reactionId, 3), voiceAssets[0])
  assert.equal(getCharacterVoiceAsset(reactionId, -1), voiceAssets[1])
  assert.equal(getCharacterVoiceAsset('unknown-reaction', 0), null)
  assert.equal(
    getCharacterVoiceAsset(CHARACTER_REACTION_IDS.IDLE, 0),
    null,
  )
})

