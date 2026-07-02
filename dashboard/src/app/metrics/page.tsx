'use client'

import React, { useState, useEffect, useRef } from 'react'

interface WorkerHealth {
  workerId: number
  status: 'Idle' | 'Busy' | 'Paused' | 'Stopped' | 'Recovering'
  currentJobId: string | null
  currentProvider: string | null
  elapsedSeconds: number
}

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
}

interface Metrics {
  uptime_seconds: number
  cpu_count: number
  cpu_load_1min: number
  ram_heap_used_mb: number
  ram_rss_mb: number
  browser_status: string
  open_contexts: number
  open_pages: number
  jobs_executed: number
  jobs_failed: number
  jobs_per_hour: number
  success_rate_pct: number
  average_job_duration_ms: number
  provider_average_times_ms: Record<string, number>
  retries: number
}

interface QueueStats {
  queued: number
  running: number
  completed: number
  failed: number
  total: number
  isPaused: boolean
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [workers, setWorkers] = useState<WorkerHealth[]>([])
  const [queue, setQueue] = useState<QueueStats | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'>('ALL')
  const [loading, setLoading] = useState(true)

  const consoleEndRef = useRef<HTMLDivElement | null>(null)

  async function fetchMetricsData() {
    try {
      const [mRes, wRes, qRes, lRes] = await Promise.all([
        fetch('/api/backend-v3/metrics'),
        fetch('/api/backend-v3/metrics/workers'),
        fetch('/api/backend-v3/metrics/queue'),
        fetch('/api/backend-v3/logs')
      ])

      if (mRes.ok && wRes.ok && qRes.ok && lRes.ok) {
        const mData = await mRes.json()
        const wData = await wRes.json()
        const qData = await qRes.json()
        const lData = await lRes.json()
        
        setMetrics(mData.metrics)
        setWorkers(wData.workers)
        setQueue(qData.queue)
        setLogs(lData.logs || [])
      }
    } catch (err) {
      console.error('Failed to poll V3 backend metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetricsData()
    const interval = setInterval(fetchMetricsData, 3000) // Poll every 3s
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll terminal console to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, logFilter])

  function formatUptime(sec: number) {
    const hrs = Math.floor(sec / 3600)
    const mins = Math.floor((sec % 3600) / 60)
    const secs = sec % 60
    return `${hrs}h ${mins}m ${secs}s`
  }

  function getLogLevelStyle(level: string) {
    switch (level) {
      case 'ERROR': return 'text-red-400 font-bold'
      case 'WARN': return 'text-yellow-400 font-bold'
      case 'DEBUG': return 'text-blue-400'
      default: return 'text-purple-400'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'ALL') return true
    return log.level === logFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Metrics & Engine</h1>
          <p className="mt-1 text-sm text-gray-400">Live operational telemetry and browser worker pools from Backend V3.</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-xs text-gray-400 self-start md:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          Live Engine Feeds (3s auto-refresh)
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-xl bg-gray-900 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : !metrics ? (
        <div className="text-center py-12 rounded-xl border border-gray-800 bg-gray-900/20 text-gray-500 text-sm">
          <p className="font-semibold text-lg text-gray-400 mb-1">Failed to Connect to Backend V3</p>
          <p>Verify that your V3 Backend container service is deployed and running on Port 3001.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Resource Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Uptime</span>
              <p className="text-xl font-bold text-white">{formatUptime(metrics.uptime_seconds)}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">CPU Load (1m Avg)</span>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-white">{Math.round(metrics.cpu_load_1min * 100)}%</p>
                <span className="text-xs text-gray-500">{metrics.cpu_count} Cores</span>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-850 p-0.5 mt-2">
                <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${Math.min(100, metrics.cpu_load_1min * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">RAM RSS Heap</span>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-white">{metrics.ram_heap_used_mb} MB</p>
                <span className="text-xs text-gray-500">RSS {metrics.ram_rss_mb}MB</span>
              </div>
              <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-850 p-0.5 mt-2">
                <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${Math.min(100, (metrics.ram_heap_used_mb / 250) * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Job Success Rate</span>
              <p className="text-xl font-bold text-green-400">{metrics.success_rate_pct}%</p>
              <span className="text-[10px] text-gray-500 block mt-1">
                Completed: {metrics.jobs_executed - metrics.jobs_failed} | Failed: {metrics.jobs_failed}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Panel: Workers Status */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 md:col-span-2 overflow-hidden">
              <div className="border-b border-gray-800 px-5 py-4 bg-gray-900/60">
                <h3 className="font-bold text-gray-200 text-sm">👷 Worker Pool Status</h3>
              </div>
              <div className="divide-y divide-gray-800/40">
                {workers.map(w => (
                  <div key={w.workerId} className="px-5 py-4 flex items-center justify-between hover:bg-gray-800/10 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-200 text-sm">Worker #{w.workerId}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                          ${w.status === 'Idle' ? 'bg-slate-800 text-slate-400' : ''}
                          ${w.status === 'Busy' ? 'bg-purple-950 text-purple-400 border border-purple-900' : ''}
                          ${w.status === 'Paused' ? 'bg-yellow-950 text-yellow-400 border border-yellow-900' : ''}
                          ${w.status === 'Stopped' ? 'bg-red-950 text-red-400 border border-red-900' : ''}
                        `}>
                          {w.status}
                        </span>
                      </div>
                      {w.status === 'Busy' && (
                        <p className="text-xs text-gray-400">
                          Scraping provider <span className="text-purple-300 font-semibold">{w.currentProvider}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      {w.status === 'Busy' && (
                        <>
                          <p className="font-mono text-gray-400">{w.currentJobId?.substr(0, 8)}...</p>
                          <p className="text-[10px] text-purple-400">Elapsed: {w.elapsedSeconds}s</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Browser Pool & Queue stats */}
            <div className="space-y-6">
              {/* Browser Pool Info */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-4">
                <h3 className="font-bold text-gray-200 text-sm border-b border-gray-800 pb-2">🌐 Browser Pool Status</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-850">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block">Contexts</span>
                    <span className="text-lg font-bold text-gray-300">{metrics.open_contexts}</span>
                  </div>
                  <div className="bg-gray-950/60 p-3 rounded-lg border border-gray-850">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block">Active Pages</span>
                    <span className="text-lg font-bold text-gray-300">{metrics.open_pages}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Playwright Pool Health:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-950 text-green-400 border border-green-900 uppercase">
                    {metrics.browser_status}
                  </span>
                </div>
              </div>

              {/* Queue Statistics */}
              {queue && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 space-y-4">
                  <h3 className="font-bold text-gray-200 text-sm border-b border-gray-800 pb-2">📦 Queue Distribution</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                      <span className="text-gray-500">Queued:</span>
                      <span className="font-bold text-gray-300">{queue.queued}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                      <span className="text-gray-500">Running:</span>
                      <span className="font-bold text-blue-400">{queue.running}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                      <span className="text-gray-500">Completed:</span>
                      <span className="font-bold text-green-400">{queue.completed}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800/40 pb-1.5">
                      <span className="text-gray-500">Failed:</span>
                      <span className="font-bold text-red-400">{queue.failed}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Retro Developer Terminal Logs Section */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col h-[400px]">
            {/* Terminal Header */}
            <div className="bg-gray-900 px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 font-mono text-xs text-gray-400 font-bold">leadgen-v3-system-console.log</span>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                      logFilter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 p-5 font-mono text-[11px] text-gray-300 overflow-y-auto space-y-1.5 selection:bg-purple-500/30">
              {filteredLogs.length === 0 ? (
                <p className="text-gray-600 italic">Console output is empty. Polling for logs...</p>
              ) : (
                filteredLogs.map((log, index) => (
                  <div key={index} className="flex gap-4 items-start leading-relaxed hover:bg-gray-900/40 py-0.5 px-1 rounded">
                    <span className="text-gray-600 select-none">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`w-14 shrink-0 uppercase ${getLogLevelStyle(log.level)}`}>
                      [{log.level}]
                    </span>
                    <span className="text-gray-300 break-all">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
