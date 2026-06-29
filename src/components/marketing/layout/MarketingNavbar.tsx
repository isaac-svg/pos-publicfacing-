import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GlowButton from '../ui/GlowButton'

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[rgba(6,6,8,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:inline">Shepherd</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => {
                const el = document.getElementById('pain-agitation')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            >
              How it works
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('system-resilience')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors"
            >
              Features
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-[rgba(255,255,255,0.5)] hover:text-white transition-colors hidden sm:inline"
            >
              Log in
            </Link>
            <GlowButton href="/signup" className="text-sm !px-5 !py-2">
              Start free
            </GlowButton>
          </div>
        </div>
      </div>
    </nav>
  )
}
