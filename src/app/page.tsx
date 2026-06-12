import FilmGrain from '@/components/FilmGrain'
import HeroSection from '@/components/HeroSection'
import IntroSection from '@/components/IntroSection'
import RecordRoom from '@/components/RecordRoom'
import NightAmbience from '@/components/NightAmbience'
import FooterSection from '@/components/FooterSection'

export default function Home() {
  return (
    <main className="relative z-[2] text-cream min-h-screen">
      <FilmGrain />
      <NightAmbience />
      <HeroSection />
      <IntroSection />
      <RecordRoom />
      <FooterSection />
    </main>
  )
}
