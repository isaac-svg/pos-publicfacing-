import { useEffect, useState } from 'react'
import { Download, Monitor, Loader2, CheckCircle } from 'lucide-react'
import { api } from '../../../lib/api'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
const DOWNLOAD_FILE_URL = `${API_BASE}/api/v1/public/download/windows/file`

interface ReleaseInfo {
  version: string
  filename: string
}

export default function DownloadSection() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/public/download/windows/info')
      .then(r => { setRelease(r.data.data as ReleaseInfo) })
      .catch(() => { /* fallback: no version shown */ })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="download" className="py-24 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Desktop App
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Run Shepherd POS on your computer
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The full-featured desktop app works offline, connects to receipt printers, and syncs automatically when back online.
        </p>
      </div>

      <div className="max-w-md mx-auto mt-12">
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6 text-center shadow-sm">
          {/* Windows badge */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              {/* Windows logo paths */}
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.549H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-lg font-bold text-foreground">Shepherd POS for Windows</p>
            {loading ? (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking for latest version...
              </p>
            ) : release ? (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                Version {release.version} — latest release
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Latest release</p>
            )}
          </div>

          {/* System requirements */}
          <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-xs text-muted-foreground space-y-1 text-left">
            <div className="flex justify-between"><span>OS</span><span className="text-foreground font-medium">Windows 10 / 11 (64-bit)</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="text-foreground font-medium">~200 MB</span></div>
            <div className="flex justify-between"><span>RAM</span><span className="text-foreground font-medium">4 GB minimum</span></div>
          </div>

          {/* Download button */}
          {release ? (
            <a
              href={DOWNLOAD_FILE_URL}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download for Windows (.exe)
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary/50 text-primary-foreground text-sm font-semibold cursor-not-allowed"
            >
              <Monitor className="w-4 h-4" />
              {loading ? 'Checking availability...' : 'Download unavailable'}
            </button>
          )}

          <p className="text-xs text-muted-foreground">
            Free to install. Sign in with your Kixon account to activate.
          </p>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          macOS and Linux versions coming soon.
        </p>
      </div>
    </section>
  )
}
