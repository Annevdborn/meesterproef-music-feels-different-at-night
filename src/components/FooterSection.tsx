'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const SPOTIFY_URL = 'https://open.spotify.com/user/annexx2001'

const STARS = [
  { x: 7,  y: 5,  r: 1.4, o: 0.55, d: 2.8, delay: 0.0 },
  { x: 18, y: 11, r: 0.8, o: 0.35, d: 3.5, delay: 0.7 },
  { x: 29, y: 3,  r: 1.6, o: 0.65, d: 2.2, delay: 1.4 },
  { x: 41, y: 8,  r: 1.0, o: 0.45, d: 4.1, delay: 0.3 },
  { x: 53, y: 2,  r: 0.7, o: 0.30, d: 3.0, delay: 1.9 },
  { x: 64, y: 13, r: 1.3, o: 0.50, d: 2.6, delay: 0.5 },
  { x: 76, y: 4,  r: 0.9, o: 0.40, d: 3.8, delay: 1.1 },
  { x: 87, y: 9,  r: 1.5, o: 0.60, d: 2.4, delay: 2.2 },
  { x: 93, y: 17, r: 0.8, o: 0.35, d: 3.3, delay: 0.8 },
  { x: 11, y: 22, r: 1.1, o: 0.45, d: 2.9, delay: 1.6 },
  { x: 35, y: 18, r: 0.7, o: 0.28, d: 4.4, delay: 0.2 },
  { x: 58, y: 7,  r: 1.2, o: 0.50, d: 2.7, delay: 2.8 },
  { x: 72, y: 20, r: 0.9, o: 0.38, d: 3.6, delay: 0.9 },
  { x: 84, y: 28, r: 1.0, o: 0.42, d: 2.3, delay: 1.7 },
  { x: 4,  y: 31, r: 0.8, o: 0.32, d: 3.9, delay: 0.4 },
  { x: 47, y: 24, r: 1.4, o: 0.55, d: 2.5, delay: 2.1 },
  { x: 90, y: 35, r: 0.7, o: 0.30, d: 4.2, delay: 1.3 },
  { x: 22, y: 38, r: 1.1, o: 0.40, d: 3.1, delay: 0.6 },
  { x: 66, y: 32, r: 0.6, o: 0.25, d: 2.8, delay: 2.5 },
  { x: 80, y: 42, r: 1.2, o: 0.48, d: 3.4, delay: 1.0 },
  { x: 38, y: 45, r: 0.8, o: 0.33, d: 4.0, delay: 1.8 },
  { x: 15, y: 48, r: 1.0, o: 0.38, d: 2.6, delay: 3.1 },
  { x: 55, y: 40, r: 0.7, o: 0.28, d: 3.7, delay: 0.1 },
  { x: 97, y: 22, r: 0.9, o: 0.36, d: 2.9, delay: 2.4 },
  { x: 2,  y: 15, r: 0.6, o: 0.24, d: 4.3, delay: 1.5 },
]

function Curtains({ visible }: { visible: boolean }) {
  return (
    <>
      {/* Left curtain */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '51%', zIndex: 9999,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(to right, rgba(255,255,255,0.022) 0px, rgba(0,0,0,0) 4px, rgba(255,255,255,0.012) 8px, rgba(0,0,0,0) 13px, rgba(255,255,255,0.018) 17px, rgba(0,0,0,0) 22px), linear-gradient(160deg, #100d22 0%, #0c091a 50%, #080613 100%)',
        }}
        animate={{ x: visible ? '0%' : '-100%' }}
        initial={{ x: '-100%' }}
        transition={{ duration: 0.85, ease: [0.4, 0, 0.15, 1] }}
      />
      {/* Right curtain */}
      <motion.div
        style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: '51%', zIndex: 9999,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(to left, rgba(255,255,255,0.022) 0px, rgba(0,0,0,0) 4px, rgba(255,255,255,0.012) 8px, rgba(0,0,0,0) 13px, rgba(255,255,255,0.018) 17px, rgba(0,0,0,0) 22px), linear-gradient(200deg, #100d22 0%, #0c091a 50%, #080613 100%)',
        }}
        animate={{ x: visible ? '0%' : '100%' }}
        initial={{ x: '100%' }}
        transition={{ duration: 0.85, ease: [0.4, 0, 0.15, 1] }}
      />
      {/* Good night message — fades in once curtains are closed */}
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, delay: visible ? 0.7 : 0 }}
      >
        <span style={{ fontSize: 28, color: 'rgba(200,169,110,0.65)' }}>☽</span>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>
          good night
        </p>
      </motion.div>
    </>
  )
}

