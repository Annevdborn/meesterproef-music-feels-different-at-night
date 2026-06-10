'use client'

import { motion } from 'framer-motion'
import { useTimeOfDay } from '@/hooks/useTimeOfDay'
import StarField from './StarField'

const titleLines = ['Music Feels', 'Different', 'At Night']

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.22, delayChildren: 0.6 },
  },
}

const lineVariants = {
  hidden: { opacity: 0, y: 32, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
}

const subtitleVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] },
  },
}

const scrollVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 2.2 },
  },
}

export default function HeroSection() {
  const timeOfDay = useTimeOfDay()

  return (
    <section className="relative min-h-screen flex flex-col justify-center">
      {/* Starry sky */}
      <StarField />

      {/* Ambient lamp glow */}
      <div className="lamp-glow" aria-hidden="true" />

      {/* Warm glow pool at the bottom — continues into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '40%',
          background:
            'radial-gradient(ellipse 70% 100% at 20% 100%, rgba(200, 169, 110, 0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Secondary glow, upper right — moonlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 30% at 85% 10%, rgba(100, 120, 180, 0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Moon — lower right, soft and atmospheric */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          bottom: '18%',
          right: '9%',
          zIndex: 2,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [1, 0.87, 1, 0.92, 0.88, 1] }}
        transition={{ duration: 3.5, delay: 1.2, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 5 }}
        aria-hidden="true"
      >
        {/* Outer glow halo */}
        <div
          style={{
            position: 'absolute',
            inset: '-80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220, 210, 180, 0.08) 0%, rgba(200, 180, 140, 0.04) 50%, transparent 70%)',
          }}
        />
        {/* Moon body */}
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 36%, rgba(255, 251, 235, 0.97) 0%, rgba(245, 235, 200, 0.90) 45%, rgba(210, 195, 155, 0.65) 100%)',
            boxShadow: '0 0 28px 10px rgba(245, 235, 200, 0.20), 0 0 70px 30px rgba(220, 205, 160, 0.10)',
          }}
        />
      </motion.div>

      {/* Bottom fade — dissolves into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
        style={{
          height: '22vh',
          background: 'linear-gradient(to bottom, transparent, #080810)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 px-8 md:px-16 lg:px-24 max-w-[90rem] mx-auto w-full">
        {/* Always-visible context line */}
        <motion.p
          className="text-[11px] tracking-[0.3em] uppercase text-amber-muted mb-8 font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          This experience is made for the dark
        </motion.p>

        {/* Main title */}
        <motion.h1
          className="font-serif leading-[1.08] tracking-tight"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label="Music Feels Different At Night"
        >
          {titleLines.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              variants={lineVariants}
            >
              <span
                className={[
                  'block',
                  i === 0
                    ? 'text-[clamp(3rem,8vw,8rem)] text-cream/90'
                    : i === 1
                    ? 'text-[clamp(4rem,11vw,11rem)] text-cream'
                    : 'text-[clamp(3rem,8vw,8rem)] text-amber-glow',
                ].join(' ')}
                style={
                  i === 2
                    ? { textShadow: '0 0 40px rgba(200, 169, 110, 0.55), 0 0 80px rgba(200, 169, 110, 0.25)' }
                    : { textShadow: '0 0 40px rgba(240, 230, 211, 0.25), 0 0 90px rgba(240, 230, 211, 0.12)' }
                }
              >
                {line}
              </span>
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          className="mt-8 md:mt-12 max-w-sm"
          variants={subtitleVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="h-px w-12 bg-amber-glow/40 mb-6" />
          <p className="font-sans text-[13px] leading-[1.8] tracking-wide text-cream-muted">
            5 song • five feelings
            <br />A personal collection from the hours after midnight.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        variants={scrollVariants}
        initial="hidden"
        animate="visible"
        aria-hidden="true"
      >
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-cream-dim">
          scroll
        </span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-amber-glow/40 to-transparent"
          animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
