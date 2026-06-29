import '../components/marketing/animations/registerPlugins'
import { useLenis } from '../components/marketing/animations/useLenis'
import MarketingNavbar from '../components/marketing/layout/MarketingNavbar'
import Footer from '../components/marketing/layout/Footer'
import CustomCursor from '../components/marketing/layout/CustomCursor'
import HeroSection from '../components/marketing/sections/HeroSection'
import PainAgitationSection from '../components/marketing/sections/PainAgitationSection'
import CashierModuleSection from '../components/marketing/sections/CashierModuleSection'
import CreditShieldSection from '../components/marketing/sections/CreditShieldSection'
import SystemResilienceSection from '../components/marketing/sections/SystemResilienceSection'
import SocialProofSection from '../components/marketing/sections/SocialProofSection'
import FinalCTASection from '../components/marketing/sections/FinalCTASection'

export default function MarketingPage() {
  useLenis()

  return (
    <div className="marketing-root" style={{ background: '#060608', color: '#f5f5f5', fontFamily: '"Geist Variable", "Geist", sans-serif' }}>
      <CustomCursor />
      <MarketingNavbar />
      <main>
        <HeroSection />
        <PainAgitationSection />
        <CashierModuleSection />
        <CreditShieldSection />
        <SystemResilienceSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  )
}
