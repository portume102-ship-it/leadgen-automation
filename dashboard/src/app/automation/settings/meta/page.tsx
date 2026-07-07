'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Pre-filled from meta_credentials.txt
const DEFAULT_SETTINGS: Record<string, string> = {
  META_APP_ID: '1942455143138800',
  META_APP_SECRET: '9dcb73e56c8eda32d1871f13b261e66d',
  META_APP_MODE: 'development',
  META_PAGE_ID: '1165738093294228',
  META_PAGE_NAME: 'Smriti',
  META_PAGE_ACCESS_TOKEN: 'EAAbmpxTMhfABRxjOhwXJDe8T0DVmr9QeZABdQRJPM8JFnRSyP0VgizWwGLVFLgDd2EfYW2ZCAx92q0gqnBaBC9609BTMrjffD1OAMNJiUzEgKDT4YZAP0z2ZBN1s0IFtyIiv92cSYbCiI48Q6hYqZB4lh260rL1sjjH3oiTpLK9OUjpRAuier92JTwPyox3bLnZCnZBrVI9BQZDZD',
  INSTAGRAM_APP_ID: '2835270613508208',
  INSTAGRAM_USERNAME: 'smritifyp',
  INSTAGRAM_BUSINESS_ID: '17841411718913026',
  BUSINESS_PORTFOLIO_ID: '3178419585701136',
  META_VERIFY_TOKEN: 'FLOWFYP_VERIFY_TOKEN',
  META_WEBHOOK_CALLBACK_URL: 'https://leadgen-automation-git-beta-agent-harrypeter07s-projects.vercel.app/api/meta/webhook',
  META_OAUTH_REDIRECT_URI: 'https://leadgen-automation-git-beta-agent-harrypeter07s-projects.vercel.app/api/auth/meta/callback',
  META_GRAPH_API_VERSION: 'v23.0',
  META_GRAPH_BASE_URL: 'https://graph.facebook.com',
  META_LONG_LIVED_USER_TOKEN: '',
  META_SYSTEM_USER_ID: '',
  META_SYSTEM_USER_TOKEN: '',
  META_WEBHOOK_SECRET: '',
  META_PAGE_SUBSCRIPTION_ID: '',
  WHATSAPP_PHONE_NUMBER_ID: '',
  WHATSAPP_BUSINESS_ACCOUNT_ID: '',
  WHATSAPP_PERMANENT_TOKEN: '',
}

const SECRET_FIELDS = new Set([
  'META_APP_SECRET',
  'META_PAGE_ACCESS_TOKEN',
  'META_VERIFY_TOKEN',
  'META_WEBHOOK_SECRET',
  'META_LONG_LIVED_USER_TOKEN',
  'META_SYSTEM_USER_TOKEN',
  'WHATSAPP_PERMANENT_TOKEN',
])

interface FieldConfig {
  key: string
  label: string
  description: string
  required?: boolean
}

