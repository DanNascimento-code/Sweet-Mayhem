import { CHARACTER_REACTION_IDS } from './reactionCatalog.js'

const CHARACTER_VOICE_VOLUME = 0.95

function createCharacterVoiceAsset(id, src) {
  return Object.freeze({
    id,
    src,
    volume: CHARACTER_VOICE_VOLUME,
  })
}

function createCharacterVoiceSet(voiceAssets) {
  return Object.freeze(voiceAssets)
}

export const CHARACTER_VOICE_CATALOG = Object.freeze({
  [CHARACTER_REACTION_IDS.IDLE]: createCharacterVoiceSet([]),

  [CHARACTER_REACTION_IDS.WELCOME]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'welcome-0',
      new URL('../audio/voice/welcome-0.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.DRAG_START]: createCharacterVoiceSet([]),

  [CHARACTER_REACTION_IDS.SWAP_REJECTED]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'swap-rejected-0',
      new URL('../audio/voice/swap-rejected-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'swap-rejected-1',
      new URL('../audio/voice/swap-rejected-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'swap-rejected-2',
      new URL('../audio/voice/swap-rejected-2.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.MATCH_3]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'match-3-0',
      new URL('../audio/voice/match-3-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-3-1',
      new URL('../audio/voice/match-3-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-3-2',
      new URL('../audio/voice/match-3-2.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.MATCH_4]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'match-4-0',
      new URL('../audio/voice/match-4-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-4-1',
      new URL('../audio/voice/match-4-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-4-2',
      new URL('../audio/voice/match-4-2.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.MATCH_5]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'match-5-0',
      new URL('../audio/voice/match-5-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-5-1',
      new URL('../audio/voice/match-5-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-5-2',
      new URL('../audio/voice/match-5-2.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.MATCH_6]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'match-6-0',
      new URL('../audio/voice/match-6-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-6-1',
      new URL('../audio/voice/match-6-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'match-6-2',
      new URL('../audio/voice/match-6-2.wav', import.meta.url).href,
    ),
  ]),

  [CHARACTER_REACTION_IDS.CASCADE]: createCharacterVoiceSet([
    createCharacterVoiceAsset(
      'cascade-0',
      new URL('../audio/voice/cascade-0.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'cascade-1',
      new URL('../audio/voice/cascade-1.wav', import.meta.url).href,
    ),
    createCharacterVoiceAsset(
      'cascade-2',
      new URL('../audio/voice/cascade-2.wav', import.meta.url).href,
    ),
  ]),
})

export function getCharacterVoiceAsset(reactionId, variationIndex = 0) {
  const voiceAssets = CHARACTER_VOICE_CATALOG[reactionId]

  if (!voiceAssets || voiceAssets.length === 0) {
    return null
  }

  const normalizedIndex = Number.isInteger(variationIndex)
    ? Math.abs(variationIndex)
    : 0

  return voiceAssets[normalizedIndex % voiceAssets.length]
}

export function getAllCharacterVoiceAssets() {
  return Object.freeze(
    Object.values(CHARACTER_VOICE_CATALOG).flat(),
  )
}
