'use client'

import type { Song } from '@/types'

interface AlbumCoverProps {
  song: Song
  className?: string
  fill?: boolean
}

export default function AlbumCover({ song, className = '', fill = false }: AlbumCoverProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${fill ? 'h-full' : 'aspect-square'} ${className}`}
      style={{
        background: `linear-gradient(145deg, ${song.coverColor} 0%, color-mix(in srgb, ${song.coverColor} 40%, #000) 100%)`,
      }}
    >
      {/* Real cover image — shown when provided */}
      {song.coverImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={song.coverImage}
            alt={`${song.title} by ${song.artist}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'saturate(0.8) brightness(0.85)' }}
          />
          {/* Subtle dark vignette to blend into the site */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(4,4,12,0.55) 100%)',
            }}
          />
          {/* Thin color tint from the song accent */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `${song.coverColor}30`, mixBlendMode: 'multiply' }}
          />
        </>
      )}

      {/* Placeholder design — shown when no image */}
      {!song.coverImage && (
        <>
          {/* Inner ring motif */}
          <div
            className="absolute inset-4 rounded-full"
            style={{ border: `1px solid ${song.coverAccent}30` }}
          />
          <div
            className="absolute inset-8 rounded-full"
            style={{ border: `1px solid ${song.coverAccent}20` }}
          />
          <div
            className="absolute inset-12 rounded-full"
            style={{ border: `1px solid ${song.coverAccent}15` }}
          />

          {/* Accent glow */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 60% at 30% 70%, ${song.coverAccent}20 0%, transparent 70%)`,
            }}
          />

          {/* Text overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <span
              className="block text-[9px] tracking-[0.25em] uppercase mb-1 font-grotesk"
              style={{ color: `${song.coverAccent}90` }}
            >
              {song.emotion}
            </span>
            <span
              className="block font-serif text-sm leading-tight"
              style={{ color: 'rgba(240, 230, 211, 0.8)' }}
            >
              {song.title}
            </span>
          </div>
        </>
      )}

      {/* Subtle dust/texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)',
        }}
      />
    </div>
  )
}
