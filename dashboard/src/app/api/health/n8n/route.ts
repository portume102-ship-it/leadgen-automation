import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const n8nWebhookBaseUrl = process.env.N8N_WEBHOOK_BASE_URL
  if (!n8nWebhookBaseUrl) {
    return NextResponse.json({ connected: false, error: 'N8N_WEBHOOK_BASE_URL not configured' }, { status: 200 })
  }

  // URL could be: https://...
  const url = `${n8nWebhookBaseUrl.replace(/\/$/, '')}/healthz`

  try {
    const headers: Record<string, string> = {}
    if (process.env.N8N_BASIC_AUTH) {
      headers['Authorization'] = `Basic ${process.env.N8N_BASIC_AUTH}`
    }

    const res = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ connected: false, status: res.status }, { status: 200 })
    }

    return NextResponse.json({ connected: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'n8n service unreachable'
    return NextResponse.json({
      connected: false,
      error: message,
    }, { status: 200 })
  }
}
