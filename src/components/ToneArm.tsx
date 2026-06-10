'use client'

import { motion } from 'framer-motion'

interface ToneArmProps {
  isPlaying: boolean
  isDescending: boolean
}

export default function ToneArm({ isPlaying, isDescending }: ToneArmProps) {
  // Resting angle: arm swung right, away from the record
  // Playing angle: arm over the record grooves
  const rotation = isPlaying || isDescending ? -24 : 16

  return (
    <div className="absolute top-[4%] right-[2%] w-[38%] h-[55%] pointer-events-none" aria-hidden="true">
      <motion.div
        className="w-full h-full relative"
        animate={{ rotate: rotation }}
        transition={{
          duration: isDescending ? 2.2 : 0.8,
          ease: isDescending ? [0.4, 0, 0.2, 1] : [0.4, 0, 0.6, 1],
        }}
        style={{ transformOrigin: '90% 8%' }}
      >
        <svg viewBox="0 0 120 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="50%" stopColor="#5e5e5e" />
              <stop offset="100%" stopColor="#3a3a3a" />
            </linearGradient>
          </defs>

          {/* Counterweight (back of arm) */}
          <rect x="85" y="4" width="24" height="10" rx="5" fill="#3a3a3a" stroke="#555" strokeWidth="0.5" />
          <rect x="91" y="7" width="12" height="4" rx="2" fill="#2a2a2a" />

          {/* Pivot bearing */}
          <circle cx="97" cy="16" r="11" fill="#2a2a2a" stroke="#444" strokeWidth="1" />
          <circle cx="97" cy="16" r="7" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
          <circle cx="97" cy="16" r="3" fill="#111" />
          <circle cx="95" cy="14" r="1.2" fill="#555" opacity="0.7" />

          {/* Main arm body */}
          <line
            x1="97" y1="16"
            x2="34" y2="200"
            stroke="url(#armGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Arm highlight */}
          <line
            x1="95" y1="18"
            x2="32" y2="202"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Headshell connector */}
          <rect
            x="22"
            y="196"
            width="24"
            height="8"
            rx="3"
            fill="#3a3a3a"
            stroke="#555"
            strokeWidth="0.5"
          />

          {/* Headshell */}
          <rect
            x="16"
            y="204"
            width="28"
            height="22"
            rx="4"
            fill="#2e2e2e"
            stroke="#444"
            strokeWidth="0.5"
          />
          <rect x="22" y="208" width="16" height="4" rx="2" fill="#222" />

          {/* Stylus */}
          <line x1="30" y1="226" x2="30" y2="236" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="30" cy="236" r="1.5" fill="#c8a96e" opacity="0.8" />
        </svg>
      </motion.div>
    </div>
  )
}
