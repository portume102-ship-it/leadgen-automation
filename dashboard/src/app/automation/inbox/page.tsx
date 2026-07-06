'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function SocialInboxPage() {
  const [selectedThread, setSelectedThread] = useState('1')
  const [replyText, setReplyText] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)

  const threads = [
    { id: '1', name: 'Singapore Cafe Coffee', lastMessage: 'Would love to see the website mockup layout!', time: '10m ago', platform: 'whatsapp', unread: true },
    { id: '2', name: 'Zarss Tester Page', lastMessage: 'How do I integrate the API keys?', time: '1h ago', platform: 'messenger', unread: false },
    { id: '3', name: '@restaurant_sg', lastMessage: 'Is this redesign free or paid?', time: '3h ago', platform: 'instagram', unread: true },
  ]

  const chatMessages: Record<string, { sender: 'lead' | 'system'; body: string; time: string }[]> = {
    '1': [
      { sender: 'system', body: 'Hey Singapore Cafe Coffee! We made a free modern mockup for your website showing a 3x speed improvement. Want to check it out?', time: '11:00 AM' },
      { sender: 'lead', body: 'Hey! Oh wow, that sounds interesting. Would love to see the website mockup layout!', time: '11:05 AM' }
    ],
    '2': [
      { sender: 'lead', body: 'Hey there! How do I integrate the API keys?', time: '10:00 AM' }
    ],
    '3': [
      { sender: 'system', body: 'Hi! Spotted some SEO bugs on your Instagram landing page. We generated a free design proposal for your cafe. Let us know if you want to inspect it.', time: '9:00 AM' },
      { sender: 'lead', body: 'Is this redesign free or paid?', time: '9:15 AM' }
    ]
  }

  const currentMessages = chatMessages[selectedThread] || []

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    toast.success('Message dispatched to platform adapter!')
    setReplyText('')
  }

  const handleGenerateAIResponse = () => {
    setAiGenerating(true)
    toast.loading('Gemini draft suggestion loading...', { duration: 2000 })
    setTimeout(() => {
      setReplyText("It is completely free! We build a custom home page design to show you the performance improvements first. If you like it, we can discuss the full redesign packages. Shall I send over the link?")
      setAiGenerating(false)
      toast.success('AI Response drafted!')
    }, 2000)
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Unified Social Inbox</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Manage cross-channel WhatsApp, Instagram DMs, and Messenger incoming customer support chats in a single viewport.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 border border-[#2D2D30] rounded-2xl overflow-hidden bg-[#18181A] h-[600px]">
        {/* Left column: Conversation list */}
        <div className="border-r border-[#2D2D30] flex flex-col divide-y divide-[#2D2D30]">
          <div className="p-4 bg-[#141416]">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-[#18181A] border border-[#2D2D30] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#E3B859]"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2D2D30]/60">
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedThread(t.id)}
                className={`p-4 cursor-pointer hover:bg-[#202022] transition-colors text-xs space-y-1.5 relative ${
                  selectedThread === t.id ? 'bg-[#222225]' : ''
                }`}
              >
                {t.unread && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />}
                <div className="flex justify-between items-center pr-4">
                  <span className="font-bold text-white block">{t.name}</span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t.time}</span>
                </div>
                <p className="text-gray-400 truncate leading-relaxed">{t.lastMessage}</p>
                <span className="inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                  {t.platform.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center column: Active chat workspace */}
        <div className="md:col-span-2 flex flex-col justify-between h-full bg-[#141416]">
          {/* Chat header */}
          <div className="p-4 border-b border-[#2D2D30] bg-[#18181A] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-white block">
                {threads.find((t) => t.id === selectedThread)?.name || 'Thread'}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 block">
                Connected to WhatsApp Cloud API
              </span>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg bg-gray-800 text-white hover:bg-gray-700 font-bold uppercase tracking-wider text-[10px]">
              Resolve Chat
            </button>
          </div>

          {/* Chat message history bubbles */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {currentMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-4 rounded-2xl max-w-sm text-xs leading-relaxed ${
                  msg.sender === 'lead'
                    ? 'bg-[#18181A] text-gray-200 border border-[#2D2D30]'
                    : 'bg-[#E3B859] text-[#141416] font-medium'
                }`}>
                  <p>{msg.body}</p>
                  <span className={`text-[8px] font-bold uppercase block mt-1.5 text-right ${
                    msg.sender === 'lead' ? 'text-gray-500' : 'text-gray-900/60'
                  }`}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat reply input form */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-[#2D2D30] bg-[#18181A] space-y-3.5">
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#141416] border border-[#2D2D30] focus:border-[#E3B859] rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors resize-none"
              placeholder="Type message reply to prospect..."
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleGenerateAIResponse}
                disabled={aiGenerating}
                className="text-[#E3B859] hover:text-[#d4ac50] text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
              >
                ✨ Suggest AI Response
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] text-[#141416] text-xs font-bold uppercase tracking-wider px-5 py-2.5 transition-colors shadow-md"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Lead Context / AI Assistant recommendations */}
        <div className="p-5 space-y-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">🎯 Lead Profile Details</h3>
          
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#141416] border border-[#2D2D30]/60 rounded-xl space-y-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Target Audit website</span>
              <span className="font-bold text-white block truncate hover:underline cursor-pointer">singaporecafe.sg</span>
              <span className="text-[9px] bg-red-950/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">SEO errors detected</span>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">AI Observations</span>
              <div className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl space-y-2 leading-relaxed text-[11px] text-gray-400">
                <div>• Website load latency: 5.4 seconds (slow)</div>
                <div>• Mobile responsive menu overlap bugs</div>
                <div>• Missing SSL certificate config</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Objections raised</span>
              <div className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl space-y-2 leading-relaxed text-[11px] text-gray-400">
                <div>• Is there any hidden configuration fee?</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
