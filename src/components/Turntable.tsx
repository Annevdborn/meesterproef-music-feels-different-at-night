'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VinylDisc from './VinylDisc'
import ToneArm from './ToneArm'
import { useAudio } from '@/hooks/useAudio'
import type { Song, RPM } from '@/types'

interface TurntableProps {
  song: Song
  onOpenSleeve: () => void
  onClose: () => void
}

export default function Turntable({ song, onOpenSleeve, onClose }: TurntableProps) {
  const [rpm, setRpm] = useState<RPM>(33)
  const [armDescending, setArmDescending] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const { isPlaying, play, pause, stop, toggle, audioRef, setPlaybackRate } = useAudio(song.audioSrc)
  const descentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset state when song changes or on unmount
  useEffect(() => {
    return () => {
      if (descentTimer.current) clearTimeout(descentTimer.current)
      stop()
      setArmDescending(false)
      setIsReady(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id])

  const handlePlay = () => {
    if (armDescending && !isReady) return // still descending, ignore

    if (!armDescending && !isReady) {
      // Start descent; audio begins when needle lands
      setArmDescending(true)
      descentTimer.current = setTimeout(() => {
        setIsReady(true)
        play()
      }, 2200)
      return
    }

    // Already landed → normal toggle
    toggle()
  }

  const handleClose = () => {
    if (descentTimer.current) clearTimeout(descentTimer.current)
    stop()
    onClose()
  }

  const showSpinner = armDescending && !isReady

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back button */}
      <button
        onClick={handleClose}
        className="flex items-center gap-2 mb-8 font-grotesk text-[11px] tracking-[0.25em] uppercase text-cream-dim hover:text-amber-glow transition-colors duration-300 group"
        aria-label="Return to record collection"
      >
        <motion.span
          className="inline-block"
          animate={{ x: 0 }}
          whileHover={{ x: -3 }}
        >
          ←
        </motion.span>
        <span>Back to collection</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        {/* LEFT — Turntable platter */}
        <div className="relative w-full lg:w-[55%] max-w-[480px] mx-auto lg:mx-0 shrink-0">
          <div
            className="relative aspect-square rounded-lg overflow-hidden p-[6%]"
            style={{
              background: 'linear-gradient(145deg, #141420 0%, #0d0d18 60%, #0a0a14 100%)',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="relative w-full aspect-square">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #1a1a28 0%, #111118 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
                }}
              />
              <div className="absolute inset-0 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.03)' }} />
              <div className="absolute inset-[4%] rounded-full" style={{ border: '1px solid rgba(255,255,255,0.02)' }} />

              <motion.div
                layoutId={`record-${song.id}`}
                className="absolute inset-[6%] rounded-full overflow-hidden"
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <VinylDisc song={song} isPlaying={isPlaying && isReady} isSpinning={isPlaying && isReady} rpm={rpm} audioRef={audioRef} />
              </motion.div>
            </div>

            <ToneArm isPlaying={isPlaying && isReady} isDescending={armDescending} />

            <div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)' }}
            />
          </div>

          <div className="flex justify-between mt-2 px-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-3 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        </div>

        {/* RIGHT — Controls & info */}
        <div className="flex flex-col gap-8 flex-1 lg:pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-grotesk text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: `${song.coverAccent}aa` }}>
                {song.emotion} — {song.year}
              </p>
              <h2 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.1] text-cream mb-2">
                {song.title}
              </h2>
              <p className="font-grotesk text-[13px] text-cream-muted uppercase tracking-widest">{song.artist}</p>
            </motion.div>
          </AnimatePresence>

          <div className="h-px w-full bg-white/5" />

          {/* Playback controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={!showSpinner ? handlePlay : undefined}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                !showSpinner ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-wait opacity-50'
              }`}
              style={{
                background: isPlaying ? `${song.coverAccent}22` : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isPlaying ? `${song.coverAccent}50` : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isPlaying ? `0 0 20px ${song.coverAccent}20` : 'none',
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {showSpinner ? (
                <motion.div
                  className="w-3 h-3 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${song.coverAccent}60`, borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2" y="1" width="3.5" height="12" rx="1.5" fill={song.coverAccent} />
                  <rect x="8.5" y="1" width="3.5" height="12" rx="1.5" fill={song.coverAccent} />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <polygon points="3,1 13,7 3,13" fill={song.coverAccent} />
                </svg>
              )}
            </button>

            {/* RPM toggle */}
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              role="radiogroup"
              aria-label="RPM selection"
            >
              {([33, 45] as RPM[]).map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setRpm(speed)
                    setPlaybackRate(speed === 45 ? 1.8 : 1)
                  }}
                  className={`px-4 py-2 font-grotesk text-[11px] tracking-widest transition-all duration-300 ${
                    rpm === speed ? 'text-night-900' : 'text-cream-dim hover:text-cream-muted'
                  }`}
                  style={{ background: rpm === speed ? song.coverAccent : 'transparent' }}
                  role="radio"
                  aria-checked={rpm === speed}
                  aria-label={`${speed} RPM`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Playback status */}
          <div className="flex items-center gap-2 h-4">
            {isPlaying && (
              <motion.div
                className="flex items-end gap-[3px] h-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full"
                    style={{ background: song.coverAccent, opacity: 0.7 }}
                    animate={{ height: ['4px', `${8 + i * 3}px`, '4px'] }}
                    transition={{ duration: 0.6 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
                  />
                ))}
              </motion.div>
            )}
            <span className="font-grotesk text-[10px] text-cream-dim">
              {showSpinner ? 'Placing needle…' : isPlaying ? 'Now playing' : 'Paused'}
            </span>
          </div>

          {/* Open sleeve CTA */}
          <motion.button
            onClick={onOpenSleeve}
            className="mt-2 flex items-center gap-3 group w-fit"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.25 }}
            aria-label="Open album sleeve"
          >
            <div
              className="h-px flex-1 w-8 group-hover:w-12 transition-all duration-300"
              style={{ background: `${song.coverAccent}50` }}
            />
            <span className="font-grotesk text-[11px] tracking-[0.25em] uppercase" style={{ color: `${song.coverAccent}cc` }}>
              Open the sleeve
            </span>
            <span style={{ color: `${song.coverAccent}80` }}>→</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
