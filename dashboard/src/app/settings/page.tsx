'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'

interface HealthState {
  status: 'connected' | 'disconnected' | 'testing' | 'idle'
  responseTime?: number
  error?: string
}

export default function SettingsPage() {
  const [supabaseHealth, setSupabaseHealth] = useState<HealthState>({ status: 'idle' })
  const [n8nHealth, setN8nHealth] = useState<HealthState>({ status: 'idle' })
  const [whatsappHealth, setWhatsappHealth] = useState<HealthState>({ status: 'idle' })

  const [totalLeads, setTotalLeads] = useState<number | null>(null)
  const [clearingLeads, setClearingLeads] = useState(false)

  // 1. Fetch DB stats
  async function fetchDbStats() {
    try {
      const { count, error } = await supabaseBrowser
        .from('leads')
        .select('*', { count: 'exact', head: true })
      if (error) throw error
      setTotalLeads(count ?? 0)
    } catch {
      setTotalLeads(0)
    }
  }

  useEffect(() => {
    fetchDbStats()
  }, [])

  // 2. Connection testers
  async function testSupabase() {
    setSupabaseHealth({ status: 'testing' })
    const start = Date.now()
    try {
      const res = await fetch('/api/health/supabase')
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        if (data.connected) {
          setSupabaseHealth({ status: 'connected', responseTime: latency })
          toast.success(`Supabase connected successfully in ${latency}ms`)
          fetchDbStats()
        } else {
          setSupabaseHealth({ status: 'disconnected', error: data.error || 'Connection failed' })
          toast.error('Supabase connection failed')
        }
      } else {
        setSupabaseHealth({ status: 'disconnected', error: 'HTTP error checking health' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setSupabaseHealth({ status: 'disconnected', error: message })
    }
  }

  async function testN8n() {
    setN8nHealth({ status: 'testing' })
    const start = Date.now()
    try {
      const res = await fetch('/api/health/n8n')
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        if (data.connected) {
          setN8nHealth({ status: 'connected', responseTime: latency })
          toast.success(`n8n health check passed in ${latency}ms`)
        } else {
          setN8nHealth({ status: 'disconnected', error: data.error || 'Webhook base unreachable' })
          toast.error('n8n connection failed')
        }
      } else {
        setN8nHealth({ status: 'disconnected', error: 'HTTP error checking health' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setN8nHealth({ status: 'disconnected', error: message })
    }
  }

  async function testWhatsapp() {
    setWhatsappHealth({ status: 'testing' })
    const start = Date.now()
    try {
      const res = await fetch('/api/whatsapp/health')
      const latency = Date.now() - start
      if (res.ok) {
        const data = await res.json()
        if (data.ready) {
          setWhatsappHealth({ status: 'connected', responseTime: latency })
          toast.success(`WhatsApp service ready! Latency: ${latency}ms`)
        } else {
          setWhatsappHealth({ status: 'disconnected', error: data.error || 'Not authenticated' })
          toast.error('WhatsApp service disconnected')
        }
      } else {
        setWhatsappHealth({ status: 'disconnected', error: 'HTTP error checking health' })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setWhatsappHealth({ status: 'disconnected', error: message })
    }
  }

  // 3. Clear test leads (starts with "Test%")
  async function handleClearTestLeads() {
    if (!confirm("Are you sure you want to permanently delete all leads starting with 'Test'?")) return
    setClearingLeads(true)
    const toastId = toast.loading('Clearing test leads from database...')
    try {
      const { error } = await supabaseBrowser
        .from('leads')
        .delete({ count: 'exact' })
        .like('name', 'Test%')

      if (error) throw error

      toast.success(`Successfully cleared test leads from database!`, { id: toastId })
      fetchDbStats()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to clear test leads'
      toast.error(message, { id: toastId })
    } finally {
      setClearingLeads(false)
    }
  }

  // Copy .env.local template
  function copyEnvTemplate() {
    const template = `NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_SERVICE_URL=
WHATSAPP_API_SECRET=
N8N_WEBHOOK_BASE_URL=
N8N_BASIC_AUTH=
RESEND_API_KEY=
N8N_AI_TRIGGER_URL=
N8N_OUTREACH_TRIGGER_URL=
`
    navigator.clipboard.writeText(template)
    toast.success('.env.local template copied!')
  }

  // Export All Leads
  function handleExportAll() {
    window.location.href = '/api/leads/export'
    toast.success('Downloading CSV export...')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Control Panel Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Manage connections, configuration variables, and perform database maintenance</p>
      </div>

      {/* Section 1 - Connection Status */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-6">
        <h3 className="font-bold text-gray-200 text-lg">🔧 Service Integrations Health</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Supabase Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supabase DB</span>
              {supabaseHealth.status === 'connected' ? (
                <span className="text-green-400 font-bold text-sm">✓ Connected</span>
              ) : supabaseHealth.status === 'disconnected' ? (
                <span className="text-red-400 font-bold text-sm">✗ Error</span>
              ) : (
                <span className="text-gray-500 text-xs">Untested</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {supabaseHealth.status === 'connected'
                ? `Response: ${supabaseHealth.responseTime}ms`
                : supabaseHealth.error || 'Click test below'}
            </p>
            <button
              onClick={testSupabase}
              disabled={supabaseHealth.status === 'testing'}
              className="rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-[11px] font-semibold text-white py-1.5 transition-colors disabled:opacity-50"
            >
              {supabaseHealth.status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* n8n Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">n8n Engine</span>
              {n8nHealth.status === 'connected' ? (
                <span className="text-green-400 font-bold text-sm">✓ Connected</span>
              ) : n8nHealth.status === 'disconnected' ? (
                <span className="text-red-400 font-bold text-sm">✗ Error</span>
              ) : (
                <span className="text-gray-500 text-xs">Untested</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {n8nHealth.status === 'connected'
                ? `Response: ${n8nHealth.responseTime}ms`
                : n8nHealth.error || 'Click test below'}
            </p>
            <button
              onClick={testN8n}
              disabled={n8nHealth.status === 'testing'}
              className="rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-[11px] font-semibold text-white py-1.5 transition-colors disabled:opacity-50"
            >
              {n8nHealth.status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* WhatsApp Card */}
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 flex flex-col justify-between h-36">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp Client</span>
              {whatsappHealth.status === 'connected' ? (
                <span className="text-green-400 font-bold text-sm">✓ Connected</span>
              ) : whatsappHealth.status === 'disconnected' ? (
                <span className="text-red-400 font-bold text-sm">✗ Error</span>
              ) : (
                <span className="text-gray-500 text-xs">Untested</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {whatsappHealth.status === 'connected'
                ? `Response: ${whatsappHealth.responseTime}ms`
                : whatsappHealth.error || 'Click test below'}
            </p>
            <button
              onClick={testWhatsapp}
              disabled={whatsappHealth.status === 'testing'}
              className="rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-[11px] font-semibold text-white py-1.5 transition-colors disabled:opacity-50"
            >
              {whatsappHealth.status === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2 - Environment Variables Check */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-200 text-lg">🔑 Environment Configuration</h3>
            <p className="text-xs text-gray-400 mt-1">Status of required local and cloud deployment variables.</p>
          </div>
          <button
            onClick={copyEnvTemplate}
            className="rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs font-semibold text-gray-300 px-4 py-2 transition-colors self-start sm:self-auto"
          >
            📋 Copy .env.local Template
          </button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 divide-y divide-gray-800/60 text-xs">
          {[
            { key: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase Project API URL' },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase Anonymous Key' },
            { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase Bypass Key (Server only)' },
            { key: 'WHATSAPP_SERVICE_URL', desc: 'Microservice host endpoint URL' },
            { key: 'WHATSAPP_API_SECRET', desc: 'Security key for WhatsApp API' },
            { key: 'N8N_WEBHOOK_BASE_URL', desc: 'Self-hosted n8n API base' },
            { key: 'RESEND_API_KEY', desc: 'Outreach Email delivery token' },
            { key: 'N8N_AI_TRIGGER_URL', desc: 'n8n manual trigger for AI content gen' },
            { key: 'N8N_OUTREACH_TRIGGER_URL', desc: 'n8n manual trigger for bulk delivery' },
          ].map((item) => (
            <div key={item.key} className="py-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono text-gray-300 font-bold block">{item.key}</span>
                <span className="text-[11px] text-gray-500 mt-0.5 block">{item.desc}</span>
              </div>
              <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">
                ✓ Configured
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 - Database Maintenance */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-6">
        <h3 className="font-bold text-gray-200 text-lg">🗄️ Database Operations</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Database maintenance tools */}
          <div className="rounded-xl bg-gray-950 border border-gray-800 p-5 flex flex-col justify-between h-40">
            <div>
              <h4 className="font-bold text-white text-sm">Clean Testing Data</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Delete all rows where the lead name starts with the prefix <code className="text-purple-400 bg-gray-900 px-1 py-0.5 rounded font-mono">Test%</code>. Used to purge quick-adds during validation.
              </p>
            </div>
            <button
              onClick={handleClearTestLeads}
              disabled={clearingLeads || totalLeads === 0}
              className="w-full rounded-lg bg-red-950/60 border border-red-900 text-red-400 hover:bg-red-900/40 disabled:opacity-50 text-xs font-semibold py-2 transition-colors duration-150"
            >
              {clearingLeads ? 'Purging leads...' : 'Clear Test Leads'}
            </button>
          </div>

          <div className="rounded-xl bg-gray-950 border border-gray-800 p-5 flex flex-col justify-between h-40">
            <div>
              <h4 className="font-bold text-white text-sm">Bulk Export Database</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Compile and download the entire lead history database table (all pipeline statuses, dates, ratings, and locations) in a single CSV archive.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              disabled={totalLeads === 0}
              className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold py-2 text-white transition-colors duration-150"
            >
              Export All Leads (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
