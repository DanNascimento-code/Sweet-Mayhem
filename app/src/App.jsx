import { useEffect, useRef, useState } from 'react'

import AnimatedBackground from './components/AnimatedBackground.jsx'
import BackgroundMusic from './components/BackgroundMusic.jsx'
import CandiesSounds from './components/CandiesSounds.jsx'
import KuromiCharacter from './components/KuromiCharacter.jsx'
import { SFX_IDS } from './audio/sfxCatalog.js'
import { getMatchSoundIdsForStep } from './audio/sfxEvents.js'
import {
  CHARACTER_REACTION_IDS,
  getCharacterReaction,
} from './character/reactionCatalog.js'
import { getCharacterReactionIdForMatchStep } from './character/reactionEvents.js'
import blueCandy from './images/dark-candies/blue-haunted-moon.png'
import colorBombCandy from './images/dark-candies/color-bomb.png'
import greenCandy from './images/dark-candies/green-poison-apple.png'
import orangeCandy from './images/dark-candies/orange-dagger.png'
import purpleCandy from './images/dark-candies/purple-skull.png'
import redCandy from './images/dark-candies/red-broken-heart.png'
import yellowCandy from './images/dark-candies/yellow-fanged-star.png'

import {
  EMPTY_TILE,
  areAdjacent,
  createBoard,
  trySwap,
} from './game/board.js'
import { SPECIAL_TYPES } from './game/candy.js'

const BOARD_WIDTH = 8
const SFX_MASTER_VOLUME = 0.72
const APP_SCREENS = Object.freeze({
  START: 'start',
  TRANSITIONING: 'transitioning',
  PLAYING: 'playing',
})
const INTRO_STAGES = Object.freeze({
  LOCKED: 'locked',
  PRESENTATION: 'presentation',
  READY: 'ready',
})
const CANDY_TYPES = ['blue', 'green', 'orange', 'purple', 'red', 'yellow']
const CANDY_IMAGES = {
  blue: blueCandy,
  green: greenCandy,
  orange: orangeCandy,
  purple: purpleCandy,
  red: redCandy,
  yellow: yellowCandy,
}

const CANDY_LABELS = {
  blue: 'blue haunted moon',
  green: 'green poisoned apple',
  orange: 'orange cursed dagger',
  purple: 'purple candy skull',
  red: 'red broken heart',
  yellow: 'yellow fanged star',
}

const SPECIAL_LABELS = {
  [SPECIAL_TYPES.STRIPED_ROW]: 'with horizontal stripes',
  [SPECIAL_TYPES.STRIPED_COLUMN]: 'with vertical stripes',
  [SPECIAL_TYPES.COLOR_BOMB]: 'color bomb',
}

const STEP_DELAYS = {
  'match-found': 450,
  'tiles-cleared': 250,
  'tiles-fell': 350,
  'tiles-refilled': 350,
}

const SWAP_DELAY = 280
const REJECTED_SWAP_DELAY = 460

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

function getSwapStyle(index, swapAnimation) {
  if (swapAnimation === null) {
    return undefined
  }

  const { firstIndex, secondIndex } = swapAnimation
  let targetIndex = null

  if (index === firstIndex) {
    targetIndex = secondIndex
  } else if (index === secondIndex) {
    targetIndex = firstIndex
  }

  if (targetIndex === null) {
    return undefined
  }

  const currentRow = Math.floor(index / BOARD_WIDTH)
  const targetRow = Math.floor(targetIndex / BOARD_WIDTH)
  const currentColumn = index % BOARD_WIDTH
  const targetColumn = targetIndex % BOARD_WIDTH
  const rowDifference = targetRow - currentRow
  const columnDifference = targetColumn - currentColumn

  const horizontalDistance =
    columnDifference === 0
      ? '0px'
      : columnDifference > 0
        ? 'calc(100% + var(--board-gap))'
        : 'calc(-100% - var(--board-gap))'

  const verticalDistance =
    rowDifference === 0
      ? '0px'
      : rowDifference > 0
        ? 'calc(100% + var(--board-gap))'
        : 'calc(-100% - var(--board-gap))'

  return {
    '--swap-x': horizontalDistance,
    '--swap-y': verticalDistance,
  }
}

