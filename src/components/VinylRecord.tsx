'use client'

import { motion } from 'framer-motion'
import AlbumCover from './AlbumCover'
import type { Song } from '@/types'

interface VinylRecordProps {
  song: Song
  isActive: boolean
  isDimmed: boolean
  onSelect: (song: Song) => void
}

export default function VinylRecord({ song, isActive, isDimmed, onSelect }: VinylRecordProps) {
  if (isActive) {
    // Ghost placeholder — holds layout space on the shelf
    return (
      <div className="flex flex-col items-center gap-3 opacity-0 pointer-events-none" aria-hidden="true">
        <div className="w-[clamp(100px,14vw,160px)] aspect-square" />
        <div className="h-8 w-28" />
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-3 cursor-pointer group"
      layoutId={`record-${song.id}`}
      animate={{ opacity: isDimmed ? 0.25 : 1 }}
      whileHover={!isDimmed ? { y: -14, scale: 1.02 } : {}}
      whileTap={!isDimmed ? { scale: 0.98 } : {}}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => !isDimmed && onSelect(song)}
      role="button"
      aria-label={`Select ${song.title} by ${song.artist}`}
      tabIndex={isDimmed ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(song)
      }}
    >
      {/* Sleeve */}
      <div className="relative w-[clamp(100px,14vw,160px)] aspect-square shadow-2xl">
        <AlbumCover song={song} />

        {/* Hover glow underneath */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-4 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${song.coverAccent}50 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Vinyl peeking from top right — physical detail */}
        <div
          className="absolute -top-1 -right-1 w-5 h-[97%] rounded-r-sm pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #111, #0c0c0c)',
            boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)',
          }}
        />
      </div>

      {/* Label */}
      <div className="text-center space-y-1">
        <p
          className="text-[9px] tracking-[0.25em] uppercase font-grotesk"
          style={{ color: `${song.coverAccent}90` }}
        >
          {song.emotion}
        </p>
        <p className="text-[11px] font-serif text-cream/70 leading-tight max-w-[140px] truncate">
          {song.title}
        </p>
      </div>
    </motion.div>
  )
}
