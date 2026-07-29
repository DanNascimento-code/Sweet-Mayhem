import { CHARACTER_REACTION_IDS } from './reactionCatalog.js'

function createDialogueLines(lines) {
  return Object.freeze(lines)
}

export const CHARACTER_DIALOGUE_CATALOG = Object.freeze({
  [CHARACTER_REACTION_IDS.IDLE]: createDialogueLines([]),
  [CHARACTER_REACTION_IDS.WELCOME]: createDialogueLines([
    'Welcome to my little nightmare. Try not to embarrass yourself... I hate boring guests.',
  ]),
  [CHARACTER_REACTION_IDS.DRAG_START]: createDialogueLines([
    'Choose your next chaos wisely.',
    "Let's see if this swap is any good...",
    "Move carefully. Or don't.",
  ]),
  [CHARACTER_REACTION_IDS.SWAP_REJECTED]: createDialogueLines([
    'Even the darkness rejected that swap.',
    'No. Try causing better chaos.',
    'That swap died before it even started.',
  ]),
  [CHARACTER_REACTION_IDS.MATCH_3]: createDialogueLines([
    'A small spell. Not bad.',
    'Three candies. The chaos has awakened.',
    'That was almost elegant.',
  ]),
  [CHARACTER_REACTION_IDS.MATCH_4]: createDialogueLines([
    'Four! Now this is getting interesting.',
    'A perfect line of confusion.',
    'I like it. Keep going.',
  ]),
  [CHARACTER_REACTION_IDS.MATCH_5]: createDialogueLines([
    'Five! That deserves a little respect.',
    'A special candy for special chaos.',
    "Now you're speaking my language.",
  ]),
  [CHARACTER_REACTION_IDS.MATCH_6]: createDialogueLines([
    'Six! Magnificently dark.',
    'Now that was an explosion of style.',
    'The board is at your feet.',
  ]),
  [CHARACTER_REACTION_IDS.CASCADE]: createDialogueLines([
    'More! Let the chaos continue!',
    'Combo! The board has lost control.',
    'Dark cascade. Perfect.',
  ]),
})

export function getCharacterDialogueLine(reactionId, variationIndex = 0) {
  const dialogueLines = CHARACTER_DIALOGUE_CATALOG[reactionId]

  if (!dialogueLines || dialogueLines.length === 0) {
    return null
  }

  const normalizedIndex = Number.isInteger(variationIndex)
    ? Math.abs(variationIndex)
    : 0

  return dialogueLines[normalizedIndex % dialogueLines.length]
}
