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
    title: 'Drag start',
    src: new URL('./sfx/drag-start.wav', import.meta.url).href,
    volume: 0.5,
    polyphony: 2,
  }),

  [SFX_IDS.SWAP_REJECTED]: createSoundEffect({
    id: SFX_IDS.SWAP_REJECTED,
    title: 'Rejected swap',
    src: new URL('./sfx/swap-rejected.wav', import.meta.url).href,
    volume: 0.58,
    polyphony: 2,
  }),

  [SFX_IDS.MATCH_3]: createSoundEffect({
    id: SFX_IDS.MATCH_3,
    title: 'Match of three',
    src: new URL('./sfx/match-3.wav', import.meta.url).href,
    volume: 0.62,
    polyphony: 6,
  }),

  [SFX_IDS.MATCH_4]: createSoundEffect({
    id: SFX_IDS.MATCH_4,
    title: 'Match of four',
    src: new URL('./sfx/match-4.wav', import.meta.url).href,
    volume: 0.54,
    polyphony: 4,
  }),

  [SFX_IDS.MATCH_5]: createSoundEffect({
    id: SFX_IDS.MATCH_5,
    title: 'Match of five',
    src: new URL('./sfx/match-5.flac', import.meta.url).href,
    volume: 0.46,
    polyphony: 3,
  }),

  [SFX_IDS.MATCH_6]: createSoundEffect({
    id: SFX_IDS.MATCH_6,
    title: 'Match of six or more',
    src: new URL('./sfx/match-6.flac', import.meta.url).href,
    volume: 0.43,
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
