import {
  CHARACTER_REACTION_IDS,
  getCharacterMatchReactionId,
} from './reactionCatalog.js'

export function getCharacterReactionIdForMatchStep(step) {
  if (step?.type !== 'match-found' || !Array.isArray(step.matchGroups)) {
    return null
  }

  const matchSizes = step.matchGroups
    .map((matchGroup) => matchGroup?.indices?.length)
    .filter((matchSize) => Number.isInteger(matchSize) && matchSize >= 3)

  if (matchSizes.length === 0) {
    return null
  }

  if (step.cascade > 1) {
    return CHARACTER_REACTION_IDS.CASCADE
  }

  return getCharacterMatchReactionId(Math.max(...matchSizes))
}
