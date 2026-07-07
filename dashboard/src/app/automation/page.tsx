'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ConnectedAccount {
  id: string
  platform: 'facebook' | 'instagram' | 'messenger' | 'whatsapp'
  account_name: string
  oauth_status: string
  webhook_verification_status: string
  health_status: string
  permissions: string[]
  last_tested_at: string | null
}

interface AuditLog {
  id: string
  action: string
  details: string
  user_identifier: string
  created_at: string
}

export default function AutomationDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'inbox' | 'publishing' | 'logs'>('overview')
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch accounts and logs on mount
  async function fetchDashboardData() {
    try {
      const accRes = await fetch('/api/automation/accounts')
      const accData = await accRes.json()
      if (accRes.ok && accData.accounts) {
        setAccounts(accData.accounts)
      }

      const logRes = await fetch('/api/automation/accounts/logs')
      const logData = await logRes.json()
      if (logRes.ok && logData.logs) {
        setAuditLogs(logData.logs)
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 6000)
    return () => clearInterval(interval)
  }, [])

  // Static overview stats
  const stats = [
    { label: 'Connected Channels', count: `${accounts.length}/4`, change: 'Facebook, Insta, WA active', color: 'bg-gradient-to-tr from-green-500/20 to-[#E3B859]/20 border border-green-500/30' },
    { label: 'Publishing Queue', count: '14', change: '4 scheduled for today', color: 'bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30' },
    { label: 'Unresolved Inbound', count: '8', change: '3 IG DMs, 5 WhatsApp', color: 'bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30' },
    { label: 'Failed Jobs / Retries', count: '1', change: 'Auto-retry active', color: 'bg-gradient-to-tr from-pink-500/20 to-red-950/20 border border-red-500/30' },
  ]

  // Mock queues & inbound streams representing Graph API events
  const publishingQueue = [
    { id: 'p1', title: 'Singapore Cafe Promo Post', platform: 'facebook', date: 'Jul 10 at 4:00 PM', status: 'scheduled' },
    { id: 'p2', title: 'Growth Audit Mockup Offer', platform: 'instagram', date: 'Jul 12 at 10:30 AM', status: 'scheduled' },
    { id: 'p3', title: 'Interactive Menu Launch', platform: 'whatsapp', date: 'Jul 14 at 9:00 AM', status: 'queued' }
  ]

  const inboxMessages = [
    { id: 'm1', sender: 'Ashish Shah (Doctor)', text: 'Can I schedule a quick clinic demo?', platform: 'whatsapp', time: '5 mins ago', aiSuggested: 'Hi Dr. Ashish, yes! We have slots open at...' },
    { id: 'm2', sender: '@dr_mumbai_health', text: 'Interested in the social marketing audit package.', platform: 'instagram', time: '18 mins ago', aiSuggested: 'Hello! I can compile a customized health audit...' },
    { id: 'm3', sender: 'Jenny Lim', text: 'Where is your pricing model catalog?', platform: 'messenger', time: '1 hour ago', aiSuggested: 'Hi Jenny! Our plans start from $49/mo. View...' }
  ]

  const workflowRuns = [
    { id: 'w1', name: 'Lead Intake Responder', trigger: 'Instagram DM Webhook', date: 'Just now', status: 'success', duration: '180ms' },
    { id: 'w2', name: 'WhatsApp Appointment Sync', trigger: 'n8n Webhook Node', date: '22 mins ago', status: 'success', duration: '320ms' },
    { id: 'w3', name: 'Master Posting scheduler', trigger: 'Cron Schedule (1h)', date: '1 hour ago', status: 'success', duration: '12ms' },
    { id: 'w4', name: 'DMs Sentiment Classifier', trigger: 'Meta Graph Webhook', date: '3 hours ago', status: 'failed', duration: '94ms' }
  ]

  return (
    <div className="space-y-8 select-none text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Social Automation Suite</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Orchestrate cross-channel publishing, unified AI response engines, and visual content pipelines.</p>
        </div>
        <Link 
          href="/automation/publish" 
          className="rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] text-[#141416] text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors shadow-md"
        >
          📝 Compose Post
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2D2D30] pb-px">
        {[
          { key: 'overview', label: '📊 Overview & Queues' },
          { key: 'channels', label: '🔌 Channels & OAuth' },
          { key: 'inbox', label: '📨 Unified Inbox' },
          { key: 'publishing', label: '📅 Publishing Calendar' },
          { key: 'logs', label: '📋 Webhook & Audit Logs' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab.key 
                ? 'border-purple-500 text-white font-black' 
                : 'border-transparent text-gray-550 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className={`rounded-2xl p-6 flex flex-col justify-between min-h-[140px] shadow-sm ${item.color}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{item.label}</span>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white tracking-tight">{item.count}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.change}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column: Quick Actions & Workflow logs */}
            <div className="md:col-span-2 space-y-6">
              {/* n8n Workflow status */}
              <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2 flex items-center justify-between">
                  <span>🧠 Workflow Execution Pipeline</span>
                  <span className="text-[10px] bg-purple-950/40 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded font-black uppercase tracking-wider">n8n Connected</span>
                </h3>
                <div className="space-y-3">
                  {workflowRuns.map(run => (
                    <div key={run.id} className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">{run.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Triggered by: {run.trigger} • {run.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-gray-500">{run.duration}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          run.status === 'success' 
                            ? 'bg-green-950/40 text-green-400 border border-green-900/30' 
                            : 'bg-red-950/40 text-red-400 border border-red-900/30'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Queues */}
              <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📦 System Job & Worker Queue</h3>
                <div className="grid gap-4 sm:grid-cols-3 text-xs text-gray-400 font-medium">
                  <div className="p-4 bg-[#141416] rounded-xl border border-[#2D2D30] text-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Active Job Queue</span>
                    <strong className="text-2xl font-black text-white">0</strong>
                    <span className="text-[9px] text-green-400 block mt-1">Status: Idle</span>
                  </div>
                  <div className="p-4 bg-[#141416] rounded-xl border border-[#2D2D30] text-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Failed Queue</span>
                    <strong className="text-2xl font-black text-red-400">1</strong>
                    <span className="text-[9px] text-red-500 block mt-1">Failed to write post asset</span>
                  </div>
                  <div className="p-4 bg-[#141416] rounded-xl border border-[#2D2D30] text-center">
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Retry Queue</span>
                    <strong className="text-2xl font-black text-amber-400">1</strong>
                    <span className="text-[9px] text-amber-500 block mt-1">Retrying in 12 mins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Approvals list */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">⏳ Approvals Queue</h3>
                <div className="space-y-3">
                  {[
                    { id: '1', title: 'Growth Audit Offer Post', date: 'Jul 10 at 4:00 PM', channels: 'Instagram, FB', author: 'Agent Gemini' }
                  ].map(item => (
                    <div key={item.id} className="p-4 bg-[#141416] border border-[#2D2D30] rounded-xl text-xs space-y-3">
                      <div>
                        <h4 className="font-bold text-white">{item.title}</h4>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-semibold uppercase tracking-wider">
                          <span>{item.channels}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-2 border-t border-[#2D2D30]/60">
                        <span className="text-gray-400">By: <strong className="text-white">{item.author}</strong></span>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 rounded bg-green-950/40 text-green-400 hover:bg-green-900/30 border border-green-900/30 font-bold uppercase tracking-wider">Approve</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANNELS & OAUTH STATUS TAB */}
      {activeTab === 'channels' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D2D30]">
            <h3 className="text-md font-bold text-white">Platform Credentials & OAuth Scope</h3>
            <Link href="/automation/accounts" className="text-xs bg-purple-600 hover:bg-purple-750 text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl">
              🔌 Manage Credentials
            </Link>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12 bg-[#18181A] border border-[#2D2D30] rounded-2xl">
              <p className="text-xs text-gray-500 font-semibold italic">No connected platform settings configured yet.</p>
              <p className="text-[10px] text-gray-650 mt-1">Configure Facebook App secrets and access tokens securely in the Accounts page.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {accounts.map(acc => (
                <div key={acc.id} className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4 text-xs font-semibold">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-bold text-white block text-sm">{acc.account_name}</span>
                      <span className="text-[9px] text-gray-500 font-mono block">Platform: {acc.platform.toUpperCase()}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      acc.oauth_status === 'connected' 
                        ? 'bg-green-950/40 text-green-400 border border-green-900/30' 
                        : 'bg-red-950/40 text-red-400 border border-red-900/30'
                    }`}>
                      {acc.oauth_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-[#2D2D30]/60 py-3 text-[10px] text-gray-400">
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Webhook Delivery</span>
                      <span className={acc.webhook_verification_status === 'verified' ? 'text-green-400' : 'text-red-400'}>
                        {acc.webhook_verification_status === 'verified' ? '✓ Verified / Active' : '✗ Failed Verification'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase text-gray-500 block mb-0.5">Provider Health</span>
                      <span className={acc.health_status === 'healthy' ? 'text-green-400' : 'text-amber-400'}>
                        ● {acc.health_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {acc.permissions && acc.permissions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase text-gray-500 block">Granted Graph API Scope:</span>
                      <div className="flex flex-wrap gap-1">
                        {acc.permissions.map((p, idx) => (
                          <span key={idx} className="bg-[#141416] border border-[#2D2D30] text-[8px] font-mono px-1.5 py-0.5 rounded text-gray-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {acc.last_tested_at && (
                    <div className="text-[9px] text-gray-500 font-medium">
                      Last Connection Verify Check: {new Date(acc.last_tested_at).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UNIFIED INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D2D30]">
            <h3 className="text-md font-bold text-white">Unified Conversational Inbox</h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Active Channels: IG Business DMs, FB Page Messages, WhatsApp Cloud API</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* List panel */}
            <div className="md:col-span-1 rounded-2xl border border-[#2D2D30] bg-[#18181A] p-4 space-y-3 h-fit">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Inbound Message Events</span>
              <div className="space-y-2.5">
                {inboxMessages.map(msg => (
                  <div key={msg.id} className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl space-y-1.5 cursor-pointer hover:border-gray-600 transition-colors text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white">{msg.sender}</span>
                      <span className="text-[9px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-gray-400 truncate">{msg.text}</p>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-950/40 text-purple-400 border border-purple-900/30 uppercase tracking-wider font-mono">
                      {msg.platform}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Response simulator */}
            <div className="md:col-span-2 rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 flex flex-col justify-between min-h-[400px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-[#2D2D30] pb-3">
                  <div>
                    <h4 className="font-bold text-white">Ashish Shah (Doctor)</h4>
                    <span className="text-[9px] text-green-400">● Active on WhatsApp Cloud</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Correlation ID: meta-waba-90281</span>
                </div>

                {/* Dialog thread */}
                <div className="space-y-4 py-4 text-xs font-semibold">
                  <div className="flex gap-3 justify-end">
                    <div className="bg-purple-650/30 border border-purple-900/30 p-3 rounded-2xl max-w-[70%]">
                      <p className="text-white font-medium">Hello Dr. Shah! We found your profile under 500 followers and wanted to check if you need patient automation setups.</p>
                      <span className="text-[8px] text-purple-400 block mt-1 text-right">Outbound Agent • Sent</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-start">
                    <div className="bg-[#141416] border border-[#2D2D30] p-3 rounded-2xl max-w-[70%]">
                      <p className="text-gray-300 font-medium">Can I schedule a quick clinic demo?</p>
                      <span className="text-[8px] text-gray-500 block mt-1">Inbound (WhatsApp) • 5 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action reply footer */}
              <div className="border-t border-[#2D2D30] pt-4 space-y-3">
                <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-[10px] text-purple-400 leading-relaxed font-semibold">
                  🧠 AI Suggested Reply: &quot;Hi Dr. Ashish, yes! We have slots open today. Would 4 PM work?&quot;
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type customized reply..."
                    className="flex-1 rounded-xl bg-[#141416] border border-[#2D2D30] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gray-500"
                  />
                  <button className="bg-purple-650 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded-xl transition-colors">
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISHING QUEUE TAB */}
      {activeTab === 'publishing' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D2D30]">
            <h3 className="text-md font-bold text-white">Platform Content Publishing Queue</h3>
            <span className="text-xs text-gray-500 font-semibold">Queue size: 3 post assets scheduled</span>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Scheduled Queue list */}
            <div className="md:col-span-2 rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📅 Outbound Posts Awaiting Dispatch</h3>
              <div className="space-y-3.5">
                {publishingQueue.map(post => (
                  <div key={post.id} className="p-4 bg-[#141416] border border-[#2D2D30] rounded-xl flex justify-between items-center text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-white font-bold block">{post.title}</span>
                      <span className="text-[10px] text-gray-500 font-medium">Platform: {post.platform.toUpperCase()} • Dispatch Target: {post.date}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-purple-950/40 text-purple-400 border border-purple-900/30">
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Summary card */}
            <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📊 Campaign Analytics</h3>
              <div className="space-y-3 text-xs text-gray-400 font-medium">
                <div className="flex justify-between">
                  <span>Total Posts Sent</span>
                  <span className="text-white font-bold">142</span>
                </div>
                <div className="flex justify-between">
                  <span>Inbound Lead Conversion</span>
                  <span className="text-white font-bold">18.4%</span>
                </div>
                <div className="flex justify-between">
                  <span>Meta Webhooks Dispatched</span>
                  <span className="text-white font-bold">12,042</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBHOOKS & SYSTEM AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-[#2D2D30]">
            <h3 className="text-md font-bold text-white">System Webhook & API Audit Logs</h3>
            <button 
              onClick={fetchDashboardData}
              className="text-xs bg-[#222225] border border-[#2D2D30] hover:bg-[#2A2A2E] text-white font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors"
            >
              🔄 Refresh Logs
            </button>
          </div>

          <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2 flex items-center justify-between">
              <span>📋 Live DB-persisted Action logs</span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Entries loaded: {auditLogs.length}</span>
            </h3>
            
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-4 text-center">No audit logs found. Try connecting a platform to write event traces.</p>
            ) : (
              <div className="divide-y divide-[#2D2D30]/60 space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="pt-3.5 flex gap-4 items-start text-xs font-semibold">
                    <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      log.action.includes('FAILED') || log.action.includes('ERROR') ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{log.action}</span>
                        <span className="text-[9px] text-gray-500 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-400 font-medium leading-relaxed">{log.details}</p>
                      <span className="text-[9px] text-gray-600 block mt-0.5">Executor ID: {log.user_identifier}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
