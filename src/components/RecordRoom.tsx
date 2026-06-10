'use client'

import { useState, useEffect } from 'react'
import RecordShelf from './RecordShelf'
import AlbumSleeve from './AlbumSleeve'
import type { Song } from '@/types'

export default function RecordRoom() {
  const [activeSong, setActiveSong] = useState<Song | null>(null)

  useEffect(() => {
    if (activeSong) {
      document.body.classList.add('scroll-locked')
    } else {
      document.body.classList.remove('scroll-locked')
    }
    return () => document.body.classList.remove('scroll-locked')
  }, [activeSong])

  return (
    <section className="relative" aria-label="Record Collection">
      <div id="record-room-trigger" className="absolute top-0" />
      <div className="py-24">
        <RecordShelf onOpenSleeve={setActiveSong} />
      </div>

      {activeSong && (
        <AlbumSleeve
          song={activeSong}
          isOpen={true}
          onClose={() => setActiveSong(null)}
        />
      )}
    </section>
  )
}
