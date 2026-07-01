'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { QRCodeSVG } from 'qrcode.react'
import { supabaseBrowser } from '@/lib/supabase'
import type { Lead } from '@/types/lead'

export default function WhatsappManagerPage() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // QR state
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrMessage, setQrMessage] = useState('')
  const [qrCountdown, setQrCountdown] = useState(20)

  // Test message state
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Recent messages state
  const [recentSent, setRecentSent] = useState<Lead[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  // 1. Fetch connection status
  async function fetchStatus() {
    try {
      const res = await fetch('/api/whatsapp/health')
      if (res.ok) {
        const data = await res.json()
        setConnected(data.ready)
      } else {
        setConnected(false)
      }
    } catch {
      setConnected(false)
    } finally {
      setLastChecked(new Date())
      setLoadingStatus(false)
    }
  }

  // 2. Fetch QR code
  async function fetchQrCode() {
    try {
      const res = await fetch('/api/whatsapp/qr')
      if (res.ok) {
        const data = await res.json()
        setQrCode(data.qr)
        setQrMessage(data.message || '')
      }
    } catch {
      setQrMessage('Failed to fetch QR')
    }
  }

  // 3. Fetch recent sent messages
  async function fetchRecentSent() {
    try {
      const { data, error } = await supabaseBrowser
        .from('leads')
        .select('*')
        .not('whatsapp_sent_at', 'is', null)
        .order('whatsapp_sent_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setRecentSent((data ?? []) as Lead[])
    } catch (err) {
      console.error('Error fetching recent sent messages:', err)
    } finally {
      setLoadingRecent(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchRecentSent()

    const statusInterval = setInterval(fetchStatus, 15000)
    const recentInterval = setInterval(fetchRecentSent, 15000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(recentInterval)
    }
  }, [])

  // QR refresh loop (runs only when disconnected)
  useEffect(() => {
    if (connected === true) {
      setQrCode(null)
      return
    }

    fetchQrCode()
    setQrCountdown(20)

    const qrInterval = setInterval(() => {
      fetchQrCode()
      setQrCountdown(20)
    }, 20000)

    const timerInterval = setInterval(() => {
      setQrCountdown((prev) => (prev > 1 ? prev - 1 : 20))
    }, 1000)

    return () => {
      clearInterval(qrInterval)
      clearInterval(timerInterval)
    }
  }, [connected])

  // 4. Send Test Message
  async function sendTestMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!testPhone.trim() || !testMessage.trim()) {
      toast.error('Phone and message are required')
      return
    }

    // digits only verification
    const digitsOnly = testPhone.replace(/\D/g, '')
    if (!digitsOnly) {
      toast.error('Please enter a valid phone number (digits only)')
      return
    }

    setSendingTest(true)
    const toastId = toast.loading('Sending test WhatsApp message...')
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digitsOnly, message: testMessage }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast.success('Test message sent successfully!', { id: toastId })
      setTestMessage('')
      fetchRecentSent()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
      toast.error(message, { id: toastId })
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">WhatsApp Manager</h1>
        <p className="mt-1 text-sm text-gray-400">Configure and monitor your WhatsApp client outreach service</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1 - Connection Status */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-bold text-gray-200 text-lg mb-4">Connection Status</h3>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {connected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </>
                )}
              </span>
              <span className="text-lg font-bold text-white">
                {loadingStatus ? 'Checking...' : connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <button
            onClick={() => {
              setLoadingStatus(true)
              fetchStatus()
              fetchRecentSent()
              toast.success('Status refreshed')
            }}
            className="mt-6 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 text-sm font-semibold text-white py-2.5 transition-colors"
          >
            Refresh Status
          </button>
        </div>

        {/* Section 2 - QR Code (only shown when disconnected) */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col items-center justify-center min-h-[300px]">
          {connected === true ? (
            <div className="text-center py-6">
              <span className="text-4xl">✅</span>
              <h3 className="font-bold text-white text-lg mt-3">WhatsApp Connected</h3>
              <p className="text-xs text-gray-400 mt-2">No QR code scanning is needed. Ready to send messages.</p>
            </div>
          ) : qrCode ? (
            <div className="text-center space-y-4">
              <h3 className="font-bold text-white text-md">📱 Scan with WhatsApp</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Open WhatsApp → Linked Devices → Link a Device</p>
              
              <div className="inline-block bg-white p-3 rounded-lg">
                <QRCodeSVG value={qrCode} size={180} bgColor="#ffffff" fgColor="#000000" level="L" />
              </div>
              
              <p className="text-[11px] text-gray-500">
                Refreshing QR in <strong className="text-purple-400">{qrCountdown}s</strong>
              </p>
            </div>
          ) : (
            <div className="text-center py-6 max-w-xs space-y-2">
              <span className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" />
              <h3 className="font-bold text-white text-sm">Generating QR Code...</h3>
              <p className="text-xs text-gray-400">{qrMessage || 'Connecting to WhatsApp microservice'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 - Send Test Message */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
        <h3 className="font-bold text-gray-200 text-lg mb-4">Send Test Message</h3>
        <form onSubmit={sendTestMessage} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Recipient Phone</label>
            <input
              id="phone"
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="e.g. 919876543210 (include country code, digits only)"
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Test Message</label>
            <textarea
              id="message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type your test message here..."
              rows={3}
              className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={sendingTest || !connected}
            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold text-white px-6 py-2.5 transition-colors"
          >
            {sendingTest && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Send Test Message
          </button>
          {!connected && (
            <p className="text-xs text-red-400">⚠️ WhatsApp must be connected to send messages.</p>
          )}
        </form>
      </div>

      {/* Section 4 - Recent Sent Messages */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden shadow-2xl">
        <div className="border-b border-gray-800 px-5 py-4 bg-gray-900/60">
          <h3 className="font-bold text-gray-200">Recent Sent Messages (Last 20)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead className="bg-gray-900/40 text-left text-gray-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Phone</th>
                <th className="px-5 py-3.5 font-semibold">Message Preview</th>
                <th className="px-5 py-3.5 font-semibold">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {loadingRecent ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">Loading sent messages history...</td>
                </tr>
              ) : recentSent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500">No messages sent yet.</td>
                </tr>
              ) : (
                recentSent.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-800/10">
                    <td className="px-5 py-3 text-white font-bold">{lead.name}</td>
                    <td className="px-5 py-3 text-gray-300">{lead.phone || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 max-w-[300px] truncate" title={lead.ai_message_whatsapp || ''}>
                      {lead.ai_message_whatsapp || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {lead.whatsapp_sent_at ? formatDistanceToNow(new Date(lead.whatsapp_sent_at), { addSuffix: true }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
