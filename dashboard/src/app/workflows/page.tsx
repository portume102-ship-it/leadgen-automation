'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabaseBrowser } from '@/lib/supabase'

export default function WorkflowsPage() {
  const [totalLeads, setTotalLeads] = useState<number | null>(null)
  const [pendingAi, setPendingAi] = useState<number | null>(null)
  const [readyOutreach, setReadyOutreach] = useState<number | null>(null)

  const [triggeringAi, setTriggeringAi] = useState(false)
  const [triggeringOutreach, setTriggeringOutreach] = useState(false)

  const [lastAiTrigger, setLastAiTrigger] = useState<string | null>(null)
  const [lastOutreachTrigger, setLastOutreachTrigger] = useState<string | null>(null)

  const webhookUrl = `${process.env.NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL || 'https://n8n-production-b85da.up.railway.app'}/webhook/leads`

  // Fetch counts from Supabase
  async function fetchCounts() {
    try {
      // 1. Total leads
      const totalRes = await supabaseBrowser
        .from('leads')
        .select('*', { count: 'exact', head: true })
      setTotalLeads(totalRes.count ?? 0)

      // 2. Pending AI (where ai_message_whatsapp is null and status is new)
      const pendingRes = await supabaseBrowser
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .is('ai_message_whatsapp', null)
      setPendingAi(pendingRes.count ?? 0)

      // 3. Ready outreach (where status is new and ai_message_whatsapp is not null)
      const readyRes = await supabaseBrowser
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
        .not('ai_message_whatsapp', 'is', null)
      setReadyOutreach(readyRes.count ?? 0)
    } catch (err) {
      console.error('Error fetching workflow stats:', err)
    }
  }

  useEffect(() => {
    fetchCounts()
    setLastAiTrigger(localStorage.getItem('leadgen_last_ai_trigger'))
    setLastOutreachTrigger(localStorage.getItem('leadgen_last_outreach_trigger'))

    const interval = setInterval(fetchCounts, 20000)
    return () => clearInterval(interval)
  }, [])

  // Trigger AI Personalise
  async function handleTriggerAi() {
    setTriggeringAi(true)
    const toastId = toast.loading('Triggering Gemini AI Personalisation...')
    try {
      const res = await fetch('/api/workflows/trigger-ai', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to trigger AI workflow')
      }
      toast.success('AI Personalisation workflow triggered!', { id: toastId })
      const nowStr = new Date().toLocaleString()
      localStorage.setItem('leadgen_last_ai_trigger', nowStr)
      setLastAiTrigger(nowStr)
      fetchCounts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger AI workflow'
      toast.error(message, { id: toastId })
    } finally {
      setTriggeringAi(false)
    }
  }

  // Trigger Outreach
  async function handleTriggerOutreach() {
    setTriggeringOutreach(true)
    const toastId = toast.loading('Triggering outreach workflow...')
    try {
      const res = await fetch('/api/workflows/trigger-outreach', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to trigger outreach workflow')
      }
      toast.success('Outreach workflow triggered successfully!', { id: toastId })
      const nowStr = new Date().toLocaleString()
      localStorage.setItem('leadgen_last_outreach_trigger', nowStr)
      setLastOutreachTrigger(nowStr)
      fetchCounts()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to trigger outreach workflow'
      toast.error(message, { id: toastId })
    } finally {
      setTriggeringOutreach(false)
    }
  }

  // Helper to copy Webhook URL to clipboard
  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied to clipboard!')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Workflow Controls</h1>
        <p className="mt-1 text-sm text-gray-400">Trigger and monitor self-hosted n8n automation pipelines</p>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 - Lead Intake */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col justify-between h-full hover:border-gray-700 transition-colors duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-200 text-lg flex items-center gap-2">
                <span>📥</span> Lead Intake
              </h3>
              <span className="rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-semibold px-2 py-0.5">
                Always Active
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Receives leads from scraper via webhook and stores them in Supabase.
            </p>

            <div className="rounded-lg bg-gray-950 border border-gray-800/80 p-3">
              <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Webhook Endpoint URL</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-300 font-mono truncate select-all">{webhookUrl}</span>
                <button
                  onClick={copyWebhookUrl}
                  className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Copy URL"
                  aria-label="Copy Webhook URL"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Total Leads in DB:</span>
            <strong className="text-white">{totalLeads === null ? '...' : totalLeads}</strong>
          </div>
        </div>

        {/* Card 2 - AI Personalise */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col justify-between h-full hover:border-gray-700 transition-colors duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-200 text-lg flex items-center gap-2">
                <span>🤖</span> AI Personalise
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Generates personalized WhatsApp and email outreach messages using Gemini AI.
            </p>

            <div className="rounded-lg bg-gray-950 border border-gray-800/80 p-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Pending AI:</span>
              <strong className="text-xl font-black text-white">{pendingAi === null ? '...' : pendingAi} leads</strong>
            </div>

            <button
              onClick={handleTriggerAi}
              disabled={triggeringAi}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white py-2.5 transition-colors"
            >
              {triggeringAi && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              ▶ Trigger Now
            </button>
            <p className="text-[10px] text-gray-500 text-center italic">Also runs automatically every 5 minutes</p>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
            <span>Last Triggered:</span>
            <span className="text-gray-300 font-medium">{lastAiTrigger || 'Never'}</span>
          </div>
        </div>

        {/* Card 3 - Outreach */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col justify-between h-full hover:border-gray-700 transition-colors duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-200 text-lg flex items-center gap-2">
                <span>📤</span> Outreach
              </h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dispatches ready WhatsApp and email outreach templates to Leads.
            </p>

            <div className="rounded-lg bg-gray-950 border border-gray-800/80 p-4 flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Ready to Send:</span>
              <strong className="text-xl font-black text-white">{readyOutreach === null ? '...' : readyOutreach} leads</strong>
            </div>

            <button
              onClick={handleTriggerOutreach}
              disabled={triggeringOutreach}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white py-2.5 transition-colors"
            >
              {triggeringOutreach && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              ▶ Trigger Now
            </button>
            <p className="text-[10px] text-gray-500 text-center italic">Also runs automatically every hour</p>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
            <span>Last Triggered:</span>
            <span className="text-gray-300 font-medium">{lastOutreachTrigger || 'Never'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
