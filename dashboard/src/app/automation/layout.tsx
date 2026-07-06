'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AutomationLayoutProps {
  children: React.ReactNode
}

export default function AutomationLayout({ children }: AutomationLayoutProps) {
  const pathname = usePathname()
  const [activeWorkspace, setActiveWorkspace] = useState('Zarss Marketing Workspace')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const menuItems = [
    { name: 'Dashboard', href: '/automation', icon: '📊' },
    { name: 'Publish Post', href: '/automation/publish', icon: '📝' },
    { name: 'Content Calendar', href: '/automation/calendar', icon: '📅' },
    { name: 'Unified Inbox', href: '/automation/inbox', icon: '📥' },
    { name: 'Media Library', href: '/automation/media', icon: '🖼️' },
    { name: 'Accounts Manager', href: '/automation/accounts', icon: '🔑' },
    { name: 'n8n Workflows', href: '/automation/workflows', icon: '⚙️' },
    { name: 'Analytics Insights', href: '/automation/analytics', icon: '📈' },
    { name: 'Audit Logs', href: '/automation/logs', icon: '📋' },
    { name: 'Module Settings', href: '/automation/settings', icon: '⚙️' },
  ]

  // Helper to extract section name for Breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean)
    return parts.map((part, index) => {
      const href = '/' + parts.slice(0, index + 1).join('/')
      const name = part.charAt(0).toUpperCase() + part.slice(1)
      return { name, href }
    })
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="flex min-h-screen bg-[#141416] text-[#E4E3DD] antialiased font-sans">
      {/* Dynamic Command Palette overlay */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1E] border border-[#2D2D30] rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#2D2D30] pb-3">
              <span className="text-xs font-bold text-[#E3B859] uppercase tracking-wider">⚡ Search Actions & Commands</span>
              <button onClick={() => setCommandPaletteOpen(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
            </div>
            <input 
              type="text" 
              placeholder="Search page, dispatch campaigns, generate caption..." 
              className="w-full bg-[#141416] border border-[#2D2D30] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#E3B859]"
            />
            <div className="space-y-1 text-xs text-gray-400">
              <div className="p-2.5 hover:bg-[#2D2D30] rounded-lg cursor-pointer flex justify-between">
                <span>Compose outbound scheduled post</span>
                <span className="font-mono text-[10px] text-gray-500">⌘P</span>
              </div>
              <div className="p-2.5 hover:bg-[#2D2D30] rounded-lg cursor-pointer flex justify-between">
                <span>Open unified conversation inbox</span>
                <span className="font-mono text-[10px] text-gray-500">⌘I</span>
              </div>
              <div className="p-2.5 hover:bg-[#2D2D30] rounded-lg cursor-pointer flex justify-between">
                <span>Run manual campaign workflows</span>
                <span className="font-mono text-[10px] text-gray-500">⌘W</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sidebar Panel */}
      <aside className="w-64 border-r border-[#252528] bg-[#18181A] flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Workspace Switcher */}
          <div className="p-5 border-b border-[#252528] space-y-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Active Workspace</span>
            <div className="relative">
              <select
                value={activeWorkspace}
                onChange={(e) => setActiveWorkspace(e.target.value)}
                className="w-full bg-[#141416] border border-[#2D2D30] focus:border-[#E3B859] text-xs font-bold text-white px-3 py-2.5 rounded-xl appearance-none focus:outline-none cursor-pointer"
              >
                <option value="Zarss Marketing Workspace">Zarss Marketing</option>
                <option value="Personal Sandbox Workspace">Personal Sandbox</option>
                <option value="Client Staging Workspace">Client Staging</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">▼</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors relative ${
                    isActive 
                      ? 'text-[#E3B859] bg-[#222225]' 
                      : 'text-gray-400 hover:bg-[#202022] hover:text-white'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#E3B859] rounded-r" />}
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Global Trigger Actions */}
        <div className="p-4 border-t border-[#252528] space-y-2 bg-[#141416]">
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full bg-[#222225] border border-[#2D2D30] text-gray-300 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            ⚡ Command Palette
          </button>
          <div className="text-[10px] text-gray-500 font-bold uppercase text-center tracking-wider">
            Social Automation Suite
          </div>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#252528] bg-[#18181A] px-6 flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-white text-gray-500">Root</Link>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.href}>
                <span className="text-gray-600">/</span>
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-white">{b.name}</span>
                ) : (
                  <Link href={b.href} className="hover:text-white text-gray-500">{b.name}</Link>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-4">
            {/* Notification placeholder */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-xl border border-[#2D2D30] hover:border-gray-500 flex items-center justify-center bg-[#141416] transition-colors relative"
              >
                <span>🔔</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#18181A]" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 bg-[#1C1C1E] border border-[#2D2D30] rounded-xl w-64 p-4 shadow-xl z-50 text-xs text-gray-300 space-y-2.5">
                  <div className="font-bold text-white border-b border-[#2D2D30] pb-2 uppercase tracking-wider text-[10px]">Unread Alert Logs</div>
                  <div className="p-2 hover:bg-[#222225] rounded-lg">
                    <span className="font-bold block text-white">Post Failed!</span>
                    <span className="text-[10px] text-gray-500">Instagram account needs reauth</span>
                  </div>
                  <div className="p-2 hover:bg-[#222225] rounded-lg">
                    <span className="font-bold block text-white">Approvals Pending</span>
                    <span className="text-[10px] text-gray-500">Scheduled draft for Page review</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-bold text-white border border-[#E3B859]/30 bg-[#E3B859]/10 px-3.5 py-2 rounded-xl">
              🔑 SAAS ADMIN
            </div>
          </div>
        </header>

        {/* Dynamic Inner View Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#141416]">
          {children}
        </main>
      </div>
    </div>
  )
}
