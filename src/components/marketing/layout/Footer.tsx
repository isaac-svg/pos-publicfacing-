import { Link } from 'react-router-dom'
import { FOOTER } from '../../../lib/copyData'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">S</span>
            </div>
            <div>
              <span className="text-slate-900 font-semibold text-sm">
                {FOOTER.brand}
              </span>
              <span className="hidden sm:inline text-slate-400 text-xs ml-2">
                {FOOTER.tagline}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign up
            </Link>
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Terms
            </a>
          </div>

          <p className="text-xs text-slate-400">{FOOTER.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
