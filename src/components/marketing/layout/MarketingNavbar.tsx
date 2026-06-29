import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import gsap from 'gsap'
import { NAV } from '../../../lib/copyData'

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let prev = false
    function onScroll() {
      const s = window.scrollY > 60
      if (s !== prev) {
        prev = s
        setScrolled(s)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!innerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    if (scrolled) {
      gsap.to(innerRef.current, {
        maxWidth: 720,
        borderRadius: 50,
        paddingLeft: 20,
        paddingRight: 8,
        duration: 0.4,
        ease: 'power3.out',
      })
    } else {
      gsap.to(innerRef.current, {
        maxWidth: 1152,
        borderRadius: 0,
        paddingLeft: 0,
        paddingRight: 0,
        duration: 0.4,
        ease: 'power3.out',
      })
    }
  }, [scrolled])

  function scrollTo(href: string) {
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6">
      <div className={`transition-[padding] duration-300 ${scrolled ? 'pt-3' : 'pt-0'}`}>
        <div
          ref={innerRef}
          className={`mx-auto transition-shadow duration-300 ${
            scrolled
              ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-900/5 border border-slate-200/60'
              : 'bg-transparent'
          }`}
          style={{ maxWidth: 1152 }}
        >
          <div className="flex items-center justify-between h-14 px-2 sm:px-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span
                className={`text-slate-900 font-semibold text-sm transition-all duration-300 overflow-hidden ${
                  scrolled ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                {NAV.brand}
              </span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV.links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100/80"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login"
                className={`text-[13px] text-slate-500 hover:text-slate-900 transition-all hidden sm:inline-flex items-center px-3 py-1.5 rounded-full hover:bg-slate-100/80 ${
                  scrolled ? 'w-0 overflow-hidden opacity-0 px-0' : ''
                }`}
              >
                {NAV.login}
              </Link>
              <Link
                to="/signup"
                className={`inline-flex items-center text-[13px] font-medium transition-all duration-300 ${
                  scrolled
                    ? 'px-4 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {NAV.cta}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-slate-600 p-1.5 rounded-full hover:bg-slate-100/80 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden px-4 pb-4 space-y-1 border-t border-slate-200/40 pt-3 bg-white/90 backdrop-blur-xl rounded-b-2xl">
              {NAV.links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-left text-sm text-slate-500 hover:text-slate-900 transition-colors py-2 px-2 rounded-lg hover:bg-slate-50"
                >
                  {link.label}
                </button>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-slate-500 hover:text-slate-900 transition-colors py-2 px-2 rounded-lg hover:bg-slate-50"
              >
                {NAV.login}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
