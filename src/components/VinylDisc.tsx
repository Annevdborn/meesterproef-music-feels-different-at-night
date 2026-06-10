'use client'

import { useRef, useEffect, useState } from 'react'
import React from 'react'
import { motion, useMotionValue } from 'framer-motion'
import type { Song, RPM } from '@/types'

interface VinylDiscProps {
  song: Song
  isPlaying: boolean
  isSpinning: boolean
  rpm: RPM
  audioRef?: React.RefObject<HTMLAudioElement | null>
}

const GROOVE_COUNT = 68

export default function VinylDisc({ song, isPlaying, isSpinning, rpm, audioRef }: VinylDiscProps) {
  const rotation = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isScratching = useRef(false)
  const wasAudioPlayingRef = useRef(false)
  const lastAngle = useRef(0)
  const lastScratchTime = useRef(0)
  const rafRef = useRef<number | null>(null)
  const [isGrabbing, setIsGrabbing] = useState(false)

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null)
  const scratchBufferRef = useRef<AudioBuffer | null>(null)
  const scratchSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const scratchGainRef = useRef<GainNode | null>(null)
  const stopFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
    return audioCtxRef.current
  }

  const loadScratchBuffer = async () => {
    if (scratchBufferRef.current) return
    const ctx = getAudioCtx()
    const res = await fetch('/scratch.mp3')
    const raw = await res.arrayBuffer()
    scratchBufferRef.current = await ctx.decodeAudioData(raw)
  }

  const startScratchSound = () => {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume()
    if (!scratchBufferRef.current) return
    try { scratchSourceRef.current?.stop() } catch {}
    const source = ctx.createBufferSource()
    source.buffer = scratchBufferRef.current
    source.loop = true
    source.playbackRate.value = 1
    const gain = ctx.createGain()
    gain.gain.value = 0
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    scratchSourceRef.current = source
    scratchGainRef.current = gain
  }

  const setScratchIntensity = (velocity: number) => {
    const ctx = audioCtxRef.current
    const gain = scratchGainRef.current
    const source = scratchSourceRef.current
    if (!ctx || !gain || !source) return
    gain.gain.setTargetAtTime(Math.min(velocity * 0.06, 1), ctx.currentTime, 0.015)
    source.playbackRate.setTargetAtTime(Math.min(0.5 + velocity * 0.05, 3), ctx.currentTime, 0.015)
  }

  const fadeScratchOut = () => {
    const ctx = audioCtxRef.current
    const gain = scratchGainRef.current
    if (!ctx || !gain) return
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.07)
  }

  useEffect(() => {
    return () => {
      try { scratchSourceRef.current?.stop() } catch {}
      audioCtxRef.current?.close()
    }
  }, [])

  // Disc spins immediately when isSpinning — arm timing is managed by the parent
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (!isSpinning) return

    const degsPerMs = (rpm * 360) / (60 * 1000)
    let lastTs: number | null = null

    const tick = (ts: number) => {
      if (!isScratching.current) {
        if (lastTs !== null) rotation.set(rotation.get() + degsPerMs * (ts - lastTs))
        lastTs = ts
      } else {
        lastTs = null
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isSpinning, rpm, rotation])

  const getAngle = (clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.atan2(
      clientY - (rect.top + rect.height / 2),
      clientX - (rect.left + rect.width / 2)
    ) * (180 / Math.PI)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isScratching.current = true
    setIsGrabbing(true)
    lastAngle.current = getAngle(e.clientX, e.clientY)
    lastScratchTime.current = performance.now()
    // Pause audio directly — no React state involved
    const audio = audioRef?.current
    wasAudioPlayingRef.current = !!audio && !audio.paused
    if (audio && !audio.paused) audio.pause()
    loadScratchBuffer().then(() => startScratchSound())
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isScratching.current) return
      const angle = getAngle(e.clientX, e.clientY)
      let delta = angle - lastAngle.current
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360
      const now = performance.now()
      const dt = now - lastScratchTime.current
      const velocity = dt > 0 ? Math.abs(delta) / dt : 0
      setScratchIntensity(velocity)
      if (stopFadeRef.current) clearTimeout(stopFadeRef.current)
      stopFadeRef.current = setTimeout(fadeScratchOut, 80)
      rotation.set(rotation.get() + delta)
      lastAngle.current = angle
      lastScratchTime.current = now
    }

    const onMouseUp = () => {
      if (!isScratching.current) return
      isScratching.current = false
      setIsGrabbing(false)
      if (stopFadeRef.current) clearTimeout(stopFadeRef.current)
      fadeScratchOut()
      // Resume audio directly if it was playing before scratch
      if (wasAudioPlayingRef.current) {
        audioRef?.current?.play().catch(() => {})
        wasAudioPlayingRef.current = false
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [rotation])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square select-none"
      style={{ cursor: isGrabbing ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
    >
      {/* Spinning vinyl */}
      <motion.div className="w-full h-full" style={{ rotate: rotation }}>
        <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
          <defs>
            <clipPath id={`label-clip-${song.id}`}>
              <circle cx="200" cy="200" r="56" />
            </clipPath>
            <radialGradient id={`sheen-${song.id}`} cx="38%" cy="35%" r="55%">
              <stop offset="0%" stopColor="white" stopOpacity="0.05" />
              <stop offset="60%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`edge-${song.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="88%" stopColor="transparent" />
              <stop offset="95%" stopColor="#2a2a2a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          <circle cx="200" cy="200" r="198" fill="#0c0c0c" />
          {Array.from({ length: GROOVE_COUNT }, (_, i) => {
            const r = 62 + i * 1.9
            return (
              <circle key={i} cx="200" cy="200" r={r} fill="none"
                stroke={i % 4 === 0 ? '#222' : '#181818'} strokeWidth="0.7"
                opacity={0.5 - i * 0.002} />
            )
          })}
          <circle cx="200" cy="200" r="198" fill={`url(#sheen-${song.id})`} />
          <circle cx="200" cy="200" r="198" fill={`url(#edge-${song.id})`} />
          <circle cx="200" cy="200" r="58" fill={song.coverColor} />
          <circle cx="200" cy="200" r="56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="200" cy="200" r="48" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <circle cx="200" cy="200" r="52" fill="none" stroke={song.coverAccent} strokeWidth="1.5" opacity="0.35" />
          <text x="200" y="193" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="7.5" fontFamily="Georgia, serif" letterSpacing="0.5">{song.title}</text>
          <text x="200" y="205" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5.5" fontFamily="Arial, sans-serif" letterSpacing="1">{song.artist.toUpperCase()}</text>
          <text x="200" y="216" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="5" fontFamily="Arial, sans-serif">{song.year}</text>
          <circle cx="200" cy="200" r="4.5" fill="#07070f" />
          <circle cx="200" cy="200" r="4.5" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        </svg>
      </motion.div>

      {isPlaying && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: `0 0 40px 4px ${song.coverAccent}18, 0 0 80px 8px ${song.coverAccent}08` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
