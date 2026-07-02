'use client'

import React, { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

interface AuditReport {
  url: string
  seo_score: number
  ux_score: number
  performance_score: number
  accessibility_score: number
  overall_score: number
  tech_stack: {
    load_time_ms: number
    ssl_enabled: boolean
    technologies: string[]
    images_count: number
    missing_alt_count: number
  }
  social_links: string[]
  emails: string[]
  phone_numbers: string[]
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

export default function WebsiteAnalyzerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  
  const logEndRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll logs terminal
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  async function handleAudit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setReport(null)
    setLogs(['[System] Initializing website audit connection...'])
    const toastId = toast.loading('Running full website audit...')

    // Polling function for active logs
    let pollCount = 0
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/backend-v3/logs')
        if (res.ok) {
          const data = await res.json()
          if (data.logs) {
            const webLogs = data.logs
              .filter((log: LogEntry) => log.message.includes('[Website Analyzer]'))
              .map((log: LogEntry) => {
                const time = new Date(log.timestamp).toLocaleTimeString()
                return `[${time}] ${log.message.replace('[Website Analyzer] ', '')}`
              })
            
            if (webLogs.length > 0) {
              setLogs(webLogs)
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll active logs:', err)
      }
      
      // Safety limit: stop polling after 45 seconds if request hangs
      pollCount++
      if (pollCount > 45) {
        clearInterval(pollInterval)
      }
    }, 1000)

    try {
      const res = await fetch('/api/backend-v3/test/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await res.json()
      clearInterval(pollInterval)

      if (res.ok && data.report) {
        setReport(data.report)
        // Fetch logs one final time to capture completeness
        const logsRes = await fetch('/api/backend-v3/logs')
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          if (logsData.logs) {
            const webLogs = logsData.logs
              .filter((log: LogEntry) => log.message.includes('[Website Analyzer]'))
              .map((log: LogEntry) => {
                const time = new Date(log.timestamp).toLocaleTimeString()
                return `[${time}] ${log.message.replace('[Website Analyzer] ', '')}`
              })
            setLogs(webLogs)
          }
        }
        toast.success('Website audit completed!', { id: toastId })
      } else {
        throw new Error(data.error || 'Audit failed')
      }
    } catch (err: unknown) {
      clearInterval(pollInterval)
      const msg = err instanceof Error ? err.message : 'Error auditing website'
      setLogs(prev => [...prev, `❌ Error: ${msg}`])
      toast.error(msg, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 90) return 'text-green-400 border-green-500/30 bg-green-950/20'
    if (score >= 70) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20'
    return 'text-red-400 border-red-500/30 bg-red-950/20'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Website Audit & Analyzer</h1>
        <p className="mt-1 text-sm text-gray-400">Extract tech stack, contacts, social links, SEO indicators, and compute optimization scores.</p>
      </div>

      {/* Input panel */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 max-w-2xl">
        <form onSubmit={handleAudit} className="flex gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="flex-1 rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white px-6 py-2.5 transition-colors flex items-center gap-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Auditing...' : 'Run Audit'}
          </button>
        </form>
      </div>

      {/* Real-time Logger Console Terminal */}
      {(loading || logs.length > 0) && (
        <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden max-w-2xl flex flex-col h-[200px]">
          <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
            <span className="font-mono text-[10px] text-gray-400 font-bold uppercase tracking-wider">📡 Audit Engine Console Logs</span>
            {loading && (
              <span className="text-[10px] text-purple-400 font-mono animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Live streaming...
              </span>
            )}
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] text-gray-300 overflow-y-auto space-y-1 select-none">
            {logs.map((log, index) => (
              <div key={index} className="leading-relaxed break-all">
                <span className={log.startsWith('❌') ? 'text-red-400' : 'text-gray-400'}>{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}

      {/* Results Report Display */}
      {report && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left panel: Score cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`rounded-xl border p-6 text-center space-y-2 ${getScoreColor(report.overall_score)}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest block text-gray-400">Overall Score</span>
              <span className="text-5xl font-black">{report.overall_score}</span>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-3 text-xs">
              <h4 className="font-bold text-gray-200 uppercase text-[10px] border-b border-gray-850 pb-2">Individual Pillars</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">SEO Structure</span>
                <span className="font-bold">{report.seo_score}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">User Experience</span>
                <span className="font-bold">{report.ux_score}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Performance Index</span>
                <span className="font-bold">{report.performance_score}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Accessibility Rating</span>
                <span className="font-bold">{report.accessibility_score}/100</span>
              </div>
            </div>
          </div>

          {/* Right panel: Data Extraction Lists */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-6">
              <h3 className="font-bold text-gray-200 text-sm border-b border-gray-850 pb-2">🛠️ Technology & Security Audit</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-850 space-y-1">
                  <span className="text-gray-500 font-semibold block">Load Time</span>
                  <span className="text-gray-200 font-bold">{report.tech_stack.load_time_ms} ms</span>
                </div>
                <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-850 space-y-1">
                  <span className="text-gray-500 font-semibold block">SSL Secure Connection</span>
                  <span className="text-gray-200 font-bold">{report.tech_stack.ssl_enabled ? '🔒 HTTPS Secure' : '⚠️ Unencrypted HTTP'}</span>
                </div>
              </div>

              {/* Technologies list */}
              {report.tech_stack.technologies.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="text-gray-500 font-semibold block">Detected Frameworks & Libraries</span>
                  <div className="flex flex-wrap gap-2">
                    {report.tech_stack.technologies.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-gray-950 border border-gray-850 text-gray-300 rounded font-mono text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contacts & Social links */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-6">
              <h3 className="font-bold text-gray-200 text-sm border-b border-gray-850 pb-2">📞 Contact details & Social Footprints</h3>

              <div className="grid md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Contact Channels</h4>
                  <div className="space-y-1.5">
                    {report.emails.map(e => (
                      <div key={e} className="text-gray-200 break-all bg-gray-950/40 px-3 py-1.5 rounded border border-gray-900">✉️ {e}</div>
                    ))}
                    {report.phone_numbers.map(p => (
                      <div key={p} className="text-gray-200 break-all bg-gray-950/40 px-3 py-1.5 rounded border border-gray-900">📞 {p}</div>
                    ))}
                    {report.emails.length === 0 && report.phone_numbers.length === 0 && (
                      <span className="text-gray-500 italic">No emails or phone numbers found on the homepage.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-400 uppercase text-[9px] tracking-wider">Social Footprints</h4>
                  <div className="space-y-1.5">
                    {report.social_links.map(s => (
                      <a
                        key={s}
                        href={s}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-purple-400 hover:text-purple-300 hover:underline break-all bg-gray-950/40 px-3 py-1.5 rounded border border-gray-900"
                      >
                        🔗 {s}
                      </a>
                    ))}
                    {report.social_links.length === 0 && (
                      <span className="text-gray-500 italic">No social media links detected.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