function getAnimatedIndices(previousBoard, step) {
  if (step.type === 'match-found') {
    return step.matchedIndices
  }

  if (step.type === 'tiles-cleared') {
    return step.clearedIndices
  }

  if (step.type === 'tiles-fell') {
    return step.board.reduce((indices, candy, index) => {
      const changedPosition =
        candy !== EMPTY_TILE &&
        candy !== previousBoard[index]

      if (changedPosition) {
        indices.push(index)
      }

      return indices
    }, [])
  }

  if (step.type === 'tiles-refilled') {
    return step.board.reduce((indices, candy, index) => {
      const receivedNewCandy =
        previousBoard[index] === EMPTY_TILE &&
        candy !== EMPTY_TILE

      if (receivedNewCandy) {
        indices.push(index)
      }

      return indices
    }, [])
  }

  return []
}

function getMatchSizeForIndex(index, activeStep) {
  if (
    activeStep?.type !== 'match-found' ||
    !activeStep.matchGroups
  ) {
    return null
  }

  const matchingSizes = activeStep.matchGroups
    .filter((group) => group.indices.includes(index))
    .map((group) => group.indices.length)

  if (matchingSizes.length === 0) {
    return null
  }

  const largestMatchSize = Math.max(...matchingSizes)

  return largestMatchSize >= 5
    ? '5-plus'
    : String(largestMatchSize)
}

function getCandyAriaLabel(candy, index) {
  if (candy === EMPTY_TILE) {
    return `Empty position ${index + 1}`
  }

  if (candy.specialType === SPECIAL_TYPES.COLOR_BOMB) {
    return `Color bomb, position ${index + 1}`
  }

  const specialDescription = candy.specialType
    ? ` ${SPECIAL_LABELS[candy.specialType]}`
    : ''
  const candyDescription = CANDY_LABELS[candy.candyType] ?? candy.candyType

  return `${candyDescription}${specialDescription}, position ${index + 1}`
}

function newBoard() {
  return createBoard({
    width: BOARD_WIDTH,
    candyTypes: CANDY_TYPES,
  })
}

