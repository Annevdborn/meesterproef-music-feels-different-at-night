'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AlbumCover from './AlbumCover'
import type { Song } from '@/types'

interface AlbumSleeveProps {
  song: Song
  isOpen: boolean
  onClose: () => void
}


export default function AlbumSleeve({ song, isOpen, onClose }: AlbumSleeveProps) {
  const [page, setPage] = useState<0 | 1>(0)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)

  useEffect(() => {
    if (isOpen) setPage(0)
  }, [isOpen, song.id])


  const lyricsStanzas = song.lyrics.split('\n\n').filter(Boolean)

  const goNext = () => { setSlideDir(1); setPage(1) }
  const goPrev = () => { setSlideDir(-1); setPage(0) }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(4,4,12,0.92)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sleeve container */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          >
            <div className="relative flex flex-col md:flex-row w-full max-w-5xl h-[88vh] shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-10 right-0 font-grotesk text-[10px] tracking-[0.3em] uppercase text-cream-dim hover:text-cream transition-colors duration-300 z-10"
                aria-label="Close"
              >
                Close ✕
              </button>

              {/* LEFT — Album cover */}
              <motion.div
                className="shrink-0 w-full h-56 md:h-full md:aspect-square md:max-w-[48%]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <AlbumCover song={song} fill />
              </motion.div>

              {/* RIGHT — Content panel */}
              <div className="flex-1 overflow-hidden" style={{ perspective: '1400px' }}>
                <motion.div
                  className="h-full w-full flex flex-col"
                  style={{
                    transformOrigin: 'left center',
                    background: 'linear-gradient(160deg, #0f0f1c 0%, #0a0a14 100%)',
                    borderLeft: '1px solid rgba(255,255,255,0.04)',
                  }}
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                  {/* Header */}
                  <div className="px-8 md:px-10 pt-8 md:pt-10 shrink-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <p
                        className="font-grotesk text-[9px] tracking-[0.35em] uppercase mb-4"
                        style={{ color: `${song.coverAccent}90` }}
                      >
                        for me this is {song.emotion} · {song.year}
                      </p>
                      <h3 className="font-serif text-[clamp(1.2rem,2.5vw,1.8rem)] text-cream leading-tight mb-1">
                        {song.title}
                      </h3>
                      <p className="font-grotesk text-[12px] text-cream-dim mb-6 uppercase tracking-widest">{song.artist}</p>
                      <div
                        className="h-px w-10 mb-6"
                        style={{ background: `${song.coverAccent}50` }}
                      />
                    </motion.div>

                    {/* Page tabs */}
                    <motion.div
                      className="flex gap-6 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <button
                        onClick={() => { setSlideDir(-1); setPage(0) }}
                        className="font-grotesk text-[9px] tracking-[0.25em] uppercase pb-1 transition-colors duration-300"
                        style={{
                          color: page === 0 ? song.coverAccent : 'rgba(255,255,255,0.3)',
                          borderBottom: `1px solid ${page === 0 ? song.coverAccent : 'transparent'}`,
                        }}
                      >
                        My Story
                      </button>
                      <button
                        onClick={() => { setSlideDir(1); setPage(1) }}
                        className="font-grotesk text-[9px] tracking-[0.25em] uppercase pb-1 transition-colors duration-300"
                        style={{
                          color: page === 1 ? song.coverAccent : 'rgba(255,255,255,0.3)',
                          borderBottom: `1px solid ${page === 1 ? song.coverAccent : 'transparent'}`,
                        }}
                      >
                        Lyrics
                      </button>
                    </motion.div>
                  </div>

                  {/* Scrollable content area with page animation */}
                  <div className="flex-1 overflow-hidden relative">
                    <AnimatePresence mode="wait" custom={slideDir}>
                      {page === 0 ? (
                        <motion.div
                          key="story"
                          className="absolute inset-0 overflow-y-auto px-8 md:px-10 pb-8"
                          custom={slideDir}
                          initial={{ opacity: 0, x: slideDir * 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: slideDir * -40 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >

                          {song.artistMeaning && (
                            <div
                              className="mt-8 pt-6"
                              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <p className="font-grotesk text-[9px] tracking-[0.3em] uppercase mb-4" style={{ color: `${song.coverAccent}70` }}>
                                What this song is about
                              </p>
                              <p className="font-grotesk text-[13px] md:text-[14px] leading-[1.85] text-cream-muted">
                                {song.artistMeaning}
                              </p>
                            </div>
                          )}

                          {song.linerNote && (
                            <div
                              className="mt-8 pt-6"
                              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                            >
                              <p className="font-grotesk text-[9px] tracking-[0.3em] uppercase mb-5" style={{ color: `${song.coverAccent}70` }}>
                                My personal note
                              </p>
                              <div className="space-y-4">
                                {song.linerNote.split('\n\n').map((para, i) => {
                                  const isQuote = para.startsWith('>')
                                  if (isQuote) {
                                    const lines = para.split('\n').map(l => l.replace(/^>\s*/, ''))
                                    return (
                                      <blockquote
                                        key={i}
                                        className="border-l-2 pl-4 py-1"
                                        style={{ borderColor: `${song.coverAccent}50` }}
                                      >
                                        {lines.map((line, j) => (
                                          <p key={j} className="font-serif text-[13px] leading-[1.9] italic" style={{ color: `${song.coverAccent}cc` }}>{line}</p>
                                        ))}
                                      </blockquote>
                                    )
                                  }
                                  const parts = para.split(/(\*\*[^*]+\*\*)/)
                                  return (
                                    <p key={i} className="font-grotesk text-[13px] md:text-[14px] leading-[1.85] text-cream-muted">
                                      {parts.map((part, k) =>
                                        part.startsWith('**') && part.endsWith('**')
                                          ? <strong key={k} className="font-semibold text-cream">{part.slice(2, -2)}</strong>
                                          : part
                                      )}
                                    </p>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="lyrics"
                          className="absolute inset-0 overflow-y-auto px-8 md:px-10 pb-8"
                          custom={slideDir}
                          initial={{ opacity: 0, x: slideDir * 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: slideDir * -40 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="space-y-6">
                            {lyricsStanzas.map((stanza, i) => {
                              const lines = stanza.split('\n')
                              const isHeader = lines[0] && !lines[0].includes(' ') || lines[0].length < 20
                              const isHighlightedStanza = (song.highlightedStanzas ?? []).includes(i)
                              const highlightedLineSet = new Set(song.highlightedLines ?? [])
                              const stanzaLineIndices = new Set((song.highlightedLinesByStanza ?? {})[i] ?? [])
                              const renderLine = (line: string, j: number) => {
                                const lit = isHighlightedStanza || highlightedLineSet.has(line) || stanzaLineIndices.has(j)
                                return (
                                  <p
                                    key={j}
                                    className={lit ? 'font-semibold' : ''}
                                    style={lit ? {
                                      color: song.coverAccent,
                                      textShadow: `0 0 12px ${song.coverAccent}60, 0 0 28px ${song.coverAccent}28`,
                                    } : undefined}
                                  >
                                    {line}
                                  </p>
                                )
                              }
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, delay: i * 0.07 }}
                                >
                                  {isHeader ? (
                                    <>
                                      <p
                                        className="font-grotesk text-[8px] tracking-[0.35em] uppercase mb-2"
                                        style={{ color: `${song.coverAccent}70` }}
                                      >
                                        {lines[0]}
                                      </p>
                                      <div className="font-serif text-[14px] md:text-[15px] leading-[2] text-white space-y-0.5">
                                        {lines.slice(1).map((line, j) => renderLine(line, j))}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="font-serif text-[14px] md:text-[15px] leading-[2] text-white space-y-0.5">
                                      {lines.map((line, j) => renderLine(line, j))}
                                    </div>
                                  )}
                                </motion.div>
                              )
                            })}
                          </div>

                          <div
                            className="mt-8 pt-6 flex items-center"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <button
                              onClick={goPrev}
                              className="font-grotesk text-[9px] tracking-[0.25em] uppercase text-cream-dim/50 hover:text-cream-dim transition-colors flex items-center gap-2"
                            >
                              <span style={{ color: song.coverAccent }}>←</span> Story
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
