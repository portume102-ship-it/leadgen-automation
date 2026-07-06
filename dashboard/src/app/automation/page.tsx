'use client'

import React from 'react'
import Link from 'next/link'

export default function AutomationDashboardPage() {
  const stats = [
    { label: 'Connected Accounts', count: '4/6', change: 'Facebook, Insta, WA active', color: 'bg-gradient-to-tr from-green-500/20 to-[#E3B859]/20 border border-green-500/30' },
    { label: 'Scheduled Queue', count: '12', change: 'Next dispatch in 2 hours', color: 'bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/30' },
    { label: 'Unresolved Inbound', count: '5', change: '3 WhatsApp, 2 Messenger', color: 'bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30' },
    { label: 'Monthly Reach', count: '245.8K', change: '+14.2% since last week', color: 'bg-gradient-to-tr from-pink-500/20 to-[#E3B859]/20 border border-[#E3B859]/30' },
  ]

  const recentActivities = [
    { time: '10 mins ago', title: 'Post Published', desc: 'Outbound campaign post published to Instagram Page "Zarss Dev Singapore".', status: 'success' },
    { time: '40 mins ago', title: 'Webhook Dispatched', desc: 'Received WhatsApp incoming contact query. Intent: neutral.', status: 'info' },
    { time: '2 hours ago', title: 'Token Expired Warning', desc: 'Facebook Access Token for Client Staging Page expires in 3 days. Reauth recommended.', status: 'warning' },
    { time: '5 hours ago', title: 'Workflow Executed', desc: 'n8n Master Orchestrator workflow triggered on Lead Intake Webhook event.', status: 'success' },
  ]

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Social Automation Suite</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Orchestrate cross-channel publishing, unified AI response engines, and visual content pipelines.</p>
        </div>
        <Link 
          href="/automation/publish" 
          className="rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] text-[#141416] text-xs font-bold uppercase tracking-wider px-6 py-3 transition-colors shadow-md"
        >
          📝 Compose Post
        </Link>
      </div>

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

      {/* Grid Content Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Quick Actions & Connected status */}
        <div className="md:col-span-2 space-y-6">
          {/* Quick Setup instructions */}
          <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">🎯 Getting Started with Automation</h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs text-gray-400">
              <div className="space-y-1.5 p-4 bg-[#141416] rounded-xl border border-[#2D2D30]">
                <span className="text-lg">1️⃣</span>
                <h4 className="font-bold text-white">Link Channels</h4>
                <p className="text-[10px] leading-relaxed">Connect your Facebook page, Instagram DMs, or WhatsApp account API keys.</p>
              </div>
              <div className="space-y-1.5 p-4 bg-[#141416] rounded-xl border border-[#2D2D30]">
                <span className="text-lg">2️⃣</span>
                <h4 className="font-bold text-white">Draft & Schedule</h4>
                <p className="text-[10px] leading-relaxed">Upload media assets, compose platform variations, and pick schedule slots.</p>
              </div>
              <div className="space-y-1.5 p-4 bg-[#141416] rounded-xl border border-[#2D2D30]">
                <span className="text-lg">3️⃣</span>
                <h4 className="font-bold text-white">Configure AI Rules</h4>
                <p className="text-[10px] leading-relaxed">Set automated reply rules, lead capture templates, and intent conditions.</p>
              </div>
            </div>
          </div>

          {/* Activity Log summary */}
          <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📋 Recent Action logs</h3>
            <div className="divide-y divide-[#2D2D30]/60 space-y-3.5">
              {recentActivities.map((act, i) => (
                <div key={i} className="pt-3.5 flex gap-4 items-start text-xs">
                  <span className={`w-2.5 h-2.5 mt-1 rounded-full flex-shrink-0 ${
                    act.status === 'success' ? 'bg-green-500' :
                    act.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{act.title}</span>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{act.time}</span>
                    </div>
                    <p className="text-gray-400 font-medium leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pending Approvals list */}
        <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">⏳ Approvals Workflow Queue</h3>
          <div className="space-y-3">
            {[
              { id: '1', title: 'Growth Audit Mockup Offer', date: 'Jul 10 at 4:00 PM', channels: 'Instagram, FB', author: 'Agent Gemini' },
              { id: '2', title: 'Singapore Cafe Promo Post', date: 'Jul 12 at 10:30 AM', channels: 'Facebook', author: 'Marketer Paul' }
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
                    <button className="px-2 py-1 rounded bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-900/30 font-bold uppercase tracking-wider">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
