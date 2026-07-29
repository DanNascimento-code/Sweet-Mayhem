import { useEffect, useRef } from 'react'

import { getAllCharacterVoiceAssets } from '../character/voiceCatalog.js'

function CharacterVoice({ enabled = true, sequence, voiceAsset }) {
  const playersRef = useRef(new Map())
  const activePlayerRef = useRef(null)

  useEffect(() => {
    if (!enabled || typeof Audio !== 'function') {
      return undefined
    }

    const players = new Map()

    for (const asset of getAllCharacterVoiceAssets()) {
      const player = new Audio(asset.src)

      player.preload = 'auto'
      player.volume = asset.volume
      player.load()
      players.set(asset.id, player)
    }

    playersRef.current = players

    return () => {
      activePlayerRef.current = null

      for (const player of players.values()) {
        player.pause()
        player.removeAttribute('src')
        player.load()
      }

      playersRef.current = new Map()
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !voiceAsset) {
      return undefined
    }

    const player = playersRef.current.get(voiceAsset.id)

    if (!player) {
      return undefined
    }

    const previousPlayer = activePlayerRef.current

    if (previousPlayer) {
      previousPlayer.pause()
      previousPlayer.currentTime = 0
    }

    player.pause()
    player.currentTime = 0
    player.volume = voiceAsset.volume
    activePlayerRef.current = player

    const clearActivePlayer = () => {
      if (activePlayerRef.current === player) {
        activePlayerRef.current = null
      }
    }

    player.addEventListener('ended', clearActivePlayer, { once: true })
    void player.play().catch(clearActivePlayer)


    return () => {
      player.removeEventListener('ended', clearActivePlayer)

      if (activePlayerRef.current === player) {
        player.pause()
        player.currentTime = 0
        activePlayerRef.current = null
      }
    }
  }, [enabled, sequence, voiceAsset])

  return null
}

export default CharacterVoice
