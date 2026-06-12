'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const SPOTIFY_URL = 'https://open.spotify.com/user/annexx2001'

function VinylIntoSleeve() {
  const vinylRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const inView = useInView(contentRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({
    target: vinylRef,
    offset: ['start end', 'end end'],
  })

  const vinylY = useTransform(scrollYProgress, [0, 1], ['0%', '52%'])

  return (
    <div>
      {/* Vinyl animation */}
      <div ref={vinylRef} className="w-full relative" style={{ paddingBottom: 'min(15vw, 150px)' }}>
        <div className="flex justify-center" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div style={{ width: '90vw', height: '90vw', maxWidth: 900, maxHeight: 900, y: vinylY }}>
            <svg
              viewBox="0 0 200 200"
              width="100%"
              height="100%"
              style={{ filter: 'drop-shadow(0 0 80px rgba(200,169,110,0.08))' }}
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="vs2-sheen" cx="35%" cy="30%" r="55%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="vs2-edge" cx="50%" cy="50%" r="50%">
                  <stop offset="88%" stopColor="transparent" />
                  <stop offset="95%" stopColor="#2a2a2a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#111" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="99" fill="#0e0e0e" />
              {Array.from({ length: 55 }, (_, i) => (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={28 + i * 1.3}
                  fill="none"
                  stroke={i % 4 === 0 ? '#252525' : '#181818'}
                  strokeWidth="0.6"
                  opacity={0.7 - i * 0.005}
                />
              ))}
              <circle cx="100" cy="100" r="99" fill="url(#vs2-sheen)" />
              <circle cx="100" cy="100" r="99" fill="url(#vs2-edge)" />
              <circle cx="100" cy="100" r="99" fill="none" stroke="rgba(200,169,110,0.2)" strokeWidth="1" />
              <circle cx="100" cy="100" r="26" fill="#1a1408" />
              <circle cx="100" cy="100" r="24" fill="none" stroke="rgba(200,169,110,0.4)" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="19" fill="none" stroke="rgba(200,169,110,0.15)" strokeWidth="0.6" />
              <circle cx="100" cy="100" r="4" fill="#07070f" />
            </svg>
          </motion.div>
        </div>

        {/* Sleeve overlay */}
        <div
          style={{
            position: 'absolute',
            top: 'min(45vw, 450px)',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            background: 'linear-gradient(180deg, #1e1608 0%, #141008 60%, #0a0804 100%)',
            borderTop: '1px solid rgba(200,169,110,0.22)',
            boxShadow: 'inset 0 12px 60px rgba(0,0,0,0.9)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), transparent)',
          }} />
        </div>
      </div>

      {/* Sleeve content — pulled up into the sleeve face; z-index 3 places it in front of the vinyl */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 3,
          marginTop: 'calc(-1 * min(40vw, 420px))',
          background: 'linear-gradient(180deg, #1a1208 0%, #0f0b06 30%, #080603 100%)',
          paddingTop: '3rem',
          paddingBottom: '5rem',
          paddingLeft: 'clamp(2rem, 8vw, 8rem)',
          paddingRight: 'clamp(2rem, 8vw, 8rem)',
        }}
      >
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>

          {/* Thank you heading */}
          <motion.h2
            className="font-serif text-[clamp(1.4rem,3vw,2.6rem)] leading-[1.25] text-cream mb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            Thank you for staying<br />up late with me.
          </motion.h2>

          <motion.div
            className="w-10 h-px bg-amber-glow/40 mb-6"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
          />

          <motion.p
            className="font-sans text-[15px] leading-[1.9] text-cream-muted mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            For reading, for listening, for giving my songs a moment of your night.
            It means more than I can put into words. Music is most alive when it&apos;s shared,
            even in silence, even at a distance. I hope something of mine stayed with you.
          </motion.p>

          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderLeft: '1px solid rgba(200,169,110,0.25)',
              paddingLeft: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            <p className="font-serif text-[clamp(0.75rem,1.2vw,0.9rem)] tracking-[0.2em] uppercase text-amber-muted mb-4">
              My question to you
            </p>
            <p className="font-serif text-[clamp(1.1rem,2vw,1.5rem)] leading-[1.5] text-cream mb-5">
              &ldquo;Which song carries something you&apos;ve never quite been able to explain?&rdquo;
            </p>
            <p className="font-sans text-[14px] leading-[1.85] text-cream-dim">
              Not your favourite. Not the one you&apos;d put on a playlist for someone else.
              The one that belongs to a specific night, a specific feeling. The one
              that always gets through, no matter what time it is.
              <br /><br />
              Sit with it tonight.
            </p>
          </motion.div>

          {/* Spotify link */}
          <motion.a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-sans text-[13px] tracking-widest uppercase text-amber-glow border border-amber-glow/30 px-6 py-3 hover:bg-amber-glow/5 hover:border-amber-glow/60 transition-all duration-300"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Listen on Spotify
          </motion.a>

          {/* Bottom sleeve details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.8 }}
            style={{
              marginTop: '5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(200,169,110,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'rgba(200,169,110,0.28)',
              textTransform: 'uppercase',
            }}>
              Music Feels Different At Night
            </span>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 14,
              color: 'rgba(200,169,110,0.35)',
              fontStyle: 'italic',
            }}>
              — Anne
            </span>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 11,
              letterSpacing: '0.2em',
              color: 'rgba(200,169,110,0.28)',
              textTransform: 'uppercase',
            }}>
              Side A
            </span>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default function FooterSection() {
  return (
    <footer className="relative overflow-hidden">
      <div style={{ width: '100vw', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
        <VinylIntoSleeve />
      </div>
    </footer>
  )
}
