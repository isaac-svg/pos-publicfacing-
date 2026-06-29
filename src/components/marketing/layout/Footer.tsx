import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#060608]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6366f1] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-white font-semibold">Shepherd POS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/signup" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
              Sign up
            </Link>
            <a href="#" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors">
              Terms
            </a>
          </div>

          <p className="text-sm text-[rgba(255,255,255,0.3)]">
            &copy; {new Date().getFullYear()} Shepherd POS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
