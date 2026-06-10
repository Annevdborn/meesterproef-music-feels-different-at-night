'use client'

import { useMemo } from 'react'

export type TimeOfDay = 'night' | 'evening' | 'day'

export function useTimeOfDay(): TimeOfDay {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 22 || hour < 5) return 'night'
    if (hour >= 18 || hour < 8) return 'evening'
    return 'day'
  }, [])
}