// Shooting star moves from upper-right to lower-left at ~30° below horizontal.
// rotate: -30 aligns the streak with its own direction of travel.
// gradient: bright head (left/front) fades to transparent tail (right/behind).
// Moves from upper-left to lower-right at ~30° below horizontal.
// rotate: 30 aligns the streak with its travel direction.
// gradient: bright head at the right (front/lower-right), tail fades left.
function ShootingStar({ top, left, delay }: { top: string; left: string; delay: number }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top,
        left,
        width: 160,
        height: 1.5,
        background: 'linear-gradient(to left, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 20%, rgba(255,255,255,0.15) 60%, transparent 100%)',
        borderRadius: 2,
        rotate: 30,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      animate={{
        x: [0, 520],
        y: [0, 300],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 0.7,
        repeat: Infinity,
        repeatDelay: delay,
        ease: [0.3, 0, 0.85, 1],
        times: [0, 0.05, 0.9, 1],
      }}
    />
  )
}

function VinylIntoSleeve({ onSleep }: { onSleep: () => void }) {
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
      <div ref={vinylRef} className="w-full relative" style={{ paddingBottom: 'min(18vw, 185px)' }}>
        <div className="flex justify-center" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div style={{ width: '110vw', height: '110vw', maxWidth: 1200, maxHeight: 1200, y: vinylY }}>
            <svg
              viewBox="0 0 200 200"
              width="100%"
              height="100%"
              style={{ filter: 'drop-shadow(0 0 80px rgba(200,169,110,0.08))' }}
              aria-hidden="true"
            >
              <defs>
                {/* Moon surface — gradient only, no expensive filters */}
                <radialGradient id="vs2-moonbase" cx="36%" cy="30%" r="65%">
                  <stop offset="0%"   stopColor="#dedad2" />
                  <stop offset="35%"  stopColor="#b4b0a8" />
                  <stop offset="70%"  stopColor="#7e7a74" />
                  <stop offset="100%" stopColor="#48443e" />
                </radialGradient>
                {/* Dark patch — mare imbrium / large dark plain upper-left */}
                <radialGradient id="vs2-mare1" cx="30%" cy="35%" r="30%">
                  <stop offset="0%"   stopColor="rgba(52,48,44,0.7)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Dark patch lower-right */}
                <radialGradient id="vs2-mare2" cx="68%" cy="65%" r="25%">
                  <stop offset="0%"   stopColor="rgba(48,44,40,0.55)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Sunlit highlight */}
                <radialGradient id="vs2-sunlit" cx="28%" cy="26%" r="48%">
                  <stop offset="0%"   stopColor="rgba(255,252,244,0.5)" />
                  <stop offset="60%"  stopColor="rgba(240,236,228,0.1)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                {/* Limb darkening */}
                <radialGradient id="vs2-limb" cx="50%" cy="50%" r="50%">
                  <stop offset="72%"  stopColor="transparent" />
                  <stop offset="90%"  stopColor="rgba(28,24,20,0.55)" />
                  <stop offset="100%" stopColor="rgba(8,6,4,0.94)" />
                </radialGradient>
              </defs>

              {/* Moon base */}
              <circle cx="100" cy="100" r="99" fill="url(#vs2-moonbase)" />
              {/* Dark maria — gradient patches, zero filter cost */}
              <circle cx="100" cy="100" r="99" fill="url(#vs2-mare1)" />
              <circle cx="100" cy="100" r="99" fill="url(#vs2-mare2)" />

              {/* Craters — rim ring + dark floor + bright central peak */}
              <circle cx="62"  cy="58"  r="9"   fill="rgba(46,42,38,0.4)" />
              <circle cx="62"  cy="58"  r="9"   fill="none" stroke="rgba(200,196,188,0.45)" strokeWidth="1.2" />
              <circle cx="63"  cy="57"  r="2.2" fill="rgba(220,216,208,0.35)" />

              <circle cx="138" cy="70"  r="6.5" fill="rgba(44,40,36,0.38)" />
              <circle cx="138" cy="70"  r="6.5" fill="none" stroke="rgba(190,186,178,0.38)" strokeWidth="1" />

              <circle cx="76"  cy="140" r="12"  fill="rgba(48,44,40,0.42)" />
              <circle cx="76"  cy="140" r="12"  fill="none" stroke="rgba(195,191,183,0.4)" strokeWidth="1.4" />
              <circle cx="77"  cy="139" r="2.8" fill="rgba(215,211,203,0.3)" />

              <circle cx="150" cy="132" r="7"   fill="rgba(44,40,36,0.35)" />
              <circle cx="150" cy="132" r="7"   fill="none" stroke="rgba(185,181,173,0.35)" strokeWidth="1" />

              <circle cx="120" cy="46"  r="4.5" fill="rgba(42,38,34,0.32)" />
              <circle cx="120" cy="46"  r="4.5" fill="none" stroke="rgba(188,184,176,0.32)" strokeWidth="0.8" />

              <circle cx="40"  cy="114" r="5.5" fill="rgba(44,40,36,0.34)" />
              <circle cx="40"  cy="114" r="5.5" fill="none" stroke="rgba(186,182,174,0.34)" strokeWidth="0.9" />

              <circle cx="160" cy="88"  r="3.5" fill="rgba(40,36,32,0.3)" />
              <circle cx="160" cy="88"  r="3.5" fill="none" stroke="rgba(182,178,170,0.3)" strokeWidth="0.7" />

              {/* Vinyl grooves — warm grey, subtle on lunar surface */}
              {Array.from({ length: 55 }, (_, i) => (
                <circle
                  key={i}
                  cx="100" cy="100"
                  r={28 + i * 1.3}
                  fill="none"
                  stroke={i % 4 === 0 ? 'rgba(72,68,62,0.32)' : 'rgba(90,86,80,0.16)'}
                  strokeWidth="0.55"
                  opacity={0.65 - i * 0.004}
                />
              ))}

              {/* Sunlit zone + limb darkening on top */}
              <circle cx="100" cy="100" r="99" fill="url(#vs2-sunlit)" />
              <circle cx="100" cy="100" r="99" fill="url(#vs2-limb)" />

              {/* Center label — crater-like */}
              <circle cx="100" cy="100" r="26" fill="#3a3630" />
              <circle cx="100" cy="100" r="26" fill="none" stroke="rgba(165,160,150,0.28)" strokeWidth="1" />
              <circle cx="100" cy="100" r="4"  fill="#1c1814" />
            </svg>
          </motion.div>
        </div>

        {/* Sleeve opening — no hard border, fades in from the vinyl shadow */}
        <div
          style={{
            position: 'absolute',
            top: 'min(35vw, 380px)',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
            background: 'linear-gradient(180deg, #04050d 0%, #04050d 100%)',
          }}
        >
          {/* soft shadow where vinyl enters */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 120,
            background: 'linear-gradient(to bottom, rgba(0,0,4,0.98), transparent)',
          }} />
        </div>
      </div>

      {/* Sleeve face — night atmosphere with stars */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 3,
          marginTop: 'calc(-1 * min(65vw, 700px))',
          overflow: 'hidden',
          // fades in seamlessly from the vinyl container above
          background: 'linear-gradient(180deg, transparent 0%, rgba(4,5,13,0.85) 6%, #04050d 14%)',
          paddingTop: '3rem',
          paddingBottom: '5rem',
          paddingLeft: 'clamp(2rem, 8vw, 8rem)',
          paddingRight: 'clamp(2rem, 8vw, 8rem)',
        }}
      >
        {/* CSS keyframes — no JS per frame */}
        <style>{`
          @keyframes footer-twinkle {
            0%, 100% { opacity: var(--bright); }
            50%      { opacity: var(--dim); }
          }
          .sleep-btn .sleep-text { color: rgba(255,255,255,0.18); transition: color 0.8s; }
          .sleep-btn .sleep-moon { color: rgba(200,169,110,0.22); transition: color 0.8s, transform 0.8s; }
          .sleep-btn:hover .sleep-text { color: rgba(255,255,255,0.5); }
          .sleep-btn:hover .sleep-moon { color: rgba(200,169,110,0.6); transform: translateY(-3px); }
        `}</style>

        {/* Twinkling stars — CSS animation, zero JS per frame */}
        {STARS.map((s, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: '50%',
              background: 'white',
              pointerEvents: 'none',
              ['--bright' as string]: s.o,
              ['--dim' as string]: s.o * 0.1,
              animation: `footer-twinkle ${s.d}s ${s.delay}s infinite ease-in-out`,
            }}
          />
        ))}

        {/* Shooting stars — upper-left to lower-right */}
        <ShootingStar top="5%"  left="8%"  delay={9} />
        <ShootingStar top="15%" left="35%" delay={16} />

        {/* Moonlight glow — soft ambient light in upper area */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-10%',
            right: '10%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,215,255,0.055) 0%, rgba(180,200,255,0.02) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Warm amber hint bottom-left — like a record player in a dark room */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '-5%',
            width: 500,
            height: 300,
            background: 'radial-gradient(ellipse, rgba(200,169,110,0.04) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '64rem', margin: '0 auto' }}>

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
            className="font-grotesk text-[15px] leading-[1.9] text-cream-muted mb-12"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            For reading, for listening, for giving my songs a moment of your night.
            It means more than I can put into words. Music is most alive when it&apos;s shared,
            even in silence, even at a distance. I hope something of mine stayed with you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              borderLeft: '1px solid rgba(200,169,110,0.2)',
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
            <p className="font-grotesk text-[14px] leading-[1.85] text-cream-dim">
              Not your favourite. Not the one you&apos;d put on a playlist for someone else.
              The one that belongs to a specific night, a specific feeling. The one
              that always gets through, no matter what time it is.
              <br /><br />
              Sit with it tonight.
            </p>
          </motion.div>

          <motion.a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-grotesk text-[13px] tracking-widest uppercase text-amber-glow border border-amber-glow/30 px-6 py-3 hover:bg-amber-glow/5 hover:border-amber-glow/60 transition-all duration-300"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Listen on Spotify
          </motion.a>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.8 }}
            style={{
              marginTop: '5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
            }}>
              Music Feels Different At Night
            </span>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 14,
              color: 'rgba(200,169,110,0.4)',
              fontStyle: 'italic',
            }}>
              — Anne
            </span>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 11,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
            }}>
              Side A
            </span>
          </motion.div>

          {/* Sleep CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 2.5, delay: 1.8 }}
            style={{ textAlign: 'center', marginTop: '5rem', paddingBottom: '1rem' }}
          >
            <button
              onClick={onSleep}
              className="sleep-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', margin: '0 auto' }}
              aria-label="Sluit je ogen en ga terug naar het begin"
            >
              <span className="sleep-text" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(0.8rem, 1.3vw, 1rem)', letterSpacing: '0.04em' }}>
                ready to sleep?
              </span>
              <span className="sleep-moon" style={{ fontSize: 22, display: 'block' }}>☽</span>
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default function FooterSection() {
  const [curtainsVisible, setCurtainsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleSleep = () => {
    setCurtainsVisible(true)
    setTimeout(() => window.scrollTo({ top: 0 }), 850)
    setTimeout(() => setCurtainsVisible(false), 1500)
  }

  return (
    <>
      <footer className="relative overflow-hidden">
        <div style={{ width: '100vw', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
          <VinylIntoSleeve onSleep={handleSleep} />
        </div>
      </footer>
      {mounted && createPortal(<Curtains visible={curtainsVisible} />, document.body)}
    </>
  )
}
