import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import {
  MUSIC_PLAYLIST,
  getNextTrackIndex,
  getPlaylistTrack,
} from '../audio/musicCatalog.js'

const DEFAULT_VOLUME = 0.18
const MUTED_STORAGE_KEY = 'sweet-mayhem:music-muted'

const GENRE_LABELS = {
  gothic: 'Gothic',
  goth: 'Goth',
  darkwave: 'Darkwave',
  'dark-metal': 'Dark Metal',
  deathcore: 'Deathcore',
}

function getInitialMutedPreference() {
  try {
    return window.localStorage.getItem(MUTED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

const BackgroundMusic = forwardRef(function BackgroundMusic(
  { showControl = true },
  ref,
) {
  const audioRef = useRef(null)
  const hasStartedRef = useRef(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(getInitialMutedPreference)
  const [playbackState, setPlaybackState] = useState('idle')
  const track = getPlaylistTrack(currentTrackIndex)

  const play = useCallback(async ({ unmute = false } = {}) => {
    const audio = audioRef.current

    if (audio === null) {
      return false
    }

    hasStartedRef.current = true

    if (unmute) {
      audio.muted = false
      setIsMuted(false)
    }

    try {
      await audio.play()
      setPlaybackState('playing')
      return true
    } catch {
      setPlaybackState('waiting')
      return false
    }
  }, [])

  useImperativeHandle(ref, () => ({ play }), [play])

  useEffect(() => {
    const audio = audioRef.current

    if (audio === null || track === null) {
      return undefined
    }

    let isDisposed = false

    function handlePlaybackStarted() {
      if (!isDisposed) {
        setPlaybackState('playing')
      }
    }

    function handlePlaybackError() {
      if (!isDisposed) {
        setPlaybackState('error')
      }
    }

    audio.loop = false
    audio.preload = 'auto'
    audio.volume = DEFAULT_VOLUME
    audio.load()
    audio.addEventListener('playing', handlePlaybackStarted)
    audio.addEventListener('error', handlePlaybackError)

    if (hasStartedRef.current) {
      void audio.play().catch(handlePlaybackError)
    }

    return () => {
      isDisposed = true
      audio.removeEventListener('playing', handlePlaybackStarted)
      audio.removeEventListener('error', handlePlaybackError)
      audio.pause()
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current

    if (audio !== null) {
      audio.muted = isMuted
    }

    try {
      window.localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted))
    } catch {
      // The preference is optional when browser storage is unavailable.
    }
  }, [isMuted])

  if (track === null) {
    return null
  }

  const isAudible = playbackState === 'playing' && !isMuted
  const statusLabel = isMuted
    ? 'Music muted'
    : playbackState === 'idle'
      ? 'Music ready'
      : playbackState === 'waiting'
        ? 'Click to play'
        : playbackState === 'error'
          ? 'Audio unavailable'
          : `${GENRE_LABELS[track.genre]} · ${currentTrackIndex + 1}/${MUSIC_PLAYLIST.length}`

  function handleTrackEnded() {
    const nextTrackIndex = getNextTrackIndex(currentTrackIndex)

    if (nextTrackIndex === null) {
      return
    }

    setPlaybackState('loading')
    setCurrentTrackIndex(nextTrackIndex)
  }

  async function handleToggleMusic() {
    const audio = audioRef.current

    if (audio === null) {
      return
    }

    if (isAudible) {
      audio.muted = true
      setIsMuted(true)
      return
    }

    await play({ unmute: true })
  }

  return (
    <>
      <audio
        className="background-music-audio"
        ref={audioRef}
        src={track.src}
        muted={isMuted}
        preload="auto"
        onEnded={handleTrackEnded}
      />

      {showControl && (
        <div className="music-control" data-playing={isAudible || undefined}>
          <button
            className="music-toggle"
            type="button"
            aria-pressed={isAudible}
            aria-label={isAudible ? 'Mute music' : 'Play music'}
            onClick={handleToggleMusic}
          >
            <span className="music-icon" aria-hidden="true">
              {isAudible ? '♪' : '×'}
            </span>

            <span className="music-copy">
              <small>{statusLabel}</small>
              <strong>{track.title}</strong>
            </span>
          </button>
        </div>
      )}
    </>
  )
})

export default BackgroundMusic
