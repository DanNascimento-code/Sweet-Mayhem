import kuromiIdle from '../images/characters/kuromi-idle-v2.png'
import kuromiCelebrate from '../images/characters/kuromi-celebrate.png'
import kuromiDisapprove from '../images/characters/kuromi-disapprove.png'
import kuromiEpic from '../images/characters/kuromi-epic.png'
import CharacterVoice from './CharacterVoice.jsx'
import {
  CHARACTER_REACTION_IDS,
  getCharacterReaction,
} from '../character/reactionCatalog.js'
import { getCharacterDialogueLine } from '../character/dialogueCatalog.js'
import { getCharacterVoiceAsset } from '../character/voiceCatalog.js'

const CHARACTER_IMAGES = Object.freeze({
  idle: kuromiIdle,
  attention: kuromiIdle,
  disapprove: kuromiDisapprove,
  'celebrate-small': kuromiCelebrate,
  'celebrate-medium': kuromiCelebrate,
  'celebrate-large': kuromiEpic,
  'celebrate-epic': kuromiEpic,
  'celebrate-combo': kuromiEpic,
})

function KuromiCharacter({
  placement,
  reactionId = CHARACTER_REACTION_IDS.IDLE,
  reactionSequence = 0,
}) {
  const reaction =
    getCharacterReaction(reactionId) ??
    getCharacterReaction(CHARACTER_REACTION_IDS.IDLE)
  const reactionStyle =
    reaction.motionDuration === null
      ? undefined
      : { '--character-motion-duration': `${reaction.motionDuration}ms` }
  const characterImage =
    CHARACTER_IMAGES[reaction.animationKey] ?? kuromiIdle
  const dialogueLine =
    placement === 'game'
      ? getCharacterDialogueLine(reaction.id, reactionSequence)
      : null
  const voiceAsset =
    placement === 'game'
      ? getCharacterVoiceAsset(reaction.id, reactionSequence)
      : null
  const accessibleDescription =
    placement === 'start'
      ? 'Kuromi apresentando o jogo'
      : 'Kuromi observando o tabuleiro'

  return (
    <div
      className="kuromi-character"
      data-placement={placement}
      data-reaction={reaction.id}
      data-animation={reaction.animationKey}
      data-reaction-sequence={reactionSequence}
      style={reactionStyle}
    >
      <CharacterVoice
        enabled={placement === 'game'}
        sequence={reactionSequence}
        voiceAsset={voiceAsset}
      />

      <div
        className="kuromi-dialogue"
        aria-live="polite"
        aria-atomic="true"
      >
        {dialogueLine && (
          <p
            className="kuromi-speech-bubble"
            key={`${reaction.id}-${reactionSequence}`}
          >
            {dialogueLine}
          </p>
        )}
      </div>

      <div
        className="kuromi-character-portrait"
        role="img"
        aria-label={accessibleDescription}
      >
        <img
          key={reactionSequence}
          src={characterImage}
          alt=""
          draggable="false"
        />
      </div>
    </div>
  )
}

export default KuromiCharacter
