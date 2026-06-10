import FilmGrain from '@/components/FilmGrain'
import HeroSection from '@/components/HeroSection'
import IntroSection from '@/components/IntroSection'
import RecordRoom from '@/components/RecordRoom'

export default function Home() {
  return (
    <main className="relative bg-night-900 text-cream min-h-screen">
      <FilmGrain />
      <HeroSection />
      <IntroSection />
      <RecordRoom />
    </main>
  )
}
