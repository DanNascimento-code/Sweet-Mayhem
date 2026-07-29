function createCharacterReaction(reaction) {
  return Object.freeze(reaction)
}

export const CHARACTER_REACTION_IDS = Object.freeze({
  IDLE: 'idle',
  DRAG_START: 'drag-start',
  SWAP_REJECTED: 'swap-rejected',
  MATCH_3: 'match-3',
  MATCH_4: 'match-4',
  MATCH_5: 'match-5',
  MATCH_6: 'match-6',
  CASCADE: 'cascade',
})

export const CHARACTER_REACTION_CATALOG = Object.freeze({
  [CHARACTER_REACTION_IDS.IDLE]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.IDLE,
    animationKey: 'idle',
    priority: 0,
    duration: null,
    motionDuration: null,
    cooldown: 0,
  }),

  [CHARACTER_REACTION_IDS.DRAG_START]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.DRAG_START,
    animationKey: 'attention',
    priority: 10,
    duration: 4000,
    motionDuration: 500,
    cooldown: 250,
  }),

  [CHARACTER_REACTION_IDS.SWAP_REJECTED]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.SWAP_REJECTED,
    animationKey: 'disapprove',
    priority: 30,
    duration: 4800,
    motionDuration: 1200,
    cooldown: 450,
  }),

  [CHARACTER_REACTION_IDS.MATCH_3]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.MATCH_3,
    animationKey: 'celebrate-small',
    priority: 40,
    duration: 4200,
    motionDuration: 1100,
    cooldown: 300,
  }),

  [CHARACTER_REACTION_IDS.MATCH_4]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.MATCH_4,
    animationKey: 'celebrate-medium',
    priority: 50,
    duration: 4200,
    motionDuration: 1300,
    cooldown: 350,
  }),

  [CHARACTER_REACTION_IDS.MATCH_5]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.MATCH_5,
    animationKey: 'celebrate-large',
    priority: 60,
    duration: 4400,
    motionDuration: 1500,
    cooldown: 400,
  }),

  [CHARACTER_REACTION_IDS.MATCH_6]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.MATCH_6,
    animationKey: 'celebrate-epic',
    priority: 70,
    duration: 4400,
    motionDuration: 1800,
    cooldown: 500,
  }),

  [CHARACTER_REACTION_IDS.CASCADE]: createCharacterReaction({
    id: CHARACTER_REACTION_IDS.CASCADE,
    animationKey: 'celebrate-combo',
    priority: 80,
    duration: 4800,
    motionDuration: 1900,
    cooldown: 550,
  }),
})

export function getCharacterReaction(reactionId) {
  if (!Object.hasOwn(CHARACTER_REACTION_CATALOG, reactionId)) {
    return null
  }

  return CHARACTER_REACTION_CATALOG[reactionId]
}

export function getCharacterMatchReactionId(matchSize) {
  if (!Number.isInteger(matchSize) || matchSize < 3) {
    return null
  }

  const normalizedSize = Math.min(matchSize, 6)

  return CHARACTER_REACTION_IDS[`MATCH_${normalizedSize}`]
}
