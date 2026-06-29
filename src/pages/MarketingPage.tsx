import '../components/marketing/animations/registerPlugins'
import { useLenis } from '../components/marketing/animations/useLenis'
import MarketingNavbar from '../components/marketing/layout/MarketingNavbar'
import Footer from '../components/marketing/layout/Footer'
import HeroSection from '../components/marketing/sections/HeroSection'
import ProblemSection from '../components/marketing/sections/ProblemSection'
import PillarsSection from '../components/marketing/sections/PillarsSection'
import ClarityGridSection from '../components/marketing/sections/ClarityGridSection'
import TrialOfferSection from '../components/marketing/sections/TrialOfferSection'
import PricingSection from '../components/marketing/sections/PricingSection'
import FAQSection from '../components/marketing/sections/FAQSection'

export default function MarketingPage() {
  useLenis()

  return (
    <div
      className="marketing-root bg-white text-slate-900"
      style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}
    >
      <MarketingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <PillarsSection />
        <ClarityGridSection />
        <TrialOfferSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
