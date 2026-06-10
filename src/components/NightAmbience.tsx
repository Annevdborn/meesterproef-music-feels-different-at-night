'use client'

import { useEffect, useRef } from 'react'

export default function NightAmbience() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)
  const fadedOutRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/audio/night-ambient.mp3')
    audio.loop = true
    audio.volume = 0
    audioRef.current = audio

    const fadeIn = () => {
      if (startedRef.current) return
      startedRef.current = true
      audio.currentTime = 6
      audio.play().catch(() => {})
      let vol = 0
      const interval = setInterval(() => {
        vol = Math.min(vol + 0.01, 0.25)
        audio.volume = vol
        if (vol >= 0.25) clearInterval(interval)
      }, 80)
    }

    const fadeOut = () => {
      if (fadedOutRef.current) return
      fadedOutRef.current = true
      const interval = setInterval(() => {
        if (!audioRef.current) return clearInterval(interval)
        audioRef.current.volume = Math.max(audioRef.current.volume - 0.01, 0)
        if (audioRef.current.volume <= 0) {
          audioRef.current.pause()
          clearInterval(interval)
        }
      }, 60)
    }

    // Start bij eerste interactie
    const onInteraction = () => fadeIn()
    document.addEventListener('scroll', onInteraction, { once: true })
    document.addEventListener('click', onInteraction, { once: true })
    document.addEventListener('keydown', onInteraction, { once: true })

    // Fade out zodra records in beeld komen
    const checkScroll = () => {
      const trigger = document.getElementById('record-room-trigger')
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.8) {
        fadeOut()
        window.removeEventListener('scroll', checkScroll)
      }
    }
    window.addEventListener('scroll', checkScroll)

    return () => {
      document.removeEventListener('scroll', onInteraction)
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('keydown', onInteraction)
      window.removeEventListener('scroll', checkScroll)
      audio.pause()
      audio.src = ''
    }
  }, [])

  return null
}
