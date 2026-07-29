import { getMatchSoundId } from './sfxCatalog.js'

export function getMatchSoundIdsForStep(step) {
  if (step?.type !== 'match-found' || !Array.isArray(step.matchGroups)) {
    return []
  }

  return step.matchGroups
    .map((matchGroup) => getMatchSoundId(matchGroup?.indices?.length))
    .filter((soundEffectId) => soundEffectId !== null)
}
