'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion, useInView } from 'framer-motion'
import VinylDisc from './VinylDisc'
import { songs } from '@/data/songs'
import type { Song, RPM } from '@/types'

interface RecordShelfProps {
  onOpenSleeve: (song: Song) => void
}

interface SongRowProps {
  song: Song
  index: number
  isPlaying: boolean
  onPlay: (id: number | null) => void
  onOpenSleeve: (s: Song) => void
}

const SongRow = memo(function SongRow({ song, index, isPlaying, onPlay, onOpenSleeve }: SongRowProps) {
  const [rpm, setRpm] = useState<RPM>(33)
  const [isFavorite, setIsFavorite] = useState(false)
  const [armOnRecord, setArmOnRecord] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const armTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const vinylOnRight = index % 2 === 0
  // armOnRight mirrors vinylOnRight: arm is always on the visible-edge side
  const armOnRight = !vinylOnRight

  const getAudio = () => {
    if (!song.audioSrc) return null
    if (!audioRef.current) {
      audioRef.current = new Audio(song.audioSrc)
      audioRef.current.addEventListener('ended', () => { onPlay(null) })
    }
    return audioRef.current
  }

  // Timing:
  // 1. Play clicked → disc spins immediately
  // 2. After 300ms → arm starts swinging onto disc (1.1s animation)
  // 3. After ~1.4s total → audio plays (needle has landed)
  useEffect(() => {
    if (isPlaying) {
      setIsSpinning(true)
      armTimerRef.current = setTimeout(() => setArmOnRecord(true), 300)
      audioTimerRef.current = setTimeout(() => {
        const audio = getAudio()
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
      }, 1400)
    } else {
      clearTimeout(armTimerRef.current ?? undefined)
      clearTimeout(audioTimerRef.current ?? undefined)
      clearTimeout(favoriteEndTimerRef.current ?? undefined)
      audioRef.current?.pause()
      setIsSpinning(false)
      setArmOnRecord(false)
      setIsFavorite(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  const handlePlayStop = () => {
    if (isPlaying) {
      onPlay(null)
    } else {
      onPlay(song.id)
    }
  }

  const favoriteEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFavoritePart = () => {
    const audio = getAudio()
    if (!audio) return
    if (favoriteEndTimerRef.current) clearTimeout(favoriteEndTimerRef.current)
    audio.currentTime = song.favoriteStart
    audio.play().catch(() => {})
    setIsFavorite(true)
    if (!isPlaying) onPlay(song.id)
    if (song.favoriteEnd !== undefined) {
      const ms = (song.favoriteEnd - song.favoriteStart) * 1000
      favoriteEndTimerRef.current = setTimeout(() => {
        audio.pause()
        onPlay(null)
      }, ms)
    }
  }

  // Arm geometry
  // Pivot is in the upper corner, outside the disc circle (dist ~267 from center vs r=198).
  // restAngle 54° keeps the FULL arm visible at rest — needle ends up at ~(399, 129)
  // which is 211 from disc center (outside disc) and still inside the SVG viewport.
  // This means the arm is always fully visible resting on its post, and only rotates on play.
  const apx = armOnRight ? 380 : 20
  const apy = 10
  const anx = armOnRight ? 295 : 105
  const any = 95
  const aArmLen = Math.hypot(anx - apx, any - apy)
  const aax = (anx - apx) / aArmLen
  const aay = (any - apy) / aArmLen
  const acx2 = -aax
  const acy2 = -aay
  const aCwLen = 30
  const aCwX = apx + acx2 * aCwLen
  const aCwY = apy + acy2 * aCwLen
  const aPerpX = aay
  const aPerpY = -aax
  const aPSign = armOnRight ? 1 : -1
  const aHs1X = anx - aPSign * aPerpX * 10
  const aHs1Y = any - aPSign * aPerpY * 10
  const aHs2X = anx + aPSign * aPerpX * 10
  const aHs2Y = any + aPSign * aPerpY * 10
  const aRestAngle = -54
  const aGradId = `arm-${song.id}-${armOnRight ? 'r' : 'l'}`

  return (
    <div className="relative">
      {/* Glow — outside overflow-hidden */}
      <div
        className={`absolute pointer-events-none rounded-full ${vinylOnRight ? 'right-0' : 'left-0'}`}
        style={{
          top: '50%',
          width: 'min(82vh, 78vw)',
          height: 'min(82vh, 78vw)',
          transform: `translateY(-50%) translateX(${vinylOnRight ? '42%' : '-42%'})`,
          zIndex: 0,
          borderRadius: '50%',
          boxShadow: `0 0 70px 30px ${song.coverAccent}55, 0 0 140px 80px ${song.coverAccent}28, 0 0 220px 120px ${song.coverAccent}12`,
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.9s ease-in-out',
          willChange: 'opacity',
        }}
      />

      {/* Tonearm — outside overflow-hidden so it never gets rectangle-clipped */}
      <div
        className={`absolute pointer-events-none ${vinylOnRight ? 'right-0' : 'left-0'}`}
        style={{
          top: '50%',
          width: 'min(82vh, 78vw)',
          height: 'min(82vh, 78vw)',
          transform: `translateY(-50%) translateX(${vinylOnRight ? '42%' : '-42%'})`,
          zIndex: 3,
        }}
      >
        <svg
          viewBox="0 0 400 400"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={aGradId} gradientUnits="userSpaceOnUse"
              x1={apx} y1={apy} x2={anx} y2={any}>
              <stop offset="0%"   stopColor="#4a4a4a" />
              <stop offset="25%"  stopColor="#9a9a9a" />
              <stop offset="50%"  stopColor="#c8c8c8" />
              <stop offset="75%"  stopColor="#8a8a8a" />
              <stop offset="100%" stopColor="#5a5a5a" />
            </linearGradient>
            <linearGradient id={`${aGradId}-cw`} gradientUnits="userSpaceOnUse"
              x1={apx} y1={apy} x2={aCwX} y2={aCwY}>
              <stop offset="0%"   stopColor="#3a3a3a" />
              <stop offset="40%"  stopColor="#6a6a6a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
          </defs>

          <motion.g
            style={{ transformOrigin: `${apx}px ${apy}px` }}
            initial={{ rotate: aRestAngle }}
            animate={{ rotate: armOnRecord ? 0 : aRestAngle }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Counterweight */}
            <line x1={apx} y1={apy} x2={aCwX} y2={aCwY}
              stroke={`url(#${aGradId}-cw)`} strokeWidth="16" strokeLinecap="round" />
            <line x1={apx + acx2 * 8} y1={apy + acy2 * 8}
                  x2={apx + acx2 * 28} y2={apy + acy2 * 28}
              stroke="#555" strokeWidth="10" strokeLinecap="round" />
            <line x1={apx + acx2 * 10} y1={apy + acy2 * 10}
                  x2={apx + acx2 * 26} y2={apy + acy2 * 26}
              stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />

            {/* Arm body shadow */}
            <line x1={apx} y1={apy} x2={anx} y2={any}
              stroke="rgba(0,0,0,0.5)" strokeWidth="8" strokeLinecap="round"
              transform={`translate(${aax},${aay})`} />
            {/* Arm body — metallic gradient */}
            <line x1={apx} y1={apy} x2={anx} y2={any}
              stroke={`url(#${aGradId})`} strokeWidth="5" strokeLinecap="round" />
            {/* Specular highlight stripe */}
            <line x1={apx + aPerpX * 0.5} y1={apy + aPerpY * 0.5}
                  x2={anx + aPerpX * 0.5} y2={any + aPerpY * 0.5}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Headshell bracket */}
            <line x1={aHs1X} y1={aHs1Y} x2={aHs2X} y2={aHs2Y}
              stroke="#7a7a7a" strokeWidth="5" strokeLinecap="round" />
            <line x1={aHs1X} y1={aHs1Y} x2={aHs2X} y2={aHs2Y}
              stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cartridge */}
            <rect x={anx - 5} y={any - 4} width="10" height="8" rx="2"
              fill="#222" stroke="#666" strokeWidth="0.8" />

            {/* Stylus */}
            <line x1={anx} y1={any + 4} x2={anx} y2={any + 14}
              stroke="#aaa" strokeWidth="1" strokeLinecap="round" />
            <circle cx={anx} cy={any + 15} r="1.8" fill="#e8e8e8" opacity="0.95" />
          </motion.g>

        </svg>
      </div>

      <motion.div
        ref={ref}
        className="relative overflow-hidden"
        style={{ minHeight: '86vh', zIndex: 1 }}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* Text side */}
        <div
          className={`absolute inset-y-0 flex flex-col justify-center py-16 ${
            vinylOnRight
              ? 'left-0 right-[40%] pl-8 md:pl-16 lg:pl-24 pr-6'
              : 'right-0 left-[40%] pr-8 md:pr-16 lg:pr-24 pl-6'
          }`}
        >
          <p
            className="font-sans text-[9px] tracking-[0.35em] uppercase mb-3"
            style={{ color: `${song.coverAccent}90` }}
          >
            {song.emotion} — {song.year}
          </p>

          <h3 className="font-serif text-[clamp(1.4rem,2.8vw,2.4rem)] text-cream leading-tight mb-2">
            {song.title}
          </h3>

          <p className="font-sans text-[12px] text-cream-dim mb-5">{song.artist}</p>

          <div className="h-px w-8 mb-5" style={{ background: `${song.coverAccent}50` }} />

          <p className="font-serif text-[15px] md:text-[17px] leading-[1.75] text-cream-muted mb-8 whitespace-pre-line">
            {song.story.split('. ').slice(0, 2).join('. ') + '.'}
          </p>

          <motion.button
            onClick={() => onOpenSleeve(song)}
            className="self-start font-sans text-[10px] tracking-[0.3em] uppercase text-cream-dim hover:text-cream transition-colors duration-300 pb-1"
            style={{ borderBottom: '1px solid currentColor' }}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            Read more
          </motion.button>
        </div>

        {/* Vinyl disc — half clipped by overflow-hidden */}
        <div
          className={`absolute ${vinylOnRight ? 'right-0' : 'left-0'}`}
          style={{
            top: '50%',
            width: 'min(82vh, 78vw)',
            height: 'min(82vh, 78vw)',
            transform: `translateY(-50%) translateX(${vinylOnRight ? '42%' : '-42%'})`,
            zIndex: 2,
          }}
        >
          <VinylDisc song={song} isPlaying={isPlaying} isSpinning={isSpinning} rpm={rpm} audioRef={audioRef} />
        </div>

        {/* Controls */}
        <div
          className={`absolute bottom-8 flex items-center gap-2 ${
            vinylOnRight ? 'right-[36%]' : 'left-[36%]'
          }`}
        >
          <motion.button
            onClick={handlePlayStop}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] transition-colors"
            style={{
              border: `1px solid ${song.coverAccent}50`,
              color: isPlaying ? song.coverAccent : 'rgba(255,255,255,0.35)',
              background: isPlaying ? `${song.coverAccent}10` : 'transparent',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            {isPlaying ? '■' : '▶'}
          </motion.button>

          {([33, 45] as RPM[]).map(r => (
            <motion.button
              key={r}
              onClick={() => setRpm(r)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-sans text-[11px] transition-colors"
              style={{
                border: `1px solid ${song.coverAccent}50`,
                color: rpm === r ? song.coverAccent : 'rgba(255,255,255,0.35)',
                background: rpm === r ? `${song.coverAccent}12` : 'transparent',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
            >
              {r}
            </motion.button>
          ))}

          <div className="w-px h-5 mx-2" style={{ background: `${song.coverAccent}25` }} />

          <div className="relative">
            <motion.button
              onClick={handleFavoritePart}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] transition-colors"
              style={{
                border: `1px solid ${song.coverAccent}50`,
                color: isFavorite && isPlaying ? song.coverAccent : 'rgba(255,255,255,0.35)',
                background: isFavorite && isPlaying ? `${song.coverAccent}10` : 'transparent',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
            >
              ♥
            </motion.button>
            <span
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 font-sans text-[9px] tracking-[0.2em] uppercase whitespace-nowrap"
              style={{ color: `${song.coverAccent}70` }}
            >
              my part
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

export default function RecordShelf({ onOpenSleeve }: RecordShelfProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [activeSongId, setActiveSongId] = useState<number | null>(null)

  const handlePlay = useCallback((id: number | null) => setActiveSongId(id), [])
  const handleOpenSleeve = useCallback((song: Song) => onOpenSleeve(song), [onOpenSleeve])

  return (
    <div ref={ref} className="w-full">
      <div className="mb-10 px-8 md:px-16 lg:px-24">
        <motion.p
          className="font-sans text-[11px] tracking-[0.35em] uppercase text-amber-muted mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          5 songs · five feelings
        </motion.p>

        <motion.h2
          className="font-serif leading-[0.9] tracking-tight overflow-hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="block text-[clamp(1.6rem,4vw,3.2rem)] text-cream/60"
            initial={{ y: 40, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            My
          </motion.span>
          <motion.span
            className="block text-[clamp(3.5rem,10vw,9rem)] text-cream"
            initial={{ y: 60, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Collection
          </motion.span>
        </motion.h2>

        <motion.div
          className="mt-5 h-px w-16"
          style={{ background: 'linear-gradient(to right, rgba(200,169,110,0.5), transparent)' }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div>
        {songs.map((song, i) => (
          <SongRow
            key={song.id}
            song={song}
            index={i}
            isPlaying={activeSongId === song.id}
            onPlay={handlePlay}
            onOpenSleeve={handleOpenSleeve}
          />
        ))}
      </div>
    </div>
  )
}