const SECTIONS: Array<{
  title: string
  icon: string
  fields: FieldConfig[]
}> = [
  {
    title: 'Meta App',
    icon: '🔵',
    fields: [
      { key: 'META_APP_ID', label: 'App ID', description: 'Your Meta Developer App ID', required: true },
      { key: 'META_APP_SECRET', label: 'App Secret', description: 'Secret key for signing API requests', required: true },
      { key: 'META_APP_MODE', label: 'App Mode', description: 'development or live' },
    ]
  },
  {
    title: 'Facebook Page',
    icon: '📘',
    fields: [
      { key: 'META_PAGE_ID', label: 'Page ID', description: 'Numeric Facebook Page ID', required: true },
      { key: 'META_PAGE_NAME', label: 'Page Name', description: 'Display name of your page' },
      { key: 'META_PAGE_ACCESS_TOKEN', label: 'Page Access Token', description: 'Page-scoped access token for Graph API calls', required: true },
      { key: 'META_PAGE_SUBSCRIPTION_ID', label: 'Page Subscription ID', description: 'Webhook subscription ID (auto-filled after subscribe)' },
    ]
  },
  {
    title: 'Instagram',
    icon: '📸',
    fields: [
      { key: 'INSTAGRAM_APP_ID', label: 'Instagram App ID', description: 'Instagram-specific App ID', required: true },
      { key: 'INSTAGRAM_USERNAME', label: 'Username', description: 'Instagram business username (no @)' },
      { key: 'INSTAGRAM_BUSINESS_ID', label: 'Business Account ID', description: 'IG Business Account numeric ID', required: true },
    ]
  },
  {
    title: 'Business Portfolio',
    icon: '💼',
    fields: [
      { key: 'BUSINESS_PORTFOLIO_ID', label: 'Portfolio ID', description: 'Meta Business Portfolio / Manager ID' },
      { key: 'META_SYSTEM_USER_ID', label: 'System User ID', description: 'System User numeric ID for permanent tokens' },
      { key: 'META_SYSTEM_USER_TOKEN', label: 'System User Token', description: 'Permanent access token from System User' },
    ]
  },
  {
    title: 'Webhook',
    icon: '🔗',
    fields: [
      { key: 'META_VERIFY_TOKEN', label: 'Verify Token', description: 'Token for Meta webhook verification challenge', required: true },
      { key: 'META_WEBHOOK_CALLBACK_URL', label: 'Callback URL', description: 'Webhook endpoint URL registered in Meta Dashboard', required: true },
      { key: 'META_WEBHOOK_SECRET', label: 'Webhook Secret', description: 'App secret for HMAC payload signature verification' },
    ]
  },
  {
    title: 'OAuth',
    icon: '🔑',
    fields: [
      { key: 'META_OAUTH_REDIRECT_URI', label: 'OAuth Redirect URI', description: 'Authorized callback URL for OAuth code exchange', required: true },
      { key: 'META_LONG_LIVED_USER_TOKEN', label: 'Long-Lived User Token', description: '60-day token from OAuth code exchange' },
    ]
  },
  {
    title: 'Graph API',
    icon: '⚡',
    fields: [
      { key: 'META_GRAPH_API_VERSION', label: 'API Version', description: 'e.g. v23.0', required: true },
      { key: 'META_GRAPH_BASE_URL', label: 'Base URL', description: 'e.g. https://graph.facebook.com', required: true },
    ]
  },
  {
    title: 'WhatsApp Cloud API',
    icon: '💬',
    fields: [
      { key: 'WHATSAPP_PHONE_NUMBER_ID', label: 'Phone Number ID', description: 'WA Cloud API Phone Number ID' },
      { key: 'WHATSAPP_BUSINESS_ACCOUNT_ID', label: 'Business Account ID (WABA ID)', description: 'WhatsApp Business Account ID' },
      { key: 'WHATSAPP_PERMANENT_TOKEN', label: 'Permanent Token', description: 'Permanent system-user access token for WA Cloud API' },
    ]
  },
]

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: string
  onChange: (key: string, val: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const isSecret = SECRET_FIELDS.has(field.key)
  const [copying, setCopying] = useState(false)

  function handleCopy() {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopying(true)
    setTimeout(() => setCopying(false), 1200)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="p-4 bg-[#141416] border border-[#2D2D30]/80 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">{field.key}</span>
          <span className="text-xs font-bold text-white">{field.label} {field.required && <span className="text-red-400">*</span>}</span>
        </div>
        <div className="flex items-center gap-2">
          {isSecret && (
            <button
              onClick={() => setVisible(v => !v)}
              className="p-1.5 rounded-lg bg-[#222225] border border-[#2D2D30] text-gray-400 hover:text-white transition-colors text-xs"
              title={visible ? 'Hide' : 'Reveal'}
            >
              {visible ? '🙈' : '👁️'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[#222225] border border-[#2D2D30] text-gray-400 hover:text-white transition-colors text-xs"
            title="Copy"
          >
            {copying ? '✓' : '📋'}
          </button>
        </div>
      </div>
      <input
        type={isSecret && !visible ? 'password' : 'text'}
        value={value}
        onChange={e => onChange(field.key, e.target.value)}
        placeholder={value ? undefined : `Enter ${field.label}...`}
        className="w-full bg-[#0E0E10] border border-[#2D2D30] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
      />
      <p className="text-[10px] text-gray-500">{field.description}</p>
    </div>
  )
}

export default function MetaSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, { status: string; ms: number; detail: string }>>({})
  const [testing, setTesting] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('Meta App')

  function handleChange(key: string, val: string) {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    const toastId = toast.loading('Saving Meta configuration...')
    try {
      const res = await fetch('/api/meta/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Configuration saved successfully!', { id: toastId })
      } else {
        throw new Error(data.error || 'Failed to save settings.')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed.', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest(target: string, endpoint: string) {
    setTesting(target)
    const start = Date.now()
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      const data = await res.json()
      const ms = Date.now() - start
      setTestResults(prev => ({
        ...prev,
        [target]: {
          status: res.ok ? 'success' : 'error',
          ms,
          detail: data.message || data.error || JSON.stringify(data).slice(0, 120)
        }
      }))
      if (res.ok) toast.success(`${target} test passed!`)
      else toast.error(`${target} test failed.`)
    } catch {
      const ms = Date.now() - start
      setTestResults(prev => ({
        ...prev,
        [target]: { status: 'error', ms, detail: 'Network error or API unreachable.' }
      }))
      toast.error(`${target} test errored.`)
    } finally {
      setTesting(null)
    }
  }

  const currentSection = SECTIONS.find(s => s.title === activeSection)!

  return (
    <div className="space-y-6 text-white select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2D2D30] pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">⚙️ Meta Configuration</h1>
          <p className="mt-1 text-sm text-gray-500">Manage App credentials, OAuth tokens, webhooks, and Graph API settings. All secrets are encrypted in the database.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/automation/testing"
            className="px-4 py-2.5 rounded-xl bg-[#222225] border border-[#2D2D30] text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
          >
            🧪 Test Console
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] disabled:opacity-40 text-[#141416] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {saving ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-44 flex-shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.title}
              onClick={() => setActiveSection(s.title)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-left ${
                activeSection === s.title
                  ? 'bg-[#222225] text-white border border-[#2D2D30]'
                  : 'text-gray-500 hover:text-white hover:bg-[#1A1A1C]'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </aside>

        {/* Right panel */}
        <div className="flex-1 space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2D2D30]">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-lg">{currentSection.icon}</span>
              {currentSection.title} Settings
            </h2>
            <button
              onClick={() => handleTest(
                currentSection.title,
                `/api/meta/test?target=${currentSection.title.toLowerCase().replace(' ', '_')}`
              )}
              disabled={testing === currentSection.title}
              className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-900/30 text-purple-400 hover:bg-purple-900/30 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
            >
              {testing === currentSection.title ? 'Testing...' : '⚡ Test Section'}
            </button>
          </div>

          {/* Test result */}
          {testResults[currentSection.title] && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-3 ${
              testResults[currentSection.title].status === 'success'
                ? 'bg-green-950/30 border-green-900/40 text-green-400'
                : 'bg-red-950/30 border-red-900/40 text-red-400'
            }`}>
              <span>{testResults[currentSection.title].status === 'success' ? '✓' : '✗'}</span>
              <span>{testResults[currentSection.title].detail}</span>
              <span className="ml-auto text-gray-500">{testResults[currentSection.title].ms}ms</span>
            </div>
          )}

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {currentSection.fields.map(field => (
              <FieldRow
                key={field.key}
                field={field}
                value={settings[field.key] || ''}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection Test Buttons */}
      <div className="border-t border-[#2D2D30] pt-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">🧪 Quick Connection Tests</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Test Meta App', target: 'meta_app', icon: '🔵' },
            { label: 'Test Facebook Page', target: 'facebook', icon: '📘' },
            { label: 'Test Instagram', target: 'instagram', icon: '📸' },
            { label: 'Test Webhook', target: 'webhook', icon: '🔗' },
          ].map(btn => (
            <button
              key={btn.target}
              onClick={() => handleTest(btn.target, `/api/meta/test?target=${btn.target}`)}
              disabled={testing === btn.target}
              className="p-4 rounded-xl bg-[#18181A] border border-[#2D2D30] hover:border-gray-500 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-40"
            >
              <span>{btn.icon}</span>
              {testing === btn.target ? 'Testing...' : btn.label}
            </button>
          ))}
        </div>

        {/* Test result log */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 rounded-xl bg-[#0E0E10] border border-[#2D2D30] p-4 space-y-2 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Test Logs</span>
            {Object.entries(testResults).map(([key, r]) => (
              <div key={key} className={`flex items-center gap-3 text-xs font-mono ${r.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                <span>{r.status === 'success' ? '✓' : '✗'}</span>
                <span className="text-gray-400">[{key}]</span>
                <span className="flex-1 truncate">{r.detail}</span>
                <span className="text-gray-500 flex-shrink-0">{r.ms}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
