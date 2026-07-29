import test from 'node:test'
import assert from 'node:assert/strict'

import { SFX_IDS } from './sfxCatalog.js'
import { getMatchSoundIdsForStep } from './sfxEvents.js'

function createMatchGroup(size) {
  return {
    indices: Array.from({ length: size }, (_, index) => index),
  }
}

test('a simple match produces one sound identity', () => {
  const step = {
    type: 'match-found',
    cascade: 1,
    matchGroups: [createMatchGroup(3)],
  }

  assert.deepEqual(
    getMatchSoundIdsForStep(step),
    [SFX_IDS.MATCH_3],
  )
})

test('simultaneous groups preserve one sound identity per group', () => {
  const step = {
    type: 'match-found',
    cascade: 1,
    matchGroups: [
      createMatchGroup(3),
      createMatchGroup(5),
      createMatchGroup(3),
    ],
  }

  assert.deepEqual(
    getMatchSoundIdsForStep(step),
    [SFX_IDS.MATCH_3, SFX_IDS.MATCH_5, SFX_IDS.MATCH_3],
  )
})

test('cascades produce separate sound batches at each match-found step', () => {
  const steps = [
    {
      type: 'match-found',
      cascade: 1,
      matchGroups: [createMatchGroup(3)],
    },
    {
      type: 'tiles-cleared',
      cascade: 1,
    },
    {
      type: 'match-found',
      cascade: 2,
      matchGroups: [createMatchGroup(4), createMatchGroup(6)],
    },
  ]

  const soundBatches = steps
    .map((step) => ({
      cascade: step.cascade,
      soundEffectIds: getMatchSoundIdsForStep(step),
    }))
    .filter(({ soundEffectIds }) => soundEffectIds.length > 0)

  assert.deepEqual(soundBatches, [
    {
      cascade: 1,
      soundEffectIds: [SFX_IDS.MATCH_3],
    },
    {
      cascade: 2,
      soundEffectIds: [SFX_IDS.MATCH_4, SFX_IDS.MATCH_6],
    },
  ])
})

test('steps without matches do not produce sound identities', () => {
  assert.deepEqual(
    getMatchSoundIdsForStep({ type: 'tiles-cleared' }),
    [],
  )
  assert.deepEqual(getMatchSoundIdsForStep(null), [])
})
