'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface ShootingStar {
  id: number
  startX: number
  startY: number
  angle: number
  length: number
  speed: number
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() < 0.6 ? 1 : Math.random() < 0.75 ? 1.5 : 2,
      twinkle: Math.random() < 0.35,
      delay: Math.random() * 8,
      duration: 2 + Math.random() * 4,
      opacity: 0.28 + Math.random() * 0.52,
    }))
    setStars(generated)

    const shoot = () => {
      const id = Date.now()
      setShootingStars(prev => [...prev, {
        id,
        startX: 10 + Math.random() * 60,
        startY: 2 + Math.random() * 28,
        angle: 22 + Math.random() * 20,
        length: 100 + Math.random() * 60,
        speed: 0.55 + Math.random() * 0.25,
      }])
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id))
      }, 1400)
    }

    const first = setTimeout(shoot, 5000 + Math.random() * 5000)
    const interval = setInterval(shoot, 11000 + Math.random() * 9000)

    return () => {
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
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

      <AnimatePresence>
        {shootingStars.map(star => (
          <motion.div
            key={star.id}
            className="absolute"
            style={{
              left: `${star.startX}%`,
              top: `${star.startY}%`,
              rotate: `${star.angle}deg`,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, 240],
              y: [0, 100],
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: star.speed,
              times: [0, 0.06, 0.72, 1],
              ease: 'linear',
            }}
          >
            {/* Tail — gradient from transparent to near-white */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: star.length,
                height: 1.5,
                background:
                  'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.55) 75%, rgba(255,255,255,0.88) 100%)',
              }}
            />
            {/* Head — bright glowing dot */}
            <div
              style={{
                position: 'absolute',
                right: -2,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 5px 2px rgba(220, 230, 255, 0.7)',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
