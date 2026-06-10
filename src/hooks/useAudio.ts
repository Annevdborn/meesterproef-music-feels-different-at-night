'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackRateRef = useRef(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [src])

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate
    if (audioRef.current) audioRef.current.playbackRate = rate
  }, [])

  const play = useCallback(() => {
    if (!src) return

    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.loop = false
      audioRef.current.addEventListener('canplay', () => setIsReady(true))
      audioRef.current.addEventListener('ended', () => setIsPlaying(false))
    }

    audioRef.current.playbackRate = playbackRateRef.current
    audioRef.current.play().catch(() => {})
    setIsPlaying(true)
  }, [src])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
    setIsReady(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  return { isPlaying, isReady, play, pause, stop, toggle, audioRef, setPlaybackRate }
}
