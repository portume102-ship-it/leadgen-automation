import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const n8nWebhookBaseUrl = process.env.N8N_WEBHOOK_BASE_URL
  if (!n8nWebhookBaseUrl) {
    return NextResponse.json({ error: 'N8N_WEBHOOK_BASE_URL not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    
    // POST to n8n webhook directly
    // Format: POST N8N_WEBHOOK_BASE_URL/webhook/leads
    const url = `${n8nWebhookBaseUrl.replace(/\/$/, '')}/webhook/leads`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lead: body }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `n8n webhook error: ${errorText}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit lead to n8n webhook'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
