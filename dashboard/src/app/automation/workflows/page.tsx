'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function WorkflowsBuilderPage() {
  const [runningId, setRunningId] = useState<string | null>(null)

  const workflows = [
    { id: 'wf-1', name: 'Outreach Master Orchestrator V4', status: 'active', type: 'n8n Webhook', desc: 'Syncs qualified leads from DB and orchestrates WhatsApp / Email response trees.' },
    { id: 'wf-2', name: 'Start Discovery Batch Queue', status: 'active', type: 'n8n Http POST', desc: 'Executes Google Maps scraper combinations and registers new Qualified leads.' },
    { id: 'wf-3', name: 'Ghost Lead Cleanup cron', status: 'inactive', type: 'Schedule Cron', desc: 'Detects cold conversation sequences every 6 hours and updates state to inactive.' },
  ]

  const executions = [
    { id: 'ex-1092', workflow: 'Outreach Master Orchestrator V4', event: 'inbound_message', time: '5m ago', status: 'completed', duration: '14.2s' },
    { id: 'ex-1091', workflow: 'Start Discovery Batch Queue', event: 'manual_trigger', time: '45m ago', status: 'completed', duration: '124.8s' },
    { id: 'ex-1090', workflow: 'Outreach Master Orchestrator V4', event: 'lead_intake', time: '2h ago', status: 'failed', duration: '4.1s', error: 'WhatsApp service socket offline' },
    { id: 'ex-1089', workflow: 'Ghost Lead Cleanup cron', event: 'schedule_cron', time: '6h ago', status: 'completed', duration: '2.5s' },
  ]

  const handleRunWorkflow = (id: string, name: string) => {
    setRunningId(id)
    const toastId = toast.loading(`Triggering manual run of: ${name}...`)
    setTimeout(() => {
      setRunningId(null)
      toast.success('Workflow executed successfully. Log: ex-1093 created!', { id: toastId })
    }, 2000)
  }

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">n8n Workflow Builder</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Orchestrate visual workflow pipelines, monitor webhook trigger execution statuses, and view error stack traces.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Columns: Configured workflows */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">⚙️ Configured Pipelines</h3>
            
            <div className="space-y-4">
              {workflows.map(wf => (
                <div key={wf.id} className="p-4 bg-[#141416] border border-[#2D2D30] rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{wf.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        wf.status === 'active' ? 'bg-green-950/40 text-green-400 border border-green-900/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>{wf.status}</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed font-semibold">{wf.desc}</p>
                    <span className="inline-block text-[9px] text-[#E3B859] bg-[#E3B859]/10 border border-[#E3B859]/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono font-bold mt-1.5">{wf.type}</span>
                  </div>

                  <button
                    onClick={() => handleRunWorkflow(wf.id, wf.name)}
                    disabled={runningId !== null || wf.status !== 'active'}
                    className="rounded-xl bg-[#E3B859] hover:bg-[#d4ac50] text-[#141416] text-[10px] font-black uppercase tracking-wider px-4 py-2.5 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
                  >
                    {runningId === wf.id ? 'Running...' : '⚡ Run Now'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Execution History logs */}
        <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#2D2D30] pb-2">📋 Executions Log</h3>
          
          <div className="space-y-3.5">
            {executions.map((ex, i) => (
              <div key={i} className="p-3 bg-[#141416] border border-[#2D2D30]/60 rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{ex.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    ex.status === 'completed' ? 'bg-green-950/40 text-green-400' : 'bg-red-950/20 text-red-400 border border-red-900/30'
                  }`}>{ex.status}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">{ex.workflow}</span>
                  <p className="text-gray-400 font-semibold mt-0.5 leading-normal">Trigger: {ex.event}</p>
                </div>
                {ex.error && (
                  <p className="text-[10px] text-red-400 font-mono bg-red-950/20 border border-red-900/30 p-2 rounded-lg leading-relaxed">
                    Error: {ex.error}
                  </p>
                )}
                <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-1.5 border-t border-[#2D2D30]/40">
                  <span>Duration: {ex.duration}</span>
                  <span>{ex.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
