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

  const y = useTransform(scrollY, [0, 4000], ['0%', '-50%'])
  const opacity = useTransform(scrollY, [0, 800, 2000], [1, 0.85, 0.55])

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 200,
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
      {/* CSS keyframes — no JS animation overhead */}
      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--dim); }
          50%       { opacity: var(--bright); }
        }
      `}</style>

      <motion.div className="absolute w-full" style={{ height: '200%', top: 0, y }}>
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.twinkle ? undefined : star.opacity,
              // CSS custom properties drive the keyframe — zero JS per frame
              ['--dim' as string]: star.opacity * 0.15,
              ['--bright' as string]: star.opacity,
              animation: star.twinkle
                ? `star-twinkle ${star.duration}s ${star.delay}s infinite ease-in-out`
                : undefined,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
