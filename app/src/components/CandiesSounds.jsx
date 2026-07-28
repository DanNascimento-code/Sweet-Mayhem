import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react'

import {
    getSoundEffect,
    SFX_CATALOG,
} from '../audio/sfxCatalog.js'




const CandiesSounds = forwardRef(function CandiesSounds(
  { masterVolume = 1 },
  ref,
) {
  const playerPoolsRef = useRef(new Map())
  const nextVoiceIndicesRef = useRef(new Map())
  const normalizedMasterVolume =
    Number.isFinite(masterVolume)
      ? Math.min(Math.max(masterVolume, 0), 1)
      : 1

  useEffect(() => {
    const pools = new Map()

    for (const soundEffect of Object.values(SFX_CATALOG)) {
      const voices = Array.from(
        { length: soundEffect.polyphony },
        () => {
          const audio = new Audio(soundEffect.src)

          audio.preload = 'auto'
          audio.volume = soundEffect.volume * normalizedMasterVolume
          audio.load()

          return audio
        },
      )

      pools.set(soundEffect.id, voices)
      nextVoiceIndicesRef.current.set(soundEffect.id, 0)
    }

    playerPoolsRef.current = pools

    return () => {
      for (const voices of pools.values()) {
        for (const audio of voices) {
          audio.pause()
          audio.removeAttribute('src')
          audio.load()
        }
      }

      playerPoolsRef.current = new Map()
      nextVoiceIndicesRef.current = new Map()
    }
  }, [normalizedMasterVolume])

  const playSound = useCallback((soundEffectId) => {
    const soundEffect = getSoundEffect(soundEffectId)

    if (soundEffect === null) {
      return false
    }

    const voices = playerPoolsRef.current.get(soundEffect.id)

    if (voices === undefined || voices.length === 0) {
      return false
    }

    const currentVoiceIndex =
      nextVoiceIndicesRef.current.get(soundEffect.id) ?? 0
    const audio = voices[currentVoiceIndex]
    const nextVoiceIndex = (currentVoiceIndex + 1) % voices.length

    nextVoiceIndicesRef.current.set(soundEffect.id, nextVoiceIndex)

    audio.pause()
    audio.currentTime = 0

    void audio.play().catch(() => undefined)

    return true
  }, [])

  const playSounds = useCallback(
    (soundEffectIds) => {
      if (!Array.isArray(soundEffectIds)) {
        return 0
      }

      let playedCount = 0

      for (const soundEffectId of soundEffectIds) {
        if (playSound(soundEffectId)) {
          playedCount += 1
        }
      }

      return playedCount
    },
    [playSound],
  )

  useImperativeHandle(
    ref,
    () =>
      Object.freeze({
        play: playSound,
        playMany: playSounds,
      }),
    [playSound, playSounds],
  )

  return null
})

export default CandiesSounds
