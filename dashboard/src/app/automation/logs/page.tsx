'use client'

import React from 'react'

export default function AuditLogsPage() {
  const logs = [
    { id: '1', user: 'Operator LeadGen', action: 'Connected Facebook Page', details: 'Authorized page "Zarss Dev Singapore" (ID: 902814892) via OAuth flow.', ip: '192.168.1.1', date: 'Jul 6, 2026 at 9:14 PM' },
    { id: '2', user: 'AI Assistant', action: 'Message Drafted', details: 'Generated caption recommendation for scheduled Instagram post.', ip: '10.0.4.12', date: 'Jul 6, 2026 at 8:40 PM' },
    { id: '3', user: 'n8n Master Orchestrator', action: 'Webhook Event Processed', details: 'Dispatched leads intake webhook event to database leads table.', ip: '157.240.22.1', date: 'Jul 6, 2026 at 7:55 PM' },
    { id: '4', user: 'Operator LeadGen', action: 'Campaign Created', details: 'Created Singapore Cafe Walkthrough visual post schedule.', ip: '192.168.1.1', date: 'Jul 5, 2026 at 4:30 PM' },
    { id: '5', user: 'System Worker', action: 'Token Refreshed', details: 'Refreshed access token for Instagram account @zarss_dev.', ip: '127.0.0.1', date: 'Jul 5, 2026 at 12:00 PM' },
  ]

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500 font-medium">Review workspace actions, secure permission changes, API credential token updates, and campaign dispatches.</p>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-[#2D2D30] bg-[#18181A] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#2D2D30] flex justify-between items-center bg-[#18181A]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">📋 Activity Audit Trail</h3>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Showing last 5 logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141416] text-gray-500 uppercase tracking-wider text-[10px] font-bold border-b border-[#2D2D30]">
                <th className="p-4 pl-6">Operator</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 pr-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D30]/40 font-medium text-gray-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#202022] transition-colors">
                  <td className="p-4 pl-6 font-bold text-white">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 max-w-sm truncate leading-relaxed">{log.details}</td>
                  <td className="p-4 font-mono text-gray-500">{log.ip}</td>
                  <td className="p-4 pr-6 text-gray-500 font-bold uppercase tracking-wider">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