function App() {
  const [currentScreen, setCurrentScreen] = useState(APP_SCREENS.START)
  const [introStage, setIntroStage] = useState(INTRO_STAGES.LOCKED)
  const [board, setBoard] = useState([])
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState(
    'Drag a candy or select two neighboring candies.',
  )
  const [isResolving, setIsResolving] = useState(false)
  const [activeStep, setActiveStep] = useState(null)
  const resolvingRef = useRef(false)
  const candiesSoundsRef = useRef(null)
  const backgroundMusicRef = useRef(null)
  const characterReactionTimerRef = useRef(null)
  const [characterReaction, setCharacterReaction] = useState({
    id: CHARACTER_REACTION_IDS.IDLE,
    sequence: 0,
  })
  const [animatedIndices, setAnimatedIndices] = useState([])
  const [swapAnimation, setSwapAnimation] = useState(null)

  useEffect(() => {
    return () => {
      if (characterReactionTimerRef.current !== null) {
        window.clearTimeout(characterReactionTimerRef.current)
      }
    }
  }, [])

  function clearCharacterReactionTimer() {
    if (characterReactionTimerRef.current === null) {
      return
    }

    window.clearTimeout(characterReactionTimerRef.current)
    characterReactionTimerRef.current = null
  }

  function showCharacterReaction(reactionId) {
    const reaction = getCharacterReaction(reactionId)

    if (!reaction) {
      return
    }

    clearCharacterReactionTimer()
    setCharacterReaction((currentReaction) => ({
      id: reaction.id,
      sequence: currentReaction.sequence + 1,
    }))

    if (reaction.duration === null) {
      return
    }

    characterReactionTimerRef.current = window.setTimeout(() => {
      setCharacterReaction((currentReaction) => ({
        id: CHARACTER_REACTION_IDS.IDLE,
        sequence: currentReaction.sequence + 1,
      }))
      characterReactionTimerRef.current = null
    }, reaction.duration)
  }

  async function attemptMove(firstIndex, secondIndex) {
    if (resolvingRef.current) {
      return
    }

    const result = trySwap({
      board,
      firstIndex,
      secondIndex,
      width: BOARD_WIDTH,
      candyTypes: CANDY_TYPES,
    })

    if (!result.accepted && result.reason === 'not-adjacent') {
      candiesSoundsRef.current?.play(SFX_IDS.SWAP_REJECTED)
      showCharacterReaction(CHARACTER_REACTION_IDS.SWAP_REJECTED)
      setMessage('Those candies are not neighbors.')
      return
    }

    if (!result.accepted) {
      candiesSoundsRef.current?.play(SFX_IDS.SWAP_REJECTED)
      showCharacterReaction(CHARACTER_REACTION_IDS.SWAP_REJECTED)
      resolvingRef.current = true
      setIsResolving(true)
      setMessage('That swap does not create a match.')

      try {
        setSwapAnimation({
          firstIndex,
          secondIndex,
          rejected: true,
        })

        await wait(REJECTED_SWAP_DELAY)
      } finally {
        setSwapAnimation(null)
        resolvingRef.current = false
        setIsResolving(false)
      }

      return
    }

    resolvingRef.current = true
    setIsResolving(true)
    setMessage('Swapping candies...')

    try {
      setSwapAnimation({
        firstIndex,
        secondIndex,
        rejected: false,
      })

      await wait(SWAP_DELAY)

      setSwapAnimation(null)
      setMessage('Resolving match...')

      let previousBoard = board

      for (const step of result.steps) {
        if (step.type === 'match-found') {
          const matchSoundIds = getMatchSoundIdsForStep(step)
          const matchReactionId = getCharacterReactionIdForMatchStep(step)

          candiesSoundsRef.current?.playMany(matchSoundIds)
          showCharacterReaction(matchReactionId)
        }

        setAnimatedIndices(getAnimatedIndices(previousBoard, step))
        setActiveStep(step)
        setBoard(step.board)

        await wait(STEP_DELAYS[step.type] ?? 300)

        previousBoard = step.board
      }

      setBoard(result.board)
      setScore((currentScore) => currentScore + result.score)
      setMessage(
        result.cascades > 1
          ? `Cascade combo ×${result.cascades}! +${result.score} points.`
          : `Match cleared! +${result.score} points.`,
      )
    } finally {
      setSwapAnimation(null)
      setActiveStep(null)
      setAnimatedIndices([])
      resolvingRef.current = false
      setIsResolving(false)
    }
  }

  function handleTileClick(index) {
    if (selectedIndex === null) {
      setSelectedIndex(index)
      setMessage('Now select a neighboring candy.')
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      setMessage('Selection canceled.')
      return
    }

    if (!areAdjacent(selectedIndex, index, BOARD_WIDTH, board.length)) {
      candiesSoundsRef.current?.play(SFX_IDS.SWAP_REJECTED)
      showCharacterReaction(CHARACTER_REACTION_IDS.SWAP_REJECTED)
      setSelectedIndex(index)
      setMessage('Selection moved. Choose one of this candy’s neighbors.')
      return
    }

    attemptMove(selectedIndex, index)
    setSelectedIndex(null)
  }

  function handleDragStart(index) {
    setDraggedIndex(index)
    candiesSoundsRef.current?.play(SFX_IDS.DRAG_START)
    showCharacterReaction(CHARACTER_REACTION_IDS.DRAG_START)
  }

  function handleDrop(event, targetIndex) {
    event.preventDefault()

    if (draggedIndex !== null) {
      attemptMove(draggedIndex, targetIndex)
    }

    setDraggedIndex(null)
    setSelectedIndex(null)
  }

  function resetGame(nextMessage) {
    clearCharacterReactionTimer()
    setBoard(newBoard())
    setScore(0)
    setDraggedIndex(null)
    setSelectedIndex(null)
    setActiveStep(null)
    setAnimatedIndices([])
    setSwapAnimation(null)
    setCharacterReaction((currentReaction) => ({
      id: CHARACTER_REACTION_IDS.IDLE,
      sequence: currentReaction.sequence + 1,
    }))
    resolvingRef.current = false
    setIsResolving(false)
    setMessage(nextMessage)
  }

  function handleEnterIntro() {
    if (
      currentScreen !== APP_SCREENS.START ||
      introStage !== INTRO_STAGES.LOCKED
    ) {
      return
    }

    void backgroundMusicRef.current?.play({ unmute: true })
    setIntroStage(INTRO_STAGES.PRESENTATION)
  }

  function handleAwakenIntro() {
    if (
      currentScreen !== APP_SCREENS.START ||
      introStage !== INTRO_STAGES.PRESENTATION
    ) {
      return
    }

    setIntroStage(INTRO_STAGES.READY)
  }

  function handleStartGame() {
    if (
      currentScreen !== APP_SCREENS.START ||
      introStage !== INTRO_STAGES.READY
    ) {
      return
    }

    resetGame('Drag a candy or select two neighboring candies.')
    setCurrentScreen(APP_SCREENS.TRANSITIONING)
  }

  function handleStartTransitionEnd(event) {
    const transitionBelongsToStartScreen = event.target === event.currentTarget

    if (
      currentScreen !== APP_SCREENS.TRANSITIONING ||
      !transitionBelongsToStartScreen
    ) {
      return
    }

    setCurrentScreen(APP_SCREENS.PLAYING)
    showCharacterReaction(CHARACTER_REACTION_IDS.WELCOME)
  }

  function restartGame() {
    resetGame('A fresh board appeared with no opening matches.')
    showCharacterReaction(CHARACTER_REACTION_IDS.WELCOME)
  }

  const isPlaying = currentScreen === APP_SCREENS.PLAYING

  return (
    <main className="app" data-screen={currentScreen}>
      <AnimatedBackground variant={isPlaying ? 'game' : 'intro'} />
      <CandiesSounds
        ref={candiesSoundsRef}
        masterVolume={SFX_MASTER_VOLUME}
      />
      <BackgroundMusic
        ref={backgroundMusicRef}
        showControl={isPlaying}
      />

      {!isPlaying && (
        <section
          className="start-screen"
          data-intro-stage={introStage}
          aria-labelledby={
            introStage === INTRO_STAGES.LOCKED
              ? 'intro-gate-title'
              : 'start-title'
          }
          aria-busy={currentScreen === APP_SCREENS.TRANSITIONING}
          onAnimationEnd={handleStartTransitionEnd}
        >
          {introStage === INTRO_STAGES.LOCKED ? (
            <div className="intro-gate">
              <p
                className="intro-gate-mark intro-depth"
                style={{ '--intro-delay': '60ms' }}
                aria-hidden="true"
              >
                ✦ ☾ ✦
              </p>
              <p
                className="intro-gate-kicker intro-depth"
                style={{ '--intro-delay': '160ms' }}
              >
                A cursed arcade signal is waiting
              </p>
              <h1
                className="intro-gate-title intro-depth"
                id="intro-gate-title"
                style={{ '--intro-delay': '280ms' }}
              >
                Enter the nightmare
              </h1>
              <button
                className="intro-enter intro-depth"
                style={{ '--intro-delay': '430ms' }}
                type="button"
                onClick={handleEnterIntro}
              >
                <span>Open the gates</span>
              </button>
            </div>
          ) : (
            <>
              <div className="intro-copy">
                <p
                  className="intro-kicker intro-depth"
                  style={{ '--intro-delay': '80ms' }}
                >
                  A gothic arcade match-3
                </p>
                <h1
                  className="intro-title intro-depth"
                  id="start-title"
                  style={{ '--intro-delay': '220ms' }}
                >
                  <span>Kuromi:</span>
                  <span>Sweet Mayhem</span>
                </h1>
                <p
                  className="start-description intro-depth"
                  style={{ '--intro-delay': '410ms' }}
                >
                  Match cursed candy and unleash the cutest chaos in the dark.
                </p>
                <p
                  className="intro-credit intro-depth"
                  style={{ '--intro-delay': '560ms' }}
                >
                  Developed by Danilo Nascimento
                </p>
              </div>

              {introStage === INTRO_STAGES.PRESENTATION ? (
                <button
                  className="intro-unlock intro-depth"
                  style={{ '--intro-delay': '760ms' }}
                type="button"
                onClick={handleAwakenIntro}
              >
                  <span>Awaken</span>
                </button>
              ) : (
                <button
                  className="start-button"
                  type="button"
                  disabled={currentScreen === APP_SCREENS.TRANSITIONING}
                  onClick={handleStartGame}
                >
                  {currentScreen === APP_SCREENS.TRANSITIONING
                    ? 'Entering the arcade...'
                    : 'Start the game'}
                </button>
              )}
            </>
          )}
        </section>
      )}

      {isPlaying && (
        <div className="game-stage">
          <KuromiCharacter
            placement="game"
            reactionId={characterReaction.id}
            reactionSequence={characterReaction.sequence}
          />

          <section className="game-shell" aria-label="Candy matching game">
            <header className="game-header">
              <div>
                <p className="eyebrow">Dark Candy // Arcade</p>
                <h1>Sweet Mayhem</h1>
              </div>

              <div className="score-card" aria-label={`${score} points`}>
                <span>Score</span>
                <strong>{score.toLocaleString('en-US')}</strong>
              </div>
            </header>

            <div
              className="game"
              style={{ '--board-width': BOARD_WIDTH }}
              data-step={
                swapAnimation
                  ? swapAnimation.rejected
                    ? 'tiles-swap-rejected'
                    : 'tiles-swapping'
                  : activeStep?.type
              }
              aria-busy={isResolving}
              aria-label="8 by 8 candy board"
            >
              {board.map((candy, index) => {
                const isEmpty = candy === EMPTY_TILE
                const candyType = candy?.candyType ?? null
                const specialType = candy?.specialType ?? null
                const isAnimating = animatedIndices.includes(index)
                const matchSize = getMatchSizeForIndex(index, activeStep)
                const swapStyle = getSwapStyle(index, swapAnimation)
                const isSwapping = swapStyle !== undefined
                const isSwapFront = swapAnimation?.firstIndex === index

                return (
                  <button
                    className={`tile${selectedIndex === index ? ' selected' : ''}${
                      isEmpty ? ' empty' : ''
                    }${isAnimating ? ' animating' : ''}${
                      isSwapping ? ' swapping' : ''
                    }${isSwapFront ? ' swap-front' : ''}${
                      matchSize ? ` match-${matchSize}` : ''
                    }`}
                    style={swapStyle}
                    key={index}
                    type="button"
                    disabled={isResolving}
                    draggable={!isResolving && !isEmpty}
                    aria-label={getCandyAriaLabel(candy, index)}
                    aria-pressed={selectedIndex === index}
                    onClick={() => handleTileClick(index)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                  >
                    {!isEmpty && (
                      <span
                        className="candy-visual"
                        data-candy-type={candyType ?? undefined}
                        data-special-type={specialType ?? undefined}
                      >
                        <img
                          src={
                            specialType === SPECIAL_TYPES.COLOR_BOMB
                              ? colorBombCandy
                              : CANDY_IMAGES[candyType]
                          }
                          alt=""
                          draggable="false"
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <footer className="game-footer">
              <p className="message" aria-live="polite">
                {message}
              </p>

              <div className="footer-controls">
                <button
                  className="restart-button"
                  type="button"
                  disabled={isResolving}
                  onClick={restartGame}
                >
                  Restart
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
