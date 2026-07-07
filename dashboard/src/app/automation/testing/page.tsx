'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

interface TestLog {
  target: string
  status: 'success' | 'error' | 'pending'
  duration: number
  request: Record<string, unknown>
  response: Record<string, unknown>
  timestamp: string
}

const TEST_ACTIONS = [
  { id: 'meta_app', label: 'Test Meta App', icon: '🔵', desc: 'Validates App ID & Secret connectivity.' },
  { id: 'facebook', label: 'Test Facebook Page', icon: '📘', desc: 'Fetches page info from Graph API.' },
  { id: 'instagram', label: 'Test Instagram', icon: '📸', desc: 'Fetches IG business profile details.' },
  { id: 'messenger', label: 'Test Messenger', icon: '💬', desc: 'Checks Messenger webhook subscription.' },
  { id: 'webhook', label: 'Test Webhook', icon: '🔗', desc: 'Fires a test Meta webhook ping.' },
  { id: 'oauth', label: 'Test OAuth', icon: '🔑', desc: 'Validates OAuth token status and scopes.' },
  { id: 'permissions', label: 'Test Permissions', icon: '🛡️', desc: 'Lists all granted Graph API permissions.' },
  { id: 'post_facebook', label: 'Test FB Post', icon: '📝', desc: 'Posts a test message to Facebook Page feed.' },
  { id: 'post_instagram', label: 'Test IG Post', icon: '🖼️', desc: 'Creates a test Instagram media container.' },
  { id: 'dm_instagram', label: 'Test IG DM', icon: '✉️', desc: 'Sends a test DM via Instagram messaging.' },
]

export default function TestingPage() {
  const [logs, setLogs] = useState<TestLog[]>([])
  const [running, setRunning] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<TestLog | null>(null)

  async function runTest(target: string) {
    setRunning(target)
    const start = Date.now()

    // Optimistically add pending log
    const pendingLog: TestLog = {
      target,
      status: 'pending',
      duration: 0,
      request: { endpoint: `/api/meta/test`, params: { target } },
      response: {},
      timestamp: new Date().toISOString()
    }
    setLogs(prev => [pendingLog, ...prev])

    try {
      const res = await fetch(`/api/meta/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      })
      const data = await res.json()
      const duration = Date.now() - start

      const log: TestLog = {
        target,
        status: res.ok ? 'success' : 'error',
        duration,
        request: { method: 'POST', endpoint: `/api/meta/test`, body: { target } },
        response: data,
        timestamp: new Date().toISOString()
      }

      setLogs(prev => [log, ...prev.filter(l => !(l.target === target && l.status === 'pending'))])
      setSelectedLog(log)

      if (res.ok) toast.success(`${target} test passed! (${duration}ms)`)
      else toast.error(`${target} test failed.`)
    } catch {
      const duration = Date.now() - start
      const log: TestLog = {
        target,
        status: 'error',
        duration,
        request: { method: 'POST', endpoint: `/api/meta/test`, body: { target } },
        response: { error: 'Network error or API unreachable.' },
        timestamp: new Date().toISOString()
      }
      setLogs(prev => [log, ...prev.filter(l => !(l.target === target && l.status === 'pending'))])
      setSelectedLog(log)
      toast.error(`${target} test errored.`)
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="space-y-6 text-white select-none">
      {/* Header */}
      <div className="border-b border-[#2D2D30] pb-6">
        <h1 className="text-3xl font-black tracking-tight">🧪 API Test Console</h1>
        <p className="mt-1 text-sm text-gray-500">Run live diagnostics against your Meta Graph API connections and view raw request/response payloads.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test Buttons */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Test Actions</h2>
          {TEST_ACTIONS.map(action => (
            <button
              key={action.id}
              onClick={() => runTest(action.id)}
              disabled={running === action.id}
              className={`w-full p-4 rounded-xl border text-left transition-all group ${
                running === action.id
                  ? 'bg-purple-950/30 border-purple-800/40 opacity-60 cursor-not-allowed'
                  : 'bg-[#18181A] border-[#2D2D30] hover:border-gray-500 hover:bg-[#1E1E20]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white block">{action.label}</span>
                  <span className="text-[10px] text-gray-500">{action.desc}</span>
                </div>
                {running === action.id && (
                  <span className="text-[10px] text-purple-400 font-bold uppercase animate-pulse">Running...</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Log list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Execution Log ({logs.length})</h2>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-gray-500 hover:text-red-400 font-bold uppercase tracking-wider"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-xs">No tests run yet.</div>
            ) : logs.map((log, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedLog(log)}
                className={`w-full p-3 rounded-xl border text-left transition-colors ${
                  selectedLog === log ? 'border-gray-500 bg-[#1E1E20]' : 'border-[#2D2D30] bg-[#18181A] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.status === 'success' ? 'bg-green-500' :
                    log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block">{log.target}</span>
                    <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    log.status === 'success' ? 'text-green-400' :
                    log.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {log.status === 'pending' ? '...' : `${log.duration}ms`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Pane */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Payload Inspector</h2>
          {selectedLog ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                selectedLog.status === 'success'
                  ? 'bg-green-950/30 border-green-900/40'
                  : selectedLog.status === 'error'
                    ? 'bg-red-950/30 border-red-900/40'
                    : 'bg-yellow-950/30 border-yellow-900/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  selectedLog.status === 'success' ? 'bg-green-500' :
                  selectedLog.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                }`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  selectedLog.status === 'success' ? 'text-green-400' :
                  selectedLog.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                }`}>{selectedLog.status}</span>
                <span className="text-gray-500 text-xs ml-auto">{selectedLog.duration}ms</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Request</span>
                <pre className="bg-[#0E0E10] border border-[#2D2D30] rounded-xl p-3 text-[10px] text-gray-300 font-mono overflow-auto max-h-40">
{JSON.stringify(selectedLog.request, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Response</span>
                <pre className="bg-[#0E0E10] border border-[#2D2D30] rounded-xl p-3 text-[10px] text-gray-300 font-mono overflow-auto max-h-40">
{JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600 text-xs">
              <span className="text-4xl mb-3">🔬</span>
              <p>Run a test to see the payload inspector.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
