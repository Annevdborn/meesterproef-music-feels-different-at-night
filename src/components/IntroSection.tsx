'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const body = `Some songs don't belong on a playlist. You keep them inside yourself. Tied to a person, an evening, a feeling you can't quite put into words. Music has been a part of my life since before I was even born. But it's only when the day is over and the world goes quiet that it really gets through. That's when you hear things in a song that simply aren't there in the afternoon. Sharper. Closer. I could have chosen hundreds, but these five each carry their own weight. I'm not sharing my songs to explain. Just to let you feel it too.`

export default function IntroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-32 md:py-48 px-8 md:px-16 lg:px-24">

      <div ref={ref} className="max-w-[90rem] mx-auto">
        {/* Title */}
        <motion.h2
          className="font-serif text-[clamp(1.6rem,3.5vw,3rem)] leading-[1.2] text-cream mb-10 md:mb-14 max-w-2xl"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          "A Note From Me"
        </motion.h2>

        {/* Divider */}
        <motion.div
          className="w-12 h-px bg-amber-glow/30 mb-12"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'left' }}
        />

        {/* Body */}
        <motion.p
          className="font-grotesk text-[15px] md:text-[16px] leading-[1.9] text-cream-muted max-w-prose md:pl-4"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {body}
        </motion.p>

        <motion.p
          className="font-serif text-[14px] md:text-[15px] italic text-cream-dim mt-10 md:pl-4"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          Each record has a personal note. Click to read mine.
        </motion.p>
      </div>
    </section>
  )
}
