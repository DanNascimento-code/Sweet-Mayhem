import test from 'node:test'
import assert from 'node:assert/strict'

import {
  SFX_CATALOG,
  SFX_IDS,
  getMatchSoundId,
  getSoundEffect,
} from './sfxCatalog.js'

test('SFX catalog contains one valid entry for every sound identity', () => {
  const soundEffectIds = Object.values(SFX_IDS)

  assert.equal(soundEffectIds.length, 6)
  assert.deepEqual(Object.keys(SFX_CATALOG), soundEffectIds)

  for (const soundEffectId of soundEffectIds) {
    const soundEffect = SFX_CATALOG[soundEffectId]

    assert.equal(soundEffect.id, soundEffectId)
    assert.match(soundEffect.src, /\.(wav|flac)$/)
    assert.ok(soundEffect.volume > 0 && soundEffect.volume <= 1)
    assert.ok(Number.isInteger(soundEffect.polyphony))
    assert.ok(soundEffect.polyphony > 0)
    assert.equal(Object.isFrozen(soundEffect), true)
  }
})

test('getSoundEffect returns known effects and rejects unknown identities', () => {
  assert.equal(
    getSoundEffect(SFX_IDS.DRAG_START),
    SFX_CATALOG[SFX_IDS.DRAG_START],
  )
  assert.equal(getSoundEffect('unknown-sound'), null)
})

test('getMatchSoundId maps match sizes to their sound policy', () => {
  assert.equal(getMatchSoundId(3), SFX_IDS.MATCH_3)
  assert.equal(getMatchSoundId(4), SFX_IDS.MATCH_4)
  assert.equal(getMatchSoundId(5), SFX_IDS.MATCH_5)
  assert.equal(getMatchSoundId(6), SFX_IDS.MATCH_6)
  assert.equal(getMatchSoundId(7), SFX_IDS.MATCH_6)
  assert.equal(getMatchSoundId(8), SFX_IDS.MATCH_6)
})

test('getMatchSoundId rejects values that cannot represent a match', () => {
  assert.equal(getMatchSoundId(2), null)
  assert.equal(getMatchSoundId(3.5), null)
  assert.equal(getMatchSoundId('3'), null)
})
