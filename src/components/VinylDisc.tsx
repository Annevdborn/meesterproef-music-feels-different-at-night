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
  const [isHovering, setIsHovering] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null)
  const scratchBufferRef = useRef<AudioBuffer | null>(null)
  const scratchSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const scratchGainRef = useRef<GainNode | null>(null)
  const stopFadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = isHovering && !isGrabbing ? '1' : '0'
    }
  }, [isGrabbing, isHovering])

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
      onMouseEnter={() => {
        setIsHovering(true)
        if (tooltipRef.current) tooltipRef.current.style.opacity = '1'
      }}
      onMouseLeave={() => {
        setIsHovering(false)
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0'
      }}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect && tooltipRef.current) {
          tooltipRef.current.style.left = `${e.clientX - rect.left + 14}px`
          tooltipRef.current.style.top = `${e.clientY - rect.top - 10}px`
        }
      }}
    >
      {/* Scratch tooltip — follows cursor, position updated via DOM to avoid re-renders */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10"
        style={{ opacity: 0, transition: 'opacity 0.2s ease-out', left: 0, top: 0 }}
      >
        <span
          className="font-sans text-[9px] tracking-[0.28em] uppercase whitespace-nowrap"
          style={{ color: song.cursorHintColor ?? `${song.coverAccent}80` }}
        >
          try scratching
        </span>
      </div>

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

          <circle cx="200" cy="200" r="198" fill={
            song.id === 1 ? '#f5c400' :
            song.id === 2 ? '#0a1208' :
            song.id === 3 ? '#0e0604' :
            song.id === 4 ? '#060d14' :
            song.id === 5 ? '#100202' :
            '#0c0c0c'
          } />

          {/* Tie-dye yellow vinyl for Pocket Full of Sunshine */}
          {song.id === 1 && (
            <>
              <defs>
                {/* Cream/white tie-dye layer */}
                <filter id={`tiedye-a-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.014 0.014" numOctaves="5" seed="4" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.82  0 0 6 -2.8 0"
                    result="cream" />
                  <feComposite in="cream" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Deep yellow layer */}
                <filter id={`tiedye-b-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.02 0.008" numOctaves="4" seed="9" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.82  0 0 0 0 0.68  0 0 0 0 0  0 0 5 -2.5 0"
                    result="deep" />
                  <feComposite in="deep" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Light yellow layer */}
                <filter id={`tiedye-c-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.01 0.018" numOctaves="3" seed="15" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 1  0 0 0 0 0.96  0 0 0 0 0.55  0 0 7 -3.2 0"
                    result="light" />
                  <feComposite in="light" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <circle cx="200" cy="200" r="198" fill="rgba(255,248,180,0.72)" filter={`url(#tiedye-c-${song.id})`} />
              <circle cx="200" cy="200" r="198" fill="rgba(210,165,0,0.65)" filter={`url(#tiedye-b-${song.id})`} />
              <circle cx="200" cy="200" r="198" fill="rgba(255,253,220,0.75)" filter={`url(#tiedye-a-${song.id})`} />
            </>
          )}

          {/* Splatter vinyl for Willing and Able */}
          {song.id === 2 && <>
            <circle cx="200" cy="200" r="198" fill={`${song.coverAccent}22`} />
            <ellipse cx="148" cy="130" rx="28" ry="18" fill={`${song.coverAccent}30`} transform="rotate(-25 148 130)" />
            <ellipse cx="260" cy="155" rx="18" ry="32" fill={`${song.coverAccent}28`} transform="rotate(15 260 155)" />
            <ellipse cx="310" cy="240" rx="22" ry="14" fill={`${song.coverAccent}25`} transform="rotate(40 310 240)" />
            <ellipse cx="130" cy="280" rx="14" ry="24" fill={`${song.coverAccent}28`} transform="rotate(-10 130 280)" />
            <ellipse cx="210" cy="320" rx="30" ry="12" fill={`${song.coverAccent}22`} transform="rotate(5 210 320)" />
            <ellipse cx="80" cy="190" rx="12" ry="20" fill={`${song.coverAccent}20`} transform="rotate(30 80 190)" />
            <circle cx="170" cy="95" r="8" fill={`${song.coverAccent}35`} />
            <circle cx="290" cy="110" r="5" fill={`${song.coverAccent}40`} />
            <circle cx="340" cy="200" r="7" fill={`${song.coverAccent}30`} />
            <circle cx="105" cy="330" r="6" fill={`${song.coverAccent}35`} />
            <circle cx="250" cy="355" r="9" fill={`${song.coverAccent}28`} />
            <circle cx="60" cy="240" r="5" fill={`${song.coverAccent}38`} />
            <circle cx="195" cy="60" r="4" fill={`${song.coverAccent}32`} />
            <ellipse cx="330" cy="300" rx="10" ry="6" fill={`${song.coverAccent}25`} transform="rotate(60 330 300)" />
          </>}

          {/* Deep sea vinyl for For Keeps */}
          {song.id === 4 && (
            <>
              <defs>
                <radialGradient id={`sea-base-${song.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0d1e30" stopOpacity="1" />
                  <stop offset="60%" stopColor="#070f1a" stopOpacity="1" />
                  <stop offset="100%" stopColor="#020609" stopOpacity="1" />
                </radialGradient>
                {/* Barely-there depth currents */}
                <filter id={`sea-current-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.006 0.009" numOctaves="6" seed="22" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.18  0 0 0 0 0.32  0 0 0 0 0.5  0 0 4 -2.0 0"
                    result="c" />
                  <feComposite in="c" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Single cold light — like light filtering from far above */}
                <filter id={`sea-light-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.011 0.005" numOctaves="3" seed="41" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.4  0 0 0 0 0.55  0 0 0 0 0.72  0 0 8 -6.2 0"
                    result="l" />
                  <feComposite in="l" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <circle cx="200" cy="200" r="198" fill={`url(#sea-base-${song.id})`} />
              <circle cx="200" cy="200" r="198" fill="rgba(30,60,100,0.6)" filter={`url(#sea-current-${song.id})`} />
              <circle cx="200" cy="200" r="198" fill="rgba(104,136,164,0.35)" filter={`url(#sea-light-${song.id})`} />
            </>
          )}

          {/* Techno splatter vinyl for Amore Dulce */}
          {song.id === 3 && (
            <>
              <defs>
                {/* Fine particles — high frequency speckle */}
                <filter id={`techno-speck-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.075 0.075" numOctaves="1" seed="6" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.72  0 0 0 0 0.33  0 0 0 0 0.08  0 0 14 -9 0"
                    result="s" />
                  <feComposite in="s" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Larger blobs — aggressive mid-frequency */}
                <filter id={`techno-blob-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.038 0.028" numOctaves="2" seed="2" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.85  0 0 0 0 0.4  0 0 0 0 0.1  0 0 11 -7.5 0"
                    result="b" />
                  <feComposite in="b" in2="SourceGraphic" operator="in" />
                </filter>
                {/* Haze layer — dark rust wash */}
                <filter id={`techno-haze-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.012 0.02" numOctaves="3" seed="14" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.6  0 0 0 0 0.22  0 0 0 0 0.04  0 0 4 -1.8 0"
                    result="h" />
                  <feComposite in="h" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              {/* Dark rust haze base */}
              <circle cx="200" cy="200" r="198" fill={`${song.coverAccent}40`} filter={`url(#techno-haze-${song.id})`} />
              {/* Mid blobs */}
              <circle cx="200" cy="200" r="198" fill={`${song.coverAccent}cc`} filter={`url(#techno-blob-${song.id})`} />
              {/* Fine specks on top */}
              <circle cx="200" cy="200" r="198" fill={`${song.coverAccent}ff`} filter={`url(#techno-speck-${song.id})`} />
            </>
          )}

          {/* Deep red vinyl for Earth Song */}
          {song.id === 5 && (
            <>
              <defs>
                <radialGradient id={`earth-grad-${song.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#5c0a0a" stopOpacity="1" />
                  <stop offset="45%" stopColor="#8c2010" stopOpacity="1" />
                  <stop offset="80%" stopColor="#4a0808" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1a0202" stopOpacity="1" />
                </radialGradient>
                {/* Subtle smoke — barely there, just enough depth */}
                <filter id={`earth-smoke-${song.id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                  <feTurbulence type="turbulence" baseFrequency="0.009 0.013" numOctaves="4" seed="17" result="t" />
                  <feColorMatrix type="matrix" in="t"
                    values="0 0 0 0 0.6  0 0 0 0 0.04  0 0 0 0 0.04  0 0 3.5 -1.8 0"
                    result="s" />
                  <feComposite in="s" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <circle cx="200" cy="200" r="198" fill={`url(#earth-grad-${song.id})`} />
              <circle cx="200" cy="200" r="198" fill="rgba(160,20,10,0.45)" filter={`url(#earth-smoke-${song.id})`} />
            </>
          )}

          {Array.from({ length: GROOVE_COUNT }, (_, i) => {
            const r = 62 + i * 1.9
            return (
              <circle key={i} cx="200" cy="200" r={r} fill="none"
                stroke={
                  song.id === 1 ? (i % 4 === 0 ? 'rgba(120,70,0,0.4)' : 'rgba(100,55,0,0.22)') :
                  song.id === 5 ? (i % 4 === 0 ? 'rgba(80,0,0,0.45)' : 'rgba(60,0,0,0.25)') :
                  (i % 4 === 0 ? '#222' : '#181818')
                } strokeWidth="0.7"
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
