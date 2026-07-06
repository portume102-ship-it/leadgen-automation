'use client'

import React from 'react'
import toast from 'react-hot-toast'

export default function ConnectedAccountsPage() {
  const accounts = [
    {
      platform: 'Facebook Pages',
      platformKey: 'facebook',
      icon: '📘',
      desc: 'Publish posts, sync comments, and run page automation pipelines.',
      accountsList: [
        { name: 'Zarss Dev Singapore', status: 'connected', details: 'Authorized Page ID: 902814892' },
        { name: 'Staging Restaurant Cafe', status: 'needs_reauth', details: 'Token expires soon. Reauthorization required.' },
      ]
    },
    {
      platform: 'Instagram Business',
      platformKey: 'instagram',
      icon: '📸',
      desc: 'Schedule visual posts, publish reels, and manage unified direct messages.',
      accountsList: [
        { name: '@zarss_dev', status: 'connected', details: 'Business account link active' }
      ]
    },
    {
      platform: 'Messenger Platform',
      platformKey: 'messenger',
      icon: '💬',
      desc: 'Power ManyChat-style flow triggers and direct conversation responder bots.',
      accountsList: [
        { name: 'Zarss Dev Inbox Chat', status: 'connected', details: 'Webhook event delivery 100%' },
        { name: 'Mock Staging Support', status: 'expired', details: 'Access token expired.' }
      ]
    },
    {
      platform: 'WhatsApp Cloud API',
      platformKey: 'whatsapp',
      icon: '🟢',
      desc: 'Dispatch structured campaign templates and interactive menu options.',
      accountsList: [
        { name: '+65 9182 7304 (Official)', status: 'connected', details: 'WABA Account active' },
        { name: '+91 98765 43210 (Staging)', status: 'not_connected', details: 'API keys unconfigured' }
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-950/40 text-green-400 border border-green-900/30">Connected</span>
      case 'needs_reauth':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/30">Needs Reauth</span>
      case 'expired':
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/30">Expired</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">Not Connected</span>
    }
  }

  const handleConnectAccount = (platform: string) => {
    toast(`Connecting ${platform} via OAuth dialog... (Skeleton Trigger)`, { icon: '🔗' })
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Connected Accounts</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Link page endpoints, OAuth credentials, and secure API access tokens for publishing and messaging.</p>
      </div>

      {/* Grid of integrations */}
      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((acc) => (
          <div key={acc.platform} className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{acc.icon}</span>
                <h3 className="text-lg font-bold text-white tracking-tight">{acc.platform}</h3>
              </div>
              <p className="text-xs text-gray-405 leading-relaxed font-semibold">{acc.desc}</p>
            </div>

            {/* List of active account endpoints connected */}
            <div className="space-y-3 pt-4 border-t border-[#2D2D30]/60">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Linked Endpoints</span>
              <div className="space-y-2.5">
                {acc.accountsList.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-gray-500 font-medium mt-0.5 block">{item.details}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleConnectAccount(acc.platform)}
                className="w-full rounded-xl bg-[#222225] border border-[#2D2D30] hover:bg-[#2A2A2E] text-xs font-bold uppercase tracking-wider text-white py-3 transition-colors shadow-sm"
              >
                + Link New {acc.platform.split(' ')[0]} Account
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
