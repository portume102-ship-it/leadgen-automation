'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function ScraperPage() {
  // Mode 1 - CLI State
  const [keyword, setKeyword] = useState('dentist')
  const [city, setCity] = useState('Mumbai')
  const [maxLeads, setMaxLeads] = useState(50)

  // Mode 2 - Manual entry state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [leadCity, setLeadCity] = useState('')
  const [category, setCategory] = useState('')
  const [website, setWebsite] = useState('')
  const [addingLead, setAddingLead] = useState(false)

  // CLI Command formatter
  const cliCommand = `python main.py --keyword "${keyword}" --city "${city}" --max ${maxLeads} --send`

  // Helper to copy CLI command
  function handleCopyCommand() {
    navigator.clipboard.writeText(cliCommand)
    toast.success('CLI Command copied to clipboard!')
  }

  // Handle Quick Add manual lead
  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is a required field')
      return
    }

    setAddingLead(true)
    const toastId = toast.loading('Adding lead to n8n intake webhook...')
    try {
      const res = await fetch('/api/leads/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          city: leadCity.trim() || null,
          category: category.trim() || null,
          website: website.trim() || null,
          source: 'manual_entry',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit lead')
      }

      toast.success('Lead added successfully via n8n pipeline!', { id: toastId })
      
      // Clear form
      setName('')
      setPhone('')
      setEmail('')
      setLeadCity('')
      setCategory('')
      setWebsite('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit lead'
      toast.error(message, { id: toastId })
    } finally {
      setAddingLead(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Scraper & Data Entry</h1>
        <p className="mt-1 text-sm text-gray-400">Generate leads via the Google Maps Python scraper CLI or add them manually</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mode 1 - Copy CLI Command */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 flex flex-col justify-between h-full">
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-gray-200 text-lg">🗺️ Run Scraper CLI</h3>
              <p className="text-xs text-gray-400 mt-1">Configure parameters and copy the CLI command to execute on your local machine.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="keyword" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Search Keyword</label>
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. dentist"
                  className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">City</label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxLeads" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Max Leads</label>
              <input
                id="maxLeads"
                type="number"
                value={maxLeads}
                onChange={(e) => setMaxLeads(parseInt(e.target.value, 10) || 10)}
                placeholder="50"
                min="1"
                className="w-24 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="rounded-lg bg-gray-950 border border-gray-800/80 p-4">
              <span className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Terminal Command</span>
              <pre className="text-xs text-purple-300 font-mono overflow-x-auto whitespace-pre-wrap select-all bg-[#0b0f19] p-3 rounded-md border border-purple-950/40">
                {cliCommand}
              </pre>
            </div>
          </div>

          <button
            onClick={handleCopyCommand}
            className="mt-6 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white py-2.5 transition-colors"
          >
            📋 Copy Command
          </button>
        </div>

        {/* Mode 2 - Manual Entry (Quick Add) */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 h-full">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-200 text-lg">✏️ Manual Lead Entry</h3>
              <p className="text-xs text-gray-400 mt-1">Submit a single lead directly into the n8n data cleansing and ingestion pipeline.</p>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">Business Name *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Dental Clinic"
                  required
                  className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">Phone</label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. info@acme.com"
                    className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="leadCity" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">City</label>
                  <input
                    id="leadCity"
                    type="text"
                    value={leadCity}
                    onChange={(e) => setLeadCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">Category</label>
                  <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. dentist"
                    className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="website" className="block text-[10px] font-semibold text-gray-400 mb-0.5 uppercase tracking-wider">Website URL</label>
                <input
                  id="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://acmedental.com"
                  className="w-full rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={addingLead}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white py-2.5 mt-4 transition-colors"
              >
                {addingLead && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Add Lead
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
