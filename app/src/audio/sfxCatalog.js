function createSoundEffect(soundEffect) {
    return Object.freeze(soundEffect)
}


export const SFX_IDS = Object.freeze({
    DRAG_START: 'drag-start',
    SWAP_REJECTED: 'swap-rejected',
    MATCH_3: 'match-3',
    MATCH_4: 'match-4',
    MATCH_5: 'match-5',
    MATCH_6: 'match-6',
})


export const SFX_CATALOG = Object.freeze({
  [SFX_IDS.DRAG_START]: createSoundEffect({
    id: SFX_IDS.DRAG_START,
    title: 'Início do arraste',
    src: new URL('./sfx/drag-start.wav', import.meta.url).href,
    volume: 0.28,
    polyphony: 2,
  }),

  [SFX_IDS.SWAP_REJECTED]: createSoundEffect({
    id: SFX_IDS.SWAP_REJECTED,
    title: 'Troca rejeitada',
    src: new URL('./sfx/swap-rejected.wav', import.meta.url).href,
    volume: 0.36,
    polyphony: 2,
  }),

  [SFX_IDS.MATCH_3]: createSoundEffect({
    id: SFX_IDS.MATCH_3,
    title: 'Combinação de três',
    src: new URL('./sfx/match-3.wav', import.meta.url).href,
    volume: 0.3,
    polyphony: 6,
  }),

  [SFX_IDS.MATCH_4]: createSoundEffect({
    id: SFX_IDS.MATCH_4,
    title: 'Combinação de quatro',
    src: new URL('./sfx/match-4.wav', import.meta.url).href,
    volume: 0.32,
    polyphony: 4,
  }),

  [SFX_IDS.MATCH_5]: createSoundEffect({
    id: SFX_IDS.MATCH_5,
    title: 'Combinação de cinco',
    src: new URL('./sfx/match-5.flac', import.meta.url).href,
    volume: 0.27,
    polyphony: 3,
  }),

  [SFX_IDS.MATCH_6]: createSoundEffect({
    id: SFX_IDS.MATCH_6,
    title: 'Combinação de seis ou mais',
    src: new URL('./sfx/match-6.flac', import.meta.url).href,
    volume: 0.25,
    polyphony: 3,
  }),
})


export function getSoundEffect(soundEffectId) {
    if (!Object.hasOwn(SFX_CATALOG, soundEffectId)) {
        return null
    }

    return SFX_CATALOG[soundEffectId]
}


export function getMatchSoundId(matchSize) {
  if (!Number.isInteger(matchSize) || matchSize < 3) {
    return null
  }

  const normalizedSize = Math.min(matchSize, 6)

  return SFX_IDS[`MATCH_${normalizedSize}`]
}

