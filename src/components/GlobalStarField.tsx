'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Star {
  id: number
  x: number
  y: number
  size: number
  twinkle: boolean
  delay: number
  duration: number
  opacity: number
}

export default function GlobalStarField() {
  const [stars, setStars] = useState<Star[]>([])
  const { scrollY } = useScroll()

  // Stars drift upward as you scroll — like moving through the night sky
  const y = useTransform(scrollY, [0, 4000], ['0%', '-50%'])

  // Bright in the hero, fade to subtle when reaching the record section (~1 viewport down)
  const opacity = useTransform(scrollY, [0, 800, 2000], [1, 0.85, 0.55])

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 200, // spread over 200% so stars enter from below while scrolling
      size: Math.random() < 0.6 ? 1 : Math.random() < 0.75 ? 1.5 : 2,
      twinkle: Math.random() < 0.35,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 4,
      opacity: 0.65 + Math.random() * 0.35,
    }))
    setStars(generated)
  }, [])

  return (
    <motion.div className="fixed inset-0 pointer-events-none z-[1]" style={{ opacity }} aria-hidden="true">
      <motion.div
        className="absolute w-full"
        style={{ height: '200%', top: 0, y }}
      >
        {stars.map(star =>
          star.twinkle ? (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
              }}
              animate={{ opacity: [star.opacity * 0.15, star.opacity, star.opacity * 0.15] }}
              transition={{
                duration: star.duration,
                delay: star.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ) : (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              }}
            />
          )
        )}
      </motion.div>
    </motion.div>
  )
}
