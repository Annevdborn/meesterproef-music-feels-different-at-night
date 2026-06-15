import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import GlobalStarField from '@/components/GlobalStarField'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Music Feels Different At Night',
  description: 'A personal, emotional experience built around five songs that each represent a memory, feeling or moment.',
  openGraph: {
    title: 'Music Feels Different At Night',
    description: 'Five records. Five memories. Listen in the dark.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${playfair.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body>
        <GlobalStarField />
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
